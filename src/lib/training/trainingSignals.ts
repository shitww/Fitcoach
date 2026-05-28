// ── FitCoach V2 — Training Signals Data Model ───────────────────────────────
// Unified lightweight data model for the Training Intelligence Layer.
// All inputs are plain objects — feed from DB summaries, local cache, or session state.

import type {
  ExerciseHistory,
  ExerciseSession,
  HistoricalSet,
  LiveExerciseContext,
  UserTrainingContext,
  RecentWorkout,
} from './trainingTypes';

// ── Volume Helpers ─────────────────────────────────────────────────────────

export function sessionVolume(sets: HistoricalSet[]): number {
  return sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
}

export function totalVolumeAcrossSessions(sessions: ExerciseSession[]): number {
  return sessions.reduce((sum, sess) => sum + sess.totalVolume, 0);
}

/** Average volume per session over the last N sessions. */
export function avgVolumeLastNSessions(
  history: ExerciseHistory,
  n: number
): number {
  const recent = history.sessions.slice(-n);
  if (recent.length === 0) return 0;
  return recent.reduce((s, sess) => s + sess.totalVolume, 0) / recent.length;
}

/** Trend direction for the last N sessions (slope approximation). */
export function volumeTrend(
  history: ExerciseHistory,
  windowSize = 4
): 'up' | 'down' | 'flat' {
  const sessions = history.sessions.slice(-windowSize);
  if (sessions.length < 2) return 'flat';
  const mid = Math.floor(sessions.length / 2);
  const firstHalf = sessions.slice(0, mid);
  const secondHalf = sessions.slice(mid);
  const firstAvg =
    firstHalf.reduce((s, sess) => s + sess.totalVolume, 0) /
    Math.max(firstHalf.length, 1);
  const secondAvg =
    secondHalf.reduce((s, sess) => s + sess.totalVolume, 0) /
    Math.max(secondHalf.length, 1);
  const threshold = firstAvg * 0.05; // 5% tolerance
  if (secondAvg > firstAvg + threshold) return 'up';
  if (secondAvg < firstAvg - threshold) return 'down';
  return 'flat';
}

// ── Rep Quality Helpers ────────────────────────────────────────────────────

/** Average reps for the heaviest weight in each of the last N sessions. */
export function avgRepsAtMaxWeight(
  history: ExerciseHistory,
  n: number
): { avgReps: number; avgWeight: number; sessionCount: number } {
  const recent = history.sessions.slice(-n);
  let totalReps = 0;
  let totalWeight = 0;
  let count = 0;
  for (const sess of recent) {
    const workSets = sess.sets.filter((s) => s.weight > 0);
    if (workSets.length === 0) continue;
    const maxW = Math.max(...workSets.map((s) => s.weight));
    const setsAtMax = workSets.filter((s) => s.weight === maxW);
    const avgR =
      setsAtMax.reduce((s, set) => s + set.reps, 0) / setsAtMax.length;
    totalReps += avgR;
    totalWeight += maxW;
    count++;
  }
  if (count === 0) return { avgReps: 0, avgWeight: 0, sessionCount: 0 };
  return {
    avgReps: totalReps / count,
    avgWeight: totalWeight / count,
    sessionCount: count,
  };
}

/** Count how many recent sessions had failure (RIR 0) on their heaviest sets. */
export function failureRateAtMaxWeight(
  history: ExerciseHistory,
  n: number
): number {
  const recent = history.sessions.slice(-n);
  if (recent.length === 0) return 0;
  let failureCount = 0;
  for (const sess of recent) {
    const workSets = sess.sets.filter((s) => s.weight > 0);
    if (workSets.length === 0) continue;
    const maxW = Math.max(...workSets.map((s) => s.weight));
    const setsAtMax = workSets.filter((s) => s.weight === maxW);
    if (setsAtMax.some((s) => s.isFailure || s.rir === 0)) {
      failureCount++;
    }
  }
  return failureCount / recent.length;
}

// ── Muscle Group Frequency ─────────────────────────────────────────────────

/** How many times each muscle group was trained in the last N days. */
export function muscleGroupFrequency(
  recentWorkouts: RecentWorkout[],
  muscleMap: Map<string, string>, // exerciseName → muscleGroup
  daysWindow: number
): Map<string, number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysWindow);
  cutoff.setHours(0, 0, 0, 0);
  const freq = new Map<string, number>();
  for (const wo of recentWorkouts) {
    const d = new Date(wo.date);
    d.setHours(0, 0, 0, 0);
    if (d < cutoff) continue;
    for (const ex of wo.exercises) {
      const mg = muscleMap.get(ex) ?? 'other';
      freq.set(mg, (freq.get(mg) ?? 0) + 1);
    }
  }
  return freq;
}

// ── 1RM Helpers ────────────────────────────────────────────────────────────

/** Epley formula — same as src/core/calc.ts, inlined to keep module self-contained. */
export function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

export function bestEstimated1RM(history: ExerciseHistory): number {
  let best = 0;
  for (const sess of history.sessions) {
    for (const set of sess.sets) {
      const e1rm = estimate1RM(set.weight, set.reps);
      if (e1rm > best) best = e1rm;
    }
  }
  return best;
}

// ── Streak / Recovery Helpers ─────────────────────────────────────────────

export function isHighFrequencyStreak(
  context: UserTrainingContext,
  thresholdDays = 5
): boolean {
  return context.currentStreak >= thresholdDays;
}

export function isUnderRecovered(context: UserTrainingContext): boolean {
  return context.daysSinceLastWorkout >= 1 && context.daysSinceLastWorkout <= 2;
}

export function isWellRecovered(context: UserTrainingContext): boolean {
  return context.daysSinceLastWorkout >= 2;
}

// ── Live Context Helpers ───────────────────────────────────────────────────

export function liveVolume(ctx: LiveExerciseContext): number {
  return ctx.completedSets.reduce(
    (sum, s) => sum + (s.isBodyweight ? 0 : s.weight * s.reps),
    0
  );
}

export function liveMaxWeight(ctx: LiveExerciseContext): number {
  if (ctx.completedSets.length === 0) return 0;
  return Math.max(...ctx.completedSets.map((s) => s.weight));
}

export function liveAvgReps(ctx: LiveExerciseContext): number {
  if (ctx.completedSets.length === 0) return 0;
  return (
    ctx.completedSets.reduce((s, set) => s + set.reps, 0) /
    ctx.completedSets.length
  );
}

/** Has the user hit failure on any set today for this exercise? */
export function liveHasFailure(ctx: LiveExerciseContext): boolean {
  return ctx.completedSets.some((s) => s.isFailure);
}

/** Are reps declining across completed sets today? */
export function liveRepsDeclining(ctx: LiveExerciseContext): boolean {
  const reps = ctx.completedSets.map((s) => s.reps);
  if (reps.length < 2) return false;
  for (let i = 1; i < reps.length; i++) {
    if (reps[i] >= reps[i - 1]) return false;
  }
  return true;
}
