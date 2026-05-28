// ── Exercise Schema Validation ────────────────────────────────────────────────
// Runtime validators for exercise data integrity.
// Catches missing fields, invalid taxonomy values, and broken substitute links.
// ─────────────────────────────────────────────────────────────────────────────

import {
  MUSCLES,
  MUSCLE_GROUPS,
  EQUIPMENT_TYPES,
  MOVEMENT_PATTERNS,
  EXERCISE_CATEGORIES,
} from '@/lib/fitness-taxonomy';
import { PROGRESSION_MODELS, DIFFICULTY_LEVELS, STABILITY_DEMANDS, AXIAL_LOAD_LEVELS } from '@/types/exercise';
import { ALL_EXERCISE_IDS, getExerciseById } from '@/data/exercises';
import type { Exercise } from '@/types/exercise';

const VALID_MUSCLES = new Set<string>(MUSCLES);
const VALID_MUSCLE_GROUPS = new Set<string>(MUSCLE_GROUPS);
const VALID_EQUIPMENT = new Set<string>(EQUIPMENT_TYPES);
const VALID_MOVEMENT_PATTERNS = new Set<string>(MOVEMENT_PATTERNS);
const VALID_CATEGORIES = new Set<string>(EXERCISE_CATEGORIES);
const VALID_PROGRESSION = new Set<string>(PROGRESSION_MODELS);
const VALID_DIFFICULTY = new Set<string>(DIFFICULTY_LEVELS);
const VALID_STABILITY = new Set<string>(STABILITY_DEMANDS);
const VALID_AXIAL = new Set<string>(AXIAL_LOAD_LEVELS);
const VALID_IDS = new Set<string>(ALL_EXERCISE_IDS);

export interface ValidationError {
  field: string;
  message: string;
  exerciseId?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/** Validate a single exercise object against the schema and taxonomy. */
export function validateExercise(ex: Exercise): ValidationResult {
  const errors: ValidationError[] = [];
  const id = ex.id;

  // Required string fields
  if (!ex.id || typeof ex.id !== 'string') {
    errors.push({ field: 'id', message: 'Missing or invalid id', exerciseId: id });
  }
  if (!ex.name || typeof ex.name !== 'string') {
    errors.push({ field: 'name', message: 'Missing or invalid name', exerciseId: id });
  }

  // Arrays must not be empty (except equipment can be bodyweight = empty, which is fine)
  if (!Array.isArray(ex.aliases) || ex.aliases.length === 0) {
    errors.push({ field: 'aliases', message: 'Must be a non-empty array', exerciseId: id });
  }
  if (!Array.isArray(ex.primaryMuscles) || ex.primaryMuscles.length === 0) {
    errors.push({ field: 'primaryMuscles', message: 'Must be a non-empty array', exerciseId: id });
  }
  if (!Array.isArray(ex.muscleGroups) || ex.muscleGroups.length === 0) {
    errors.push({ field: 'muscleGroups', message: 'Must be a non-empty array', exerciseId: id });
  }
  if (!Array.isArray(ex.equipment)) {
    errors.push({ field: 'equipment', message: 'Must be an array', exerciseId: id });
  }
  if (!Array.isArray(ex.substituteExerciseIds)) {
    errors.push({ field: 'substituteExerciseIds', message: 'Must be an array', exerciseId: id });
  }
  if (!Array.isArray(ex.tags) || ex.tags.length === 0) {
    errors.push({ field: 'tags', message: 'Must be a non-empty array', exerciseId: id });
  }

  // Enum validations
  if (!VALID_MOVEMENT_PATTERNS.has(ex.movementPattern)) {
    errors.push({ field: 'movementPattern', message: `Invalid value: ${ex.movementPattern}`, exerciseId: id });
  }
  if (!VALID_CATEGORIES.has(ex.category)) {
    errors.push({ field: 'category', message: `Invalid value: ${ex.category}`, exerciseId: id });
  }
  if (!VALID_PROGRESSION.has(ex.progressionModel)) {
    errors.push({ field: 'progressionModel', message: `Invalid value: ${ex.progressionModel}`, exerciseId: id });
  }
  if (!VALID_DIFFICULTY.has(ex.difficulty)) {
    errors.push({ field: 'difficulty', message: `Invalid value: ${ex.difficulty}`, exerciseId: id });
  }
  if (!VALID_STABILITY.has(ex.stabilityDemand)) {
    errors.push({ field: 'stabilityDemand', message: `Invalid value: ${ex.stabilityDemand}`, exerciseId: id });
  }
  if (!VALID_AXIAL.has(ex.axialLoad)) {
    errors.push({ field: 'axialLoad', message: `Invalid value: ${ex.axialLoad}`, exerciseId: id });
  }

  // Numeric validations
  if (typeof ex.fatigueScore !== 'number' || ex.fatigueScore < 1 || ex.fatigueScore > 10) {
    errors.push({ field: 'fatigueScore', message: 'Must be a number between 1 and 10', exerciseId: id });
  }
  if (typeof ex.unilateral !== 'boolean') {
    errors.push({ field: 'unilateral', message: 'Must be a boolean', exerciseId: id });
  }
  if (typeof ex.isCommon !== 'boolean') {
    errors.push({ field: 'isCommon', message: 'Must be a boolean', exerciseId: id });
  }

  // Taxonomy membership validations
  for (const muscle of ex.primaryMuscles) {
    if (!VALID_MUSCLES.has(muscle)) {
      errors.push({ field: 'primaryMuscles', message: `Invalid muscle: ${muscle}`, exerciseId: id });
    }
  }
  for (const muscle of ex.secondaryMuscles) {
    if (!VALID_MUSCLES.has(muscle)) {
      errors.push({ field: 'secondaryMuscles', message: `Invalid muscle: ${muscle}`, exerciseId: id });
    }
  }
  for (const group of ex.muscleGroups) {
    if (!VALID_MUSCLE_GROUPS.has(group)) {
      errors.push({ field: 'muscleGroups', message: `Invalid muscle group: ${group}`, exerciseId: id });
    }
  }
  for (const eq of ex.equipment) {
    if (!VALID_EQUIPMENT.has(eq)) {
      errors.push({ field: 'equipment', message: `Invalid equipment: ${eq}`, exerciseId: id });
    }
  }

  // Substitute link integrity
  for (const subId of ex.substituteExerciseIds) {
    if (!VALID_IDS.has(subId)) {
      errors.push({ field: 'substituteExerciseIds', message: `Invalid substitute id: ${subId}`, exerciseId: id });
    } else if (subId === ex.id) {
      errors.push({ field: 'substituteExerciseIds', message: `Self-reference not allowed: ${subId}`, exerciseId: id });
    }
  }

  return { valid: errors.length === 0, errors };
}

/** Validate the entire exercise database. */
export function validateAllExercises(): ValidationResult {
  const { ALL_EXERCISES } = require('@/data/exercises');
  const allErrors: ValidationError[] = [];

  for (const ex of ALL_EXERCISES as Exercise[]) {
    const result = validateExercise(ex);
    allErrors.push(...result.errors);
  }

  return { valid: allErrors.length === 0, errors: allErrors };
}
