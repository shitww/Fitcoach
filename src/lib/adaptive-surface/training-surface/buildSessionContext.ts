// ── Build Session Context ───────────────────────────────────────────────────
// Creates a lightweight context object for the current training session.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutContext } from '@/types/predictive-flow';

export interface BuildSessionContextInput {
  sessionType: string;
  completedExerciseIds: readonly string[];
  completedMuscleGroups: readonly string[];
  completedMovementPatterns: readonly string[];
  currentFatigueEstimate: number;
  availableEquipment: readonly string[];
  targetDurationMin: number;
  elapsedMin: number;
}

/** Build a WorkoutContext from raw session data.
 *  Feeds into Phase 3 predictive ranking engines.
 */
export function buildSessionContext(
  input: BuildSessionContextInput
): WorkoutContext {
  const splitMuscleMap: Record<string, string[]> = {
    push: ['chest', 'shoulders', 'triceps'],
    pull: ['back', 'biceps', 'rear_delts'],
    legs: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    upper: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
    lower: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
    fullbody: ['chest', 'back', 'legs', 'shoulders', 'arms'],
  };

  const targetMuscles = splitMuscleMap[input.sessionType] || [];
  const trained = new Set(input.completedMuscleGroups);
  const remainingMuscleGroups = targetMuscles.filter((m) => !trained.has(m));

  return {
    sessionType: input.sessionType,
    completedExercises: [...input.completedExerciseIds],
    remainingMuscleGroups,
    completedMovementPatterns: [...input.completedMovementPatterns],
    currentFatigueEstimate: input.currentFatigueEstimate,
    availableEquipment: [...input.availableEquipment],
    targetDurationMin: input.targetDurationMin,
    elapsedMin: input.elapsedMin,
  };
}
