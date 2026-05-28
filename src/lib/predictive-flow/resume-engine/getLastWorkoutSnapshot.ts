// ── Get Last Workout Snapshot ───────────────────────────────────────────────
// Retrieves the most recent workout with its key summary data.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutSessionMemory, ExercisePerformanceSnapshot } from '@/types/workout-memory';

export interface LastWorkoutSnapshot {
  workoutId: string;
  date: string;
  daysAgo: number;
  durationMin: number;
  totalVolume: number;
  exerciseNames: string[];
  muscleGroups: string[];
  estimatedFatigueScore: number;
  exercises: {
    name: string;
    id?: string | null;
    sets: number;
    volume: number;
  }[];
}

/** Get a summary of the most recent completed workout. */
export function getLastWorkoutSnapshot(
  sessions: readonly WorkoutSessionMemory[]
): LastWorkoutSnapshot | null {
  if (sessions.length === 0) return null;

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const last = sorted[0];
  const daysAgo = Math.floor(
    (Date.now() - new Date(last.date).getTime()) / 86_400_000
  );

  return {
    workoutId: last.workoutId,
    date: last.date,
    daysAgo,
    durationMin: Math.round(last.durationSec / 60),
    totalVolume: last.totalVolume,
    exerciseNames: last.exercises.map((e) => e.exerciseName),
    muscleGroups: last.muscleGroups,
    estimatedFatigueScore: last.estimatedFatigueScore,
    exercises: last.exercises.map((e) => ({
      name: e.exerciseName,
      id: e.exerciseId,
      sets: e.sets.length,
      volume: e.sets.reduce((s, set) => s + set.weight * set.reps, 0),
    })),
  };
}

/** Check if there was an unfinished session (conceptual).
 *  In practice, the app would track in-progress sessions separately.
 */
export function hasUnfinishedSession(
  _sessions: readonly WorkoutSessionMemory[]
): boolean {
  // Placeholder: app-specific logic would check an in-progress session store
  return false;
}
