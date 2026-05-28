// ── FitCoach Phase 3 — Long-term Growth Modeling Engine ─────────────────────
// Models strength / volume growth curves from historical data.
// Purely analytical. No ML. Deterministic.

import type { ExerciseHistory } from './trainingTypes';

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Compute growth metrics for a single exercise over time.
 */
export function computeGrowthMetrics(history: ExerciseHistory): ExerciseGrowthMetrics {
  if (history.sessions.length < 3) {
    return {
      exerciseName: history.exerciseName,
      sessionsAnalyzed: history.sessions.length,
      strengthGrowthRate: null,
      volumeGrowthRate: null,
      consistencyScore: null,
      projected1RM: null,
      trendDirection: 'insufficient_data',
    };
  }

  const sessions = history.sessions;
  const firstHalf = sessions.slice(0, Math.floor(sessions.length / 2));
  const secondHalf = sessions.slice(Math.floor(sessions.length / 2));

  // Strength: estimated 1RM
  const first1RMs = firstHalf.map((s) =>
    Math.max(...s.sets.map((set) => estimate1RM(set.weight, set.reps)), 0)
  );
  const second1RMs = secondHalf.map((s) =>
    Math.max(...s.sets.map((set) => estimate1RM(set.weight, set.reps)), 0)
  );

  const firstAvg1RM =
    first1RMs.reduce((a, b) => a + b, 0) / Math.max(first1RMs.length, 1);
  const secondAvg1RM =
    second1RMs.reduce((a, b) => a + b, 0) / Math.max(second1RMs.length, 1);

  const strengthGrowthRate =
    firstAvg1RM > 0 ? round2(((secondAvg1RM - firstAvg1RM) / firstAvg1RM) * 100) : null;

  // Volume growth
  const firstAvgVol =
    firstHalf.reduce((s, sess) => s + sess.totalVolume, 0) / Math.max(firstHalf.length, 1);
  const secondAvgVol =
    secondHalf.reduce((s, sess) => s + sess.totalVolume, 0) / Math.max(secondHalf.length, 1);

  const volumeGrowthRate =
    firstAvgVol > 0 ? round2(((secondAvgVol - firstAvgVol) / firstAvgVol) * 100) : null;

  // Consistency (low CV in volume)
  const allVolumes = sessions.map((s) => s.totalVolume);
  const avgVol = allVolumes.reduce((a, b) => a + b, 0) / allVolumes.length;
  const variance =
    allVolumes.reduce((s, v) => s + Math.pow(v - avgVol, 2), 0) / allVolumes.length;
  const cv = avgVol > 0 ? Math.sqrt(variance) / avgVol : 0;
  const consistencyScore = round2(Math.max(0, 1 - cv));

  // Projection (simple linear extrapolation)
  const projected1RM =
    secondAvg1RM > 0 && strengthGrowthRate !== null
      ? round2(secondAvg1RM * (1 + strengthGrowthRate / 100))
      : null;

  let trendDirection: GrowthTrend;
  if (strengthGrowthRate === null) {
    trendDirection = 'insufficient_data';
  } else if (strengthGrowthRate > 5) {
    trendDirection = 'strong_growth';
  } else if (strengthGrowthRate > 1) {
    trendDirection = 'moderate_growth';
  } else if (strengthGrowthRate > -3) {
    trendDirection = 'plateau';
  } else {
    trendDirection = 'declining';
  }

  return {
    exerciseName: history.exerciseName,
    sessionsAnalyzed: sessions.length,
    strengthGrowthRate,
    volumeGrowthRate,
    consistencyScore,
    projected1RM,
    trendDirection,
  };
}

/**
 * Compute aggregated growth across all exercises.
 */
export function computeOverallGrowth(histories: ExerciseHistory[]): OverallGrowth {
  const metrics = histories.map((h) => computeGrowthMetrics(h));
  const valid = metrics.filter((m) => m.sessionsAnalyzed >= 3);

  if (valid.length === 0) {
    return {
      exercisesTracked: 0,
      avgStrengthGrowth: null,
      avgVolumeGrowth: null,
      avgConsistency: null,
      strongestTrend: 'insufficient_data',
      weakestExercise: null,
      fastestExercise: null,
    };
  }

  const strengthRates = valid.map((m) => m.strengthGrowthRate).filter((r): r is number => r !== null);
  const volumeRates = valid.map((m) => m.volumeGrowthRate).filter((r): r is number => r !== null);
  const consistencies = valid.map((m) => m.consistencyScore).filter((c): c is number => c !== null);

  const avgStrengthGrowth = strengthRates.length > 0
    ? round2(strengthRates.reduce((a, b) => a + b, 0) / strengthRates.length)
    : null;
  const avgVolumeGrowth = volumeRates.length > 0
    ? round2(volumeRates.reduce((a, b) => a + b, 0) / volumeRates.length)
    : null;
  const avgConsistency = consistencies.length > 0
    ? round2(consistencies.reduce((a, b) => a + b, 0) / consistencies.length)
    : null;

  // Find fastest / weakest exercises
  const byGrowth = [...valid].sort(
    (a, b) => (b.strengthGrowthRate ?? -999) - (a.strengthGrowthRate ?? -999)
  );
  const fastestExercise = byGrowth[0]?.exerciseName ?? null;
  const weakestExercise = byGrowth[byGrowth.length - 1]?.exerciseName ?? null;

  // Overall trend direction
  let strongestTrend: GrowthTrend = 'insufficient_data';
  if (avgStrengthGrowth !== null) {
    if (avgStrengthGrowth > 5) strongestTrend = 'strong_growth';
    else if (avgStrengthGrowth > 1) strongestTrend = 'moderate_growth';
    else if (avgStrengthGrowth > -3) strongestTrend = 'plateau';
    else strongestTrend = 'declining';
  }

  return {
    exercisesTracked: valid.length,
    avgStrengthGrowth,
    avgVolumeGrowth,
    avgConsistency,
    strongestTrend,
    weakestExercise,
    fastestExercise,
  };
}

// ── Types ────────────────────────────────────────────────────────────────────

export type GrowthTrend =
  | 'strong_growth'
  | 'moderate_growth'
  | 'plateau'
  | 'declining'
  | 'insufficient_data';

export interface ExerciseGrowthMetrics {
  exerciseName: string;
  sessionsAnalyzed: number;
  strengthGrowthRate: number | null; // % change in estimated 1RM
  volumeGrowthRate: number | null; // % change in total volume
  consistencyScore: number | null; // 0-1, higher = more consistent
  projected1RM: number | null; // simple linear projection
  trendDirection: GrowthTrend;
}

export interface OverallGrowth {
  exercisesTracked: number;
  avgStrengthGrowth: number | null;
  avgVolumeGrowth: number | null;
  avgConsistency: number | null;
  strongestTrend: GrowthTrend;
  weakestExercise: string | null;
  fastestExercise: string | null;
}

// ── Internal ─────────────────────────────────────────────────────────────────

function estimate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
