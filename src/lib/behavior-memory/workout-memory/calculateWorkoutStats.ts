// ── Workout Stats Calculator ────────────────────────────────────────────────
// Deterministic aggregation of raw workout data into memory-ready stats.
// ─────────────────────────────────────────────────────────────────────────────

import type { MemoryWorkoutSet, MemoryWorkoutExercise } from '@/types/workout-memory';

export interface SetStats {
  totalSets: number;
  workingSets: number;
  totalReps: number;
  totalWeight: number; // sum of all set weights
  totalVolume: number; // sum(weight * reps)
  maxWeight: number;
  maxReps: number;
  prCount: number;
  failureCount: number;
}

export interface ExerciseSessionStats {
  exerciseName: string;
  muscleGroup: string;
  setStats: SetStats;
  estimated1RM: number;
  orderIndex: number;
}

export interface WorkoutSessionStats {
  workoutId: string;
  date: string;
  durationSec: number;
  exercises: ExerciseSessionStats[];
  totalVolume: number;
  totalSets: number;
  totalWorkingSets: number;
  prCount: number;
  muscleGroups: string[];
  estimatedFatigueScore: number; // 0-100
}

/** Calculate stats for a single exercise's sets. */
export function calculateSetStats(sets: MemoryWorkoutSet[]): SetStats {
  let totalSets = 0;
  let workingSets = 0;
  let totalReps = 0;
  let totalWeight = 0;
  let totalVolume = 0;
  let maxWeight = 0;
  let maxReps = 0;
  let prCount = 0;
  let failureCount = 0;

  for (const s of sets) {
    totalSets++;
    if (s.type === 'W' || s.type === 'working') workingSets++;
    totalReps += s.reps;
    totalWeight += s.weight;
    totalVolume += s.weight * s.reps;
    maxWeight = Math.max(maxWeight, s.weight);
    maxReps = Math.max(maxReps, s.reps);
    if (s.isPR) prCount++;
    if (s.isFailure) failureCount++;
  }

  return {
    totalSets,
    workingSets,
    totalReps,
    totalWeight,
    totalVolume,
    maxWeight,
    maxReps,
    prCount,
    failureCount,
  };
}

/** Estimate 1RM using Epley formula: weight * (1 + reps / 30).
 *  Only uses the best set (highest estimated 1RM).
 */
export function estimate1RM(sets: MemoryWorkoutSet[]): number {
  let best1RM = 0;
  for (const s of sets) {
    if (s.reps > 0 && s.weight > 0) {
      const epley = s.weight * (1 + s.reps / 30);
      best1RM = Math.max(best1RM, epley);
    }
  }
  return Math.round(best1RM * 10) / 10;
}

/** Calculate exercise-level stats from raw exercise data. */
export function calculateExerciseStats(
  ex: MemoryWorkoutExercise
): ExerciseSessionStats {
  const setStats = calculateSetStats(ex.sets);
  const estimated1RM = estimate1RM(ex.sets);
  return {
    exerciseName: ex.exerciseName,
    muscleGroup: ex.muscleGroup,
    setStats,
    estimated1RM,
    orderIndex: ex.orderIndex,
  };
}

/** Muscle group fatigue multipliers — compound/heavy movements cost more. */
const MUSCLE_FATIGUE_MULTIPLIER: Record<string, number> = {
  legs: 1.3,
  back: 1.2,
  chest: 1.0,
  shoulders: 0.9,
  arms: 0.7,
  core: 0.6,
};

/** Baseline volume thresholds per muscle group (arbitrary units for scaling). */
const BASELINE_VOLUME: Record<string, number> = {
  legs: 8000,
  back: 6000,
  chest: 5000,
  shoulders: 4000,
  arms: 3000,
  core: 2000,
};

/** Estimate session fatigue score (0-100) from volume distribution.
 *  Heavier volume on big muscle groups = higher fatigue.
 */
export function estimateSessionFatigue(
  exercises: ExerciseSessionStats[]
): number {
  let fatigue = 0;
  const groupVolumes: Record<string, number> = {};

  // Aggregate volume by muscle group
  for (const ex of exercises) {
    const group = ex.muscleGroup || 'general';
    groupVolumes[group] = (groupVolumes[group] || 0) + ex.setStats.totalVolume;
  }

  for (const [group, volume] of Object.entries(groupVolumes)) {
    const baseline = BASELINE_VOLUME[group] || 4000;
    const multiplier = MUSCLE_FATIGUE_MULTIPLIER[group] || 1.0;
    const normalized = (volume / baseline) * multiplier * 25; // scale to ~0-50 per group
    fatigue += normalized;
  }

  return Math.min(100, Math.round(fatigue));
}

/** Build full session stats from raw exercises. */
export function buildWorkoutSessionStats(
  workoutId: string,
  date: string,
  durationSec: number,
  exercises: MemoryWorkoutExercise[]
): WorkoutSessionStats {
  const exerciseStats = exercises.map(calculateExerciseStats);
  const totalVolume = exerciseStats.reduce((s, e) => s + e.setStats.totalVolume, 0);
  const totalSets = exerciseStats.reduce((s, e) => s + e.setStats.totalSets, 0);
  const totalWorkingSets = exerciseStats.reduce(
    (s, e) => s + e.setStats.workingSets,
    0
  );
  const prCount = exerciseStats.reduce((s, e) => s + e.setStats.prCount, 0);
  const muscleGroups = Array.from(
    new Set(exerciseStats.map((e) => e.muscleGroup).filter(Boolean))
  );
  const fatigueScore = estimateSessionFatigue(exerciseStats);

  return {
    workoutId,
    date,
    durationSec,
    exercises: exerciseStats,
    totalVolume,
    totalSets,
    totalWorkingSets,
    prCount,
    muscleGroups,
    estimatedFatigueScore: fatigueScore,
  };
}
