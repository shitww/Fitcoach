// ── FitCoach V2 — Fatigue Detection Engine ────────────────────────────────
// Detects training fatigue from volume trends, rep degradation, and frequency.
// No medical claims. Training-tool tone only.

import type {
  ExerciseHistory,
  FatigueSignal,
  UserTrainingContext,
  RecentWorkout,
} from './trainingTypes';
import {
  volumeTrend,
  avgRepsAtMaxWeight,
  muscleGroupFrequency,
  isHighFrequencyStreak,
} from './trainingSignals';

// ── Thresholds ─────────────────────────────────────────────────────────────

const VOLUME_DECLINE_SESSIONS = 3; // look at last N sessions
const REP_DECLINE_SESSIONS = 3;
const HIGH_FREQ_DAYS = 7;
const HIGH_FREQ_THRESHOLD = 4; // same muscle group N times in window
const STREAK_THRESHOLD = 5;

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Check a single exercise for localized fatigue signals.
 */
export function detectExerciseFatigue(
  history: ExerciseHistory
): FatigueSignal | null {
  if (history.sessions.length < 2) return null;

  const recent = history.sessions.slice(-VOLUME_DECLINE_SESSIONS);

  // 1. Volume decline across last sessions
  const trend = volumeTrend(history, VOLUME_DECLINE_SESSIONS);
  if (trend === 'down') {
    const latestVol = recent[recent.length - 1]?.totalVolume ?? 0;
    const prevVol = recent[0]?.totalVolume ?? 1;
    const dropPct = Math.round(((prevVol - latestVol) / prevVol) * 100);
    return {
      level: 'moderate',
      reason: `最近 ${recent.length} 次训练容量持续下降（约 ${dropPct}%）`,
      affectedMuscleGroups: history.muscleGroup
        ? [history.muscleGroup]
        : undefined,
      suggestion:
        '建议维持当前重量，优先保证动作质量与恢复',
    };
  }

  // 2. Reps at max weight declining
  const { avgReps: recentAvgReps, sessionCount: recentCount } = avgRepsAtMaxWeight(
    history,
    REP_DECLINE_SESSIONS
  );
  if (recentCount >= 2) {
    const older = history.sessions.slice(
      -REP_DECLINE_SESSIONS * 2,
      -REP_DECLINE_SESSIONS
    );
    if (older.length >= 2) {
      let olderTotalReps = 0;
      let olderWeightSum = 0;
      let olderCount = 0;
      for (const sess of older) {
        const workSets = sess.sets.filter((s) => s.weight > 0);
        if (workSets.length === 0) continue;
        const maxW = Math.max(...workSets.map((s) => s.weight));
        const setsAtMax = workSets.filter((s) => s.weight === maxW);
        olderTotalReps +=
          setsAtMax.reduce((s, set) => s + set.reps, 0) / setsAtMax.length;
        olderWeightSum += maxW;
        olderCount++;
      }
      const olderAvgReps = olderCount > 0 ? olderTotalReps / olderCount : recentAvgReps;
      if (recentAvgReps < olderAvgReps - 1.5) {
        return {
          level: 'mild',
          reason: `同重量次数下滑（${olderAvgReps.toFixed(1)} → ${recentAvgReps.toFixed(1)} 次）`,
          affectedMuscleGroups: history.muscleGroup
            ? [history.muscleGroup]
            : undefined,
          suggestion: '建议维持重量，关注动作控制与休息',
        };
      }
    }
  }

  return null;
}

/**
 * Check for systemic / whole-body fatigue signals.
 */
export function detectSystemicFatigue(
  context: UserTrainingContext,
  muscleMap: Map<string, string>
): FatigueSignal | null {
  // 1. High-frequency streak
  if (isHighFrequencyStreak(context, STREAK_THRESHOLD)) {
    return {
      level: 'elevated',
      reason: `连续训练 ${context.currentStreak} 天，身体累积疲劳增加`,
      suggestion: '建议安排主动恢复日或降低今日训练量',
    };
  }

  // 2. Single muscle group overuse
  const freq = muscleGroupFrequency(
    context.recentWorkouts,
    muscleMap,
    HIGH_FREQ_DAYS
  );
  for (const [mg, count] of freq.entries()) {
    if (count >= HIGH_FREQ_THRESHOLD) {
      return {
        level: 'moderate',
        reason: `最近 ${HIGH_FREQ_DAYS} 天 ${mg} 训练 ${count} 次，频率偏高`,
        affectedMuscleGroups: [mg],
        suggestion: `建议给 ${mg} 更多恢复时间，或更换训练部位`,
      };
    }
  }

  // 3. Recent volume spike (last 3 sessions avg vs prior avg)
  const last3 = context.recentWorkouts.slice(-3);
  const prior3 = context.recentWorkouts.slice(-6, -3);
  if (last3.length >= 2 && prior3.length >= 2) {
    const lastAvg =
      last3.reduce((s, w) => s + w.totalVolume, 0) / last3.length;
    const priorAvg =
      prior3.reduce((s, w) => s + w.totalVolume, 0) / prior3.length;
    if (priorAvg > 0 && lastAvg > priorAvg * 1.35) {
      return {
        level: 'moderate',
        reason: '近期训练容量突增',
        suggestion: '容量提升较快，注意监控恢复状态',
      };
    }
  }

  return null;
}

/**
 * Aggregate fatigue check — returns highest-priority signal or null.
 */
export function detectFatigue(
  history: ExerciseHistory | null,
  context: UserTrainingContext,
  muscleMap: Map<string, string>
): FatigueSignal | null {
  // Systemic first (more urgent)
  const systemic = detectSystemicFatigue(context, muscleMap);
  if (systemic && (systemic.level === 'elevated' || systemic.level === 'moderate')) {
    return systemic;
  }

  const local = history ? detectExerciseFatigue(history) : null;

  // Return whichever is more severe
  const severityRank = { none: 0, mild: 1, moderate: 2, elevated: 3 };
  const localRank = local ? severityRank[local.level] : 0;
  const systemicRank = systemic ? severityRank[systemic.level] : 0;

  if (systemicRank >= localRank) return systemic;
  return local;
}
