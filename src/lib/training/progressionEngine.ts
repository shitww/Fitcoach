// ── FitCoach V2 — Smart Progression Engine ────────────────────────────────
// Rule-based, explainable progression recommendations.
// No AI. Deterministic. Pure functions.

import type {
  ExerciseHistory,
  HistoricalSet,
  ProgressionRecommendation,
  ProgressionAction,
} from './trainingTypes';
import {
  avgRepsAtMaxWeight,
  failureRateAtMaxWeight,
  volumeTrend,
  estimate1RM,
} from './trainingSignals';

// ── Configuration ──────────────────────────────────────────────────────────

const PLATE_SMALLEST = 1.25; // kg (barbell micro plate)
const PLATE_STANDARD = 2.5;  // kg (standard gym increment)
const REPS_TARGET = 8;       // generic hypertrophy target
const REPS_MIN = 5;
const REPS_MAX = 12;
const FAILURE_THRESHOLD = 0.5; // 50% of recent sessions failing = too much

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Recommend next weight/reps for a given exercise based on its history.
 * Returns null if insufficient data (< 1 session).
 */
export function recommendProgression(
  history: ExerciseHistory
): ProgressionRecommendation | null {
  if (history.sessions.length === 0) return null;

  const latestSession = history.sessions[history.sessions.length - 1];
  const workSets = latestSession.sets.filter((s) => s.weight > 0);
  if (workSets.length === 0) return null;

  const maxWeight = Math.max(...workSets.map((s) => s.weight));
  const setsAtMax = workSets.filter((s) => s.weight === maxWeight);
  const avgRepsLatest =
    setsAtMax.reduce((s, set) => s + set.reps, 0) / setsAtMax.length;

  const { avgReps: avgRepsRecent, avgWeight: avgWeightRecent } =
    avgRepsAtMaxWeight(history, 4);
  const failRate = failureRateAtMaxWeight(history, 4);
  const trend = volumeTrend(history, 4);

  // 1. Safety: high failure rate → deload or maintain
  if (failRate >= FAILURE_THRESHOLD) {
    return buildRec(
      'deload',
      maxWeight,
      avgRepsLatest,
      `最近 ${Math.round(failRate * 100)}% 训练达到力竭，建议降低强度恢复质量`,
      'high'
    );
  }

  // 2. Volume declining → maintain or reduce
  if (trend === 'down' && history.sessions.length >= 3) {
    return buildRec(
      'maintain',
      maxWeight,
      Math.round(avgRepsLatest),
      '近期容量持续下降，先稳定当前重量',
      'high'
    );
  }

  // 3. Reps above target with good margin → increase weight
  if (avgRepsLatest >= REPS_TARGET + 2 && failRate < 0.25) {
    const nextWeight = incrementWeight(maxWeight, avgWeightRecent);
    const nextReps = REPS_TARGET;
    return buildRec(
      'increase',
      nextWeight,
      nextReps,
      `上次完成 ${maxWeight}kg × ${Math.round(avgRepsLatest)} 次，可尝试加重`,
      'high'
    );
  }

  // 4. Reps at or near target → maintain, push for more reps
  if (avgRepsLatest >= REPS_TARGET - 1 && avgRepsLatest < REPS_TARGET + 2) {
    return buildRec(
      'maintain',
      maxWeight,
      Math.round(avgRepsLatest) + 1,
      `本周先稳定 ${maxWeight}kg，尝试做到 ${Math.round(avgRepsLatest) + 1} 次`,
      'medium'
    );
  }

  // 5. Reps below minimum → reduce weight
  if (avgRepsLatest < REPS_MIN) {
    const nextWeight = decrementWeight(maxWeight);
    return buildRec(
      'reduce',
      nextWeight,
      REPS_TARGET,
      `次数偏低，建议降至 ${nextWeight}kg 保证动作质量`,
      'high'
    );
  }

  // 6. Default: maintain
  return buildRec(
    'maintain',
    maxWeight,
    Math.round(avgRepsLatest),
    '建议维持当前重量，专注动作控制',
    'medium'
  );
}

/**
 * Quick recommendation for a brand-new exercise with no history.
 * Uses the user's provided lastRecord (from DB cache).
 */
export function recommendForNewExercise(
  lastRecord: { weight: number; reps: number } | null,
  rirPreference: number = 1
): ProgressionRecommendation {
  if (!lastRecord || lastRecord.weight <= 0 || lastRecord.reps <= 0) {
    return buildRec(
      'maintain',
      0,
      REPS_TARGET,
      '首次训练，从轻重量开始熟悉动作',
      'low'
    );
  }

  const { weight, reps } = lastRecord;

  if (reps >= REPS_TARGET + 2) {
    const next = incrementWeight(weight, weight);
    return buildRec(
      'increase',
      next,
      REPS_TARGET,
      `上次完成 ${weight}kg × ${reps} 次，建议尝试加重`,
      'medium'
    );
  }

  if (reps < REPS_MIN) {
    const next = decrementWeight(weight);
    return buildRec(
      'reduce',
      next,
      REPS_TARGET,
      '上次次数偏少，建议降低重量',
      'medium'
    );
  }

  return buildRec(
    'maintain',
    weight,
    reps + 1,
    `上次 ${weight}kg × ${reps} 次，尝试做到 ${reps + 1} 次`,
    'medium'
  );
}

// ── Weight Arithmetic ──────────────────────────────────────────────────────

function incrementWeight(current: number, referenceWeight: number): number {
  const increment = referenceWeight >= 20 ? PLATE_STANDARD : PLATE_SMALLEST;
  return roundToPlate(current + increment, increment);
}

function decrementWeight(current: number): number {
  const decrement = current >= 20 ? PLATE_STANDARD : PLATE_SMALLEST;
  return Math.max(0, roundToPlate(current - decrement, decrement));
}

function roundToPlate(value: number, plate: number): number {
  return Math.round(value / plate) * plate;
}

// ── Builder ────────────────────────────────────────────────────────────────

function buildRec(
  action: ProgressionAction,
  targetWeight: number,
  targetReps: number,
  reason: string,
  confidence: 'high' | 'medium' | 'low'
): ProgressionRecommendation {
  return {
    action,
    targetWeight: Math.max(0, targetWeight),
    targetReps: Math.max(1, targetReps),
    reason,
    confidence,
  };
}
