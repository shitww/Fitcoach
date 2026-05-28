// ── Build Workout Context ───────────────────────────────────────────────────
// Constructs the real-time context object used during predictive ranking.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutContext } from '@/types/predictive-flow';
import type { WorkoutSessionMemory, BodyRecoverySnapshot } from '@/types/workout-memory';

export interface BuildContextInput {
  activeSession: WorkoutSessionMemory | null;
  predictedSessionType: string;
  recoverySnapshot: BodyRecoverySnapshot;
  elapsedMin: number;
  availableEquipment: string[];
  targetDurationMin: number;
}

/** Build a WorkoutContext for real-time predictive ranking. */
export function buildWorkoutContext(input: BuildContextInput): WorkoutContext {
  const completedExercises = input.activeSession?.exercises.map(
    (e) => e.exerciseId || e.exerciseName
  ) || [];

  // Determine remaining muscle groups for the predicted session type
  const splitMuscleMap: Record<string, string[]> = {
    push: ['chest', 'shoulders', 'triceps'],
    pull: ['back', 'biceps', 'rear_delts'],
    legs: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    upper: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
    lower: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    fullbody: ['chest', 'back', 'legs', 'shoulders', 'arms'],
  };

  const targetMuscles = splitMuscleMap[input.predictedSessionType] || [];
  const trainedMuscles = new Set(
    input.activeSession?.exercises.map((e) => e.muscleGroup) || []
  );
  const remainingMuscleGroups = targetMuscles.filter((m) => !trainedMuscles.has(m));

  // Estimate current fatigue from session so far
  const currentFatigue = input.activeSession?.estimatedFatigueScore ?? 0;

  // Track movement patterns completed
  const completedMovementPatterns: string[] = []; // Would need exercise metadata to populate

  return {
    sessionType: input.predictedSessionType,
    completedExercises,
    remainingMuscleGroups,
    completedMovementPatterns,
    currentFatigueEstimate: currentFatigue,
    availableEquipment: input.availableEquipment,
    targetDurationMin: input.targetDurationMin,
    elapsedMin: input.elapsedMin,
  };
}
