// ── Recent Exercise Context ────────────────────────────────────────────────────
// Returns exercises from recent sessions with their latest performance data.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  MemoryWorkoutExercise,
  WorkoutSessionMemory,
  ExercisePerformanceSnapshot,
} from '@/types/workout-memory';

export interface RecentExerciseContext {
  exerciseName: string;
  exerciseId?: string | null;
  muscleGroup: string;
  lastSessionDate: string;
  lastSets: { weight: number; reps: number }[];
  lastVolume: number;
  daysAgo: number;
}

/** Get exercises from the most recent N sessions. */
export function getRecentExercises(
  sessions: readonly WorkoutSessionMemory[],
  sessionCount: number = 3
): RecentExerciseContext[] {
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const recent = sorted.slice(0, sessionCount);

  const map = new Map<string, RecentExerciseContext>();
  const today = new Date();

  for (const session of recent) {
    for (const ex of session.exercises) {
      const key = ex.exerciseId || ex.exerciseName;
      if (map.has(key)) continue; // keep the most recent (first encounter)

      const daysAgo = Math.floor(
        (today.getTime() - new Date(session.date).getTime()) / 86_400_000
      );

      map.set(key, {
        exerciseName: ex.exerciseName,
        exerciseId: ex.exerciseId,
        muscleGroup: ex.muscleGroup,
        lastSessionDate: session.date,
        lastSets: ex.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
        lastVolume: ex.sets.reduce((sum, s) => sum + s.weight * s.reps, 0),
        daysAgo,
      });
    }
  }

  return Array.from(map.values());
}

/** Get exercises performed within the last N days. */
export function getExercisesInLastNDays(
  sessions: readonly WorkoutSessionMemory[],
  days: number
): RecentExerciseContext[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffTime = cutoff.getTime();

  const filtered = sessions.filter(
    (s) => new Date(s.date).getTime() >= cutoffTime
  );
  return getRecentExercises(filtered, filtered.length);
}

/** Get the single most recently performed exercise. */
export function getMostRecentExercise(
  sessions: readonly WorkoutSessionMemory[]
): RecentExerciseContext | null {
  const recent = getRecentExercises(sessions, 1);
  return recent.length > 0 ? recent[0] : null;
}
