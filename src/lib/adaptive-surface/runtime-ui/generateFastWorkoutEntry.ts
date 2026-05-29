// ── Generate Fast Workout Entry ─────────────────────────────────────────────
// Generates a quick workout entry for users who want minimal friction.
// ─────────────────────────────────────────────────────────────────────────────

import type { OneTapWorkout, PredictionReason } from '@/types/predictive-flow';
import type { ExercisePerformanceSnapshot } from '@/types/workout-memory';

export interface FastEntryInput {
  durationMin: 20 | 30 | 45;
  focusArea: 'upper' | 'lower' | 'fullbody' | 'chest' | 'back' | 'legs';
  exercisePool: readonly {
    exerciseId: string;
    exerciseName: string;
    muscleGroup: string;
    snapshot?: ExercisePerformanceSnapshot;
  }[];
}

/** Generate a fast workout entry for a given duration and focus.
 *  Targets users who want "just give me something to do".
 */
export function generateFastWorkoutEntry(
  input: FastEntryInput
): OneTapWorkout {
  const { durationMin, focusArea, exercisePool } = input;

  // Filter by focus area
  const focusMuscles = getFocusMuscles(focusArea);
  const focused = exercisePool.filter((e) =>
    focusMuscles.includes(e.muscleGroup)
  );

  // Determine exercise count by duration
  const count =
    durationMin <= 20 ? 4 : durationMin <= 30 ? 5 : 6;

  // Pick top exercises (prefer ones with snapshots)
  const selected = [...focused]
    .sort((a, b) => {
      const aHasData = a.snapshot ? 1 : 0;
      const bHasData = b.snapshot ? 1 : 0;
      return bHasData - aHasData;
    })
    .slice(0, count);

  const exercises = selected.map((e) => ({
    exerciseId: e.exerciseId,
    name: e.exerciseName,
    sets: 3,
    weightHint: e.snapshot?.lastWeight ? `${e.snapshot.lastWeight}kg` : null,
  }));

  const reasoning: PredictionReason[] = [
    {
      type: 'time_spacing',
      text: `${durationMin}-minute ${focusArea} session`,
      confidence: 0.9,
    },
    {
      type: 'muscle_balance',
      text: `Targets ${focusMuscles.length} muscle groups`,
      confidence: 0.8,
    },
  ];

  return {
    title: `${capitalize(focusArea)} — ${durationMin} Min`,
    subtitle: `${exercises.length} exercises · Ready to go`,
    exercises,
    estimatedDurationMin: durationMin,
    warmupFlows: [],
    reasoning,
  };
}

function getFocusMuscles(focus: string): string[] {
  const map: Record<string, string[]> = {
    upper: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
    lower: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    fullbody: ['chest', 'back', 'legs', 'shoulders', 'arms'],
    chest: ['chest'],
    back: ['back', 'latissimus_dorsi', 'rhomboids'],
    legs: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
  };
  return map[focus] || [];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
