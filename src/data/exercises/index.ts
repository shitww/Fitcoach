// ── Exercise Knowledge Pack Index ─────────────────────────────────────────────
// Aggregates all exercise definitions into a single searchable registry.
// ─────────────────────────────────────────────────────────────────────────────

import { chestExercises } from './chest';
import { backExercises } from './back';
import { shoulderExercises } from './shoulders';
import { legExercises } from './legs';
import { armExercises } from './arms';
import { coreExercises } from './core';
import { cardioExercises } from './cardio';
import type { Exercise } from '@/types/exercise';

export const ALL_EXERCISES: readonly Exercise[] = [
  ...chestExercises,
  ...backExercises,
  ...shoulderExercises,
  ...legExercises,
  ...armExercises,
  ...coreExercises,
  ...cardioExercises,
] as const;

/** Exercise count by muscle group. */
export const EXERCISE_COUNT_BY_GROUP: Record<string, number> = {
  chest: chestExercises.length,
  back: backExercises.length,
  shoulders: shoulderExercises.length,
  legs: legExercises.length,
  arms: armExercises.length,
  core: coreExercises.length,
  cardio: cardioExercises.length,
};

/** Total exercise count. */
export const TOTAL_EXERCISE_COUNT = ALL_EXERCISES.length;

/** Fast lookup map by exercise ID. */
export const EXERCISE_BY_ID: Readonly<Record<string, Exercise>> = Object.fromEntries(
  ALL_EXERCISES.map((ex) => [ex.id, ex])
);

/** All unique exercise IDs. */
export const ALL_EXERCISE_IDS: readonly string[] = ALL_EXERCISES.map((ex) => ex.id);

/** Get an exercise by its stable ID. Returns undefined if not found. */
export function getExerciseById(id: string): Exercise | undefined {
  return EXERCISE_BY_ID[id];
}

/** Get exercises by muscle group. */
export function getExercisesByMuscleGroup(group: string): Exercise[] {
  return ALL_EXERCISES.filter((ex) => ex.muscleGroups.includes(group as never));
}

/** Get exercises by movement pattern. */
export function getExercisesByMovementPattern(pattern: string): Exercise[] {
  return ALL_EXERCISES.filter((ex) => ex.movementPattern === pattern);
}

/** Get exercises by equipment type. */
export function getExercisesByEquipment(equipment: string): Exercise[] {
  return ALL_EXERCISES.filter((ex) => ex.equipment.includes(equipment as never));
}

/** Get substitute exercises for a given exercise ID. */
export function getSubstitutes(exerciseId: string): Exercise[] {
  const ex = getExerciseById(exerciseId);
  if (!ex) return [];
  return ex.substituteExerciseIds
    .map((id) => getExerciseById(id))
    .filter((e): e is Exercise => e !== undefined);
}

/** Get all unique tags across the exercise database. */
export function getAllExerciseTags(): string[] {
  const tagSet = new Set<string>();
  for (const ex of ALL_EXERCISES) {
    for (const tag of ex.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

/** Re-export individual group files for tree-shaking consumers. */
export {
  chestExercises,
  backExercises,
  shoulderExercises,
  legExercises,
  armExercises,
  coreExercises,
  cardioExercises,
};
