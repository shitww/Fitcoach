// ── FitCoach Phase 3 — Signal Engine ────────────────────────────────────────
// Generates canonical TrainingSignals from raw training data.
// All downstream engines consume these signals — not raw data directly.

import type {
  ExerciseHistory,
  UserTrainingContext,
} from '../trainingTypes';
import {
  volumeTrend,
  avgRepsAtMaxWeight,
  failureRateAtMaxWeight,
  muscleGroupFrequency,
  estimate1RM,
} from '../trainingSignals';
import type { TrainingSignal, TrainingSignalType } from './signalTypes';
import { computeExerciseConfidence, adjustConfidence } from './signalConfidence';

// ── Configuration ──────────────────────────────────────────────────────────

const PLATEAU_SESSIONS = 5; // how many sessions to check for plateau
const PLATEAU_THRESHOLD_PCT = 3; // weight change <3% = plateau
const NEGLECTED_DAYS = 14; // muscle group not trained in N days
const IMBALANCE_RATIO = 2.5; // one muscle group trained X times more

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Generate all training signals from exercise histories + user context.
 */
export function generateSignals(
  histories: ExerciseHistory[],
  context: UserTrainingContext,
  muscleMap: Map<string, string>
): TrainingSignal[] {
  const signals: TrainingSignal[] = [];

  for (const history of histories) {
    const conf = computeExerciseConfidence(history);
    signals.push(...volumeSignals(history, conf));
    signals.push(...performanceSignals(history, conf));
  }

  signals.push(...frequencySignals(histories, context, muscleMap));
  signals.push(...fatigueSignals(histories, context, muscleMap));
  signals.push(...profileSignals(histories, context));

  return signals.sort((a, b) => b.confidence - a.confidence);
}

// ── Volume Signals ─────────────────────────────────────────────────────────

function volumeSignals(
  history: ExerciseHistory,
  confidence: number
): TrainingSignal[] {
  const out: TrainingSignal[] = [];
  if (history.sessions.length < 2) return out;

  const trend = volumeTrend(history, 4);
  if (trend === 'up') {
    out.push({
      type: 'volume_rising',
      source: 'volume',
      confidence: adjustConfidence(confidence, 0.9),
      severity: 'positive',
      reason: `${history.exerciseName} 容量上升趋势`,
      affectedExercises: [history.exerciseName],
    });
  } else if (trend === 'down') {
    out.push({
      type: 'volume_falling',
      source: 'volume',
      confidence: adjustConfidence(confidence, 0.85),
      severity: 'attention',
      reason: `${history.exerciseName} 容量下降`,
      affectedExercises: [history.exerciseName],
    });
  } else {
    out.push({
      type: 'volume_stable',
      source: 'volume',
      confidence: adjustConfidence(confidence, 0.7),
      severity: 'neutral',
      reason: `${history.exerciseName} 容量稳定`,
      affectedExercises: [history.exerciseName],
    });
  }

  // Volume spike check
  const last3 = history.sessions.slice(-3);
  const prior3 = history.sessions.slice(-6, -3);
  if (last3.length >= 2 && prior3.length >= 2) {
    const lastAvg = last3.reduce((s, sess) => s + sess.totalVolume, 0) / last3.length;
    const priorAvg = prior3.reduce((s, sess) => s + sess.totalVolume, 0) / prior3.length;
    if (priorAvg > 0 && lastAvg > priorAvg * 1.5) {
      out.push({
        type: 'volume_spike',
        source: 'volume',
        confidence: adjustConfidence(confidence, 0.8),
        severity: 'attention',
        reason: `${history.exerciseName} 容量突增 ${Math.round((lastAvg / priorAvg - 1) * 100)}%`,
        affectedExercises: [history.exerciseName],
      });
    }
  }

  return out;
}

// ── Performance Signals ────────────────────────────────────────────────────

function performanceSignals(
  history: ExerciseHistory,
  confidence: number
): TrainingSignal[] {
  const out: TrainingSignal[] = [];
  if (history.sessions.length < 2) return out;

  const { avgReps: recentReps, avgWeight: recentWeight } = avgRepsAtMaxWeight(history, 4);
  const failRate = failureRateAtMaxWeight(history, 4);

  // Reps declining
  if (history.sessions.length >= 4) {
    const older = history.sessions.slice(-8, -4);
    if (older.length >= 2) {
      let olderReps = 0;
      let olderCount = 0;
      for (const sess of older) {
        const workSets = sess.sets.filter((s) => s.weight > 0);
        if (workSets.length === 0) continue;
        const maxW = Math.max(...workSets.map((s) => s.weight));
        const setsAtMax = workSets.filter((s) => s.weight === maxW);
        olderReps += setsAtMax.reduce((s, set) => s + set.reps, 0) / setsAtMax.length;
        olderCount++;
      }
      const olderAvg = olderCount > 0 ? olderReps / olderCount : recentReps;
      if (recentReps < olderAvg - 1.5) {
        out.push({
          type: 'reps_declining',
          source: 'performance',
          confidence: adjustConfidence(confidence, 0.8),
          severity: 'attention',
          reason: `${history.exerciseName} 同重量次数下滑`,
          affectedExercises: [history.exerciseName],
        });
      }
    }
  }

  // Failure rate
  if (failRate >= 0.5) {
    out.push({
      type: 'form_degrading',
      source: 'performance',
      confidence: adjustConfidence(confidence, 0.9),
      severity: 'critical',
      reason: `${history.exerciseName} 近期 ${Math.round(failRate * 100)}% 训练达到力竭`,
      affectedExercises: [history.exerciseName],
    });
  }

  // Plateau detection
  if (history.sessions.length >= PLATEAU_SESSIONS) {
    const recent = history.sessions.slice(-PLATEAU_SESSIONS);
    const maxWeights = recent.map((s) => Math.max(...s.sets.map((set) => set.weight), 0));
    const maxW = Math.max(...maxWeights);
    const minW = Math.min(...maxWeights);
    if (maxW > 0) {
      const changePct = ((maxW - minW) / maxW) * 100;
      if (changePct < PLATEAU_THRESHOLD_PCT) {
        out.push({
          type: 'plateau_detected',
          source: 'performance',
          confidence: adjustConfidence(confidence, 0.75),
          severity: 'neutral',
          reason: `${history.exerciseName} 近 ${PLATEAU_SESSIONS} 次重量无明显变化`,
          affectedExercises: [history.exerciseName],
        });
      }
    }
  }

  // PR streak / progression ready
  const lastSession = history.sessions[history.sessions.length - 1];
  const workSets = lastSession.sets.filter((s) => s.weight > 0);
  if (workSets.length > 0) {
    const maxW = Math.max(...workSets.map((s) => s.weight));
    const setsAtMax = workSets.filter((s) => s.weight === maxW);
    const avgReps = setsAtMax.reduce((s, set) => s + set.reps, 0) / setsAtMax.length;

    if (avgReps >= 10 && failRate < 0.25) {
      out.push({
        type: 'progression_ready',
        source: 'performance',
        confidence: adjustConfidence(confidence, 0.85),
        severity: 'positive',
        reason: `${history.exerciseName} 次数充足，可尝试加重`,
        affectedExercises: [history.exerciseName],
      });
    }

    // Check if recent session has a PR-level set
    const bestAllTime = Math.max(
      ...history.sessions.flatMap((s) => s.sets.map((set) => estimate1RM(set.weight, set.reps)))
    );
    const recentBest = Math.max(...lastSession.sets.map((set) => estimate1RM(set.weight, set.reps)));
    if (recentBest >= bestAllTime * 0.98 && bestAllTime > 0) {
      out.push({
        type: 'pr_streak',
        source: 'performance',
        confidence: adjustConfidence(confidence, 0.9),
        severity: 'positive',
        reason: `${history.exerciseName} 接近或突破力量新高`,
        affectedExercises: [history.exerciseName],
      });
    }
  }

  return out;
}

// ── Frequency Signals ──────────────────────────────────────────────────────

function frequencySignals(
  histories: ExerciseHistory[],
  context: UserTrainingContext,
  muscleMap: Map<string, string>
): TrainingSignal[] {
  const out: TrainingSignal[] = [];

  const freq = muscleGroupFrequency(context.recentWorkouts, muscleMap, 7);
  const mgSessions = new Map<string, number>();
  for (const h of histories) {
    if (!h.muscleGroup) continue;
    mgSessions.set(h.muscleGroup, (mgSessions.get(h.muscleGroup) ?? 0) + h.sessions.length);
  }

  // High frequency
  for (const [mg, count] of freq.entries()) {
    if (count >= 4) {
      out.push({
        type: 'frequency_high',
        source: 'frequency',
        confidence: 0.8,
        severity: 'attention',
        reason: `最近 7 天 ${mg} 训练 ${count} 次`,
        affectedMuscleGroups: [mg],
      });
    }
  }

  // Neglected muscle groups
  for (const [mg, lastDate] of findLastTrainedDates(histories)) {
    const days = daysSince(lastDate);
    if (days >= NEGLECTED_DAYS) {
      out.push({
        type: 'neglected_muscle_group',
        source: 'frequency',
        confidence: 0.75,
        severity: 'neutral',
        reason: `${mg} 已 ${days} 天未训练`,
        affectedMuscleGroups: [mg],
      });
    }
  }

  // Muscle imbalance
  const counts = Array.from(mgSessions.values());
  if (counts.length >= 2) {
    const max = Math.max(...counts);
    const min = Math.min(...counts);
    if (min > 0 && max / min >= IMBALANCE_RATIO) {
      const maxMg = Array.from(mgSessions.entries()).find(([, v]) => v === max)![0];
      const minMg = Array.from(mgSessions.entries()).find(([, v]) => v === min)![0];
      out.push({
        type: 'muscle_imbalance',
        source: 'frequency',
        confidence: 0.7,
        severity: 'attention',
        reason: `${maxMg} 训练量远高于 ${minMg}，建议平衡发展`,
        affectedMuscleGroups: [maxMg, minMg],
      });
    }
  }

  // Consistency
  if (context.currentStreak >= 5) {
    out.push({
      type: 'consistency_high',
      source: 'frequency',
      confidence: 0.9,
      severity: 'positive',
      reason: `连续训练 ${context.currentStreak} 天`,
    });
  } else if (context.daysSinceLastWorkout >= 7) {
    out.push({
      type: 'consistency_low',
      source: 'frequency',
      confidence: 0.85,
      severity: 'attention',
      reason: `已 ${context.daysSinceLastWorkout} 天未训练`,
    });
  }

  return out;
}

// ── Fatigue Signals ────────────────────────────────────────────────────────

function fatigueSignals(
  histories: ExerciseHistory[],
  context: UserTrainingContext,
  _muscleMap: Map<string, string>
): TrainingSignal[] {
  const out: TrainingSignal[] = [];

  // Streak-based systemic fatigue
  if (context.currentStreak >= 5) {
    out.push({
      type: 'fatigue_risk',
      source: 'fatigue',
      confidence: 0.85,
      severity: context.currentStreak >= 7 ? 'critical' : 'attention',
      reason: `连续训练 ${context.currentStreak} 天，累积疲劳风险`,
    });
  }

  // Volume-based fatigue (total across all exercises declining)
  if (histories.length >= 2 && histories.every((h) => h.sessions.length >= 2)) {
    const recentVolumes = histories.map((h) =>
      h.sessions.slice(-2).reduce((s, sess) => s + sess.totalVolume, 0)
    );
    const priorVolumes = histories.map((h) =>
      h.sessions.slice(-4, -2).reduce((s, sess) => s + sess.totalVolume, 0)
    );
    const recentAvg = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
    const priorAvg = priorVolumes.reduce((a, b) => a + b, 0) / priorVolumes.length;
    if (priorAvg > 0 && recentAvg < priorAvg * 0.85) {
      out.push({
        type: 'overreaching_detected',
        source: 'fatigue',
        confidence: 0.75,
        severity: 'attention',
        reason: '近期整体容量下降，可能存在过度训练',
      });
    }
  }

  // Recovery signals
  if (context.daysSinceLastWorkout >= 2 && context.currentStreak === 0) {
    out.push({
      type: 'recovery_good',
      source: 'fatigue',
      confidence: 0.8,
      severity: 'positive',
      reason: `已休息 ${context.daysSinceLastWorkout} 天，恢复良好`,
    });
  } else if (context.daysSinceLastWorkout === 0 && context.currentStreak >= 3) {
    out.push({
      type: 'recovery_low',
      source: 'fatigue',
      confidence: 0.7,
      severity: 'neutral',
      reason: '今日已训练，注意恢复质量',
    });
  }

  return out;
}

// ── Profile Signals ────────────────────────────────────────────────────────

function profileSignals(
  histories: ExerciseHistory[],
  context: UserTrainingContext
): TrainingSignal[] {
  const out: TrainingSignal[] = [];
  const totalSessions = histories.reduce((s, h) => s + h.sessions.length, 0);
  if (totalSessions === 0) return out;

  // Experience level
  if (totalSessions < 10) {
    out.push({
      type: 'beginner_pattern',
      source: 'profile',
      confidence: 0.8,
      severity: 'neutral',
      reason: '训练记录较少，建议专注动作学习与渐进超负荷',
    });
  } else if (totalSessions < 40) {
    out.push({
      type: 'intermediate_pattern',
      source: 'profile',
      confidence: 0.7,
      severity: 'neutral',
      reason: '处于中级阶段，适合周期化训练',
    });
  } else {
    out.push({
      type: 'advanced_pattern',
      source: 'profile',
      confidence: 0.7,
      severity: 'neutral',
      reason: '训练经验丰富，关注恢复与专项提升',
    });
  }

  // Strength vs hypertrophy focus (based on avg reps)
  const allAvgReps: number[] = [];
  for (const h of histories) {
    for (const sess of h.sessions) {
      const workSets = sess.sets.filter((s) => s.weight > 0);
      if (workSets.length > 0) {
        const avg = workSets.reduce((s, set) => s + set.reps, 0) / workSets.length;
        allAvgReps.push(avg);
      }
    }
  }
  if (allAvgReps.length > 0) {
    const globalAvg = allAvgReps.reduce((a, b) => a + b, 0) / allAvgReps.length;
    if (globalAvg <= 5) {
      out.push({
        type: 'strength_focused',
        source: 'profile',
        confidence: 0.75,
        severity: 'neutral',
        reason: '低次数高重量为主，偏力量训练风格',
      });
    } else if (globalAvg >= 10) {
      out.push({
        type: 'hypertrophy_focused',
        source: 'profile',
        confidence: 0.75,
        severity: 'neutral',
        reason: '中高次数为主，偏肌肥大训练风格',
      });
    }
  }

  return out;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function findLastTrainedDates(histories: ExerciseHistory[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const h of histories) {
    if (!h.muscleGroup || h.sessions.length === 0) continue;
    const last = h.sessions[h.sessions.length - 1].date;
    const existing = map.get(h.muscleGroup);
    if (!existing || last > existing) {
      map.set(h.muscleGroup, last);
    }
  }
  return map;
}

function daysSince(dateStr: string): number {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}
