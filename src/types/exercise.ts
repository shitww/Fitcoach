// ── Exercise Schema ─────────────────────────────────────────────────────────
// Universal exercise definition for FitCoach Knowledge Layer.
// Decoupled from UI; designed for recommendation, substitution, and AI parsing.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Muscle,
  MuscleGroup,
  EquipmentType,
  MovementPattern,
  ExerciseCategory,
} from '@/lib/fitness-taxonomy';

// ── Re-export taxonomy types for consumer convenience ─────────────────────────

export type { Muscle, MuscleGroup, EquipmentType, MovementPattern, ExerciseCategory };

// ── Progression Models ────────────────────────────────────────────────────────

/** How an exercise should be progressed over time.
 *  Used by the training intelligence layer for load recommendations.
 */
export const PROGRESSION_MODELS = [
  'linear',               // add weight each session
  'double_progression',   // add reps until target, then add weight
  'rep_ranges',           // stay within a rep range, adjust weight
  'rpe_based',            // autoregulate by RPE/RIR
  'bodyweight_progression', // progress lever arm, tempo, or add weight
  'time_under_tension',   // progress via tempo / duration
  'distance_progression', // progress distance / speed (sleds, carries)
  'undulating',           // wave periodization within microcycles
] as const;

export type ProgressionModel = (typeof PROGRESSION_MODELS)[number];

// ── Difficulty ───────────────────────────────────────────────────────────────

export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number];

// ── Demand Scales ─────────────────────────────────────────────────────────────

export const STABILITY_DEMANDS = ['low', 'moderate', 'high'] as const;
export type StabilityDemand = (typeof STABILITY_DEMANDS)[number];

export const AXIAL_LOAD_LEVELS = ['none', 'low', 'moderate', 'high'] as const;
export type AxialLoadLevel = (typeof AXIAL_LOAD_LEVELS)[number];

// ── Core Exercise Type ────────────────────────────────────────────────────────

/** A single serving size definition for food items. */
export interface ServingSize {
  label: string;      // e.g. "1 cup", "100g", "1 medium"
  weightGrams: number;
}

/** Nutrition values per 100g of food. */
export interface NutritionPer100g {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodiumMg?: number;
}

/** Complete exercise definition — the atomic unit of the knowledge layer. */
export interface Exercise {
  /** Stable unique identifier. Kebab-case, English. */
  readonly id: string;

  /** Primary display name (English). */
  readonly name: string;

  /** Alternative names, slang, abbreviations, and common misspellings.
   *  All lowercase for search normalization.
   */
  readonly aliases: readonly string[];

  /** Primary movement pattern for biomechanical classification. */
  readonly movementPattern: MovementPattern;

  /** Muscles primarily targeted by this exercise. */
  readonly primaryMuscles: readonly Muscle[];

  /** Muscles secondarily involved (stabilizers, synergists). */
  readonly secondaryMuscles: readonly Muscle[];

  /** Muscle groups this exercise contributes to. Derived from muscles,
   *  but explicitly stored for fast filtering.
   */
  readonly muscleGroups: readonly MuscleGroup[];

  /** Equipment required to perform the exercise.
   *  Empty array = bodyweight-only.
   */
  readonly equipment: readonly EquipmentType[];

  /** Training category for goal alignment. */
  readonly category: ExerciseCategory;

  /** Systemic fatigue score (1–10). Higher = more demanding on CNS/recovery.
   *  Squats = 9, bicep curls = 3.
   */
  readonly fatigueScore: number;

  /** Balance / stabilization demand. */
  readonly stabilityDemand: StabilityDemand;

  /** Spinal axial loading intensity. Critical for back-safety filters. */
  readonly axialLoad: AxialLoadLevel;

  /** True if the exercise is inherently unilateral (one side at a time).
   *  Note: bilateral exercises done with one limb are "split" not unilateral.
   */
  readonly unilateral: boolean;

  /** IDs of exercises that can substitute this one when equipment,
   *  injury, or preference requires a swap. Ordered by similarity.
   */
  readonly substituteExerciseIds: readonly string[];

  /** Recommended progression model for this exercise. */
  readonly progressionModel: ProgressionModel;

  /** Free-form tags for search, filtering, and future AI parsing.
   *  Examples: 'compound', 'isolation', 'home_gym', 'beginner_friendly'
   */
  readonly tags: readonly string[];

  /** Difficulty classification. */
  readonly difficulty: DifficultyLevel;

  /** Step-by-step instructions (optional). */
  readonly instructions?: readonly string[];

  /** Coaching cues and tips (optional). */
  readonly tips?: readonly string[];

  /** Is this a common, high-frequency exercise? Used for suggestion ranking. */
  readonly isCommon: boolean;
}

/** Derived exercise summary for lightweight list views. */
export interface ExerciseSummary {
  id: string;
  name: string;
  aliases: readonly string[];
  movementPattern: MovementPattern;
  primaryMuscles: readonly Muscle[];
  equipment: readonly EquipmentType[];
  difficulty: DifficultyLevel;
  isCommon: boolean;
}

/** Helper: create a summary from a full exercise. */
export function toExerciseSummary(ex: Exercise): ExerciseSummary {
  return {
    id: ex.id,
    name: ex.name,
    aliases: ex.aliases,
    movementPattern: ex.movementPattern,
    primaryMuscles: ex.primaryMuscles,
    equipment: ex.equipment,
    difficulty: ex.difficulty,
    isCommon: ex.isCommon,
  };
}
