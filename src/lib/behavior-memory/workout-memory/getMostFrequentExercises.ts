// ── Most Frequent Exercises ─────────────────────────────────────────────────
// Frequency-based exercise ranking for habit detection.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutSessionMemory } from '@/types/workout-memory';

export interface ExerciseFrequency {
  exerciseName: string;
  exerciseId?: string | null;
  muscleGroup: string;
  sessionCount: number; // number of sessions containing this exercise
  setCount: number;
  totalVolume: number;
  firstSeen: string;
  lastSeen: string;
}

/** Aggregate frequency stats across all sessions. */
export function getMostFrequentExercises(
  sessions: readonly WorkoutSessionMemory[]
): ExerciseFrequency[] {
  const map = new Map<string, ExerciseFrequency>();

  for (const session of sessions) {
    for (const ex of session.exercises) {
      const key = ex.exerciseId || ex.exerciseName;
      const existing = map.get(key);

      if (existing) {
        existing.sessionCount += 1;
        existing.setCount += ex.sets.length;
        existing.totalVolume += ex.sets.reduce(
          (s, set) => s + set.weight * set.reps,
          0
        );
        if (session.date < existing.firstSeen) existing.firstSeen = session.date;
        if (session.date > existing.lastSeen) existing.lastSeen = session.date;
      } else {
        map.set(key, {
          exerciseName: ex.exerciseName,
          exerciseId: ex.exerciseId,
          muscleGroup: ex.muscleGroup,
          sessionCount: 1,
          setCount: ex.sets.length,
          totalVolume: ex.sets.reduce(
            (s, set) => s + set.weight * set.reps,
            0
          ),
          firstSeen: session.date,
          lastSeen: session.date,
        });
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => b.sessionCount - a.sessionCount);
}

/** Get top N most frequent exercises. */
export function getTopFrequentExercises(
  sessions: readonly WorkoutSessionMemory[],
  limit: number = 10
): ExerciseFrequency[] {
  return getMostFrequentExercises(sessions).slice(0, limit);
}

/** Frequency within a specific time window (last N days). */
export function getFrequentExercisesInWindow(
  sessions: readonly WorkoutSessionMemory[],
  days: number
): ExerciseFrequency[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffTime = cutoff.getTime();

  const filtered = sessions.filter(
    (s) => new Date(s.date).getTime() >= cutoffTime
  );
  return getMostFrequentExercises(filtered);
}
