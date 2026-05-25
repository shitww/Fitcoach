/**
 * WorkoutPlan type system — Planning Layer (pre-workout only)
 *
 * Discriminated union keyed on meta.mode.
 * Execution components receive only WorkoutPlan — never PlanningEngine internals.
 */

// ── Shared ───────────────────────────────────────────────────────────────────

export type WorkoutMode = 'strength' | 'cardio' | 'recovery';

export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';

export type PlanSource = 'template' | 'ai';

export interface PlanMeta {
  id: string;
  generatedAt: number;
  estimatedDurationMin: number;
  level: FitnessLevel;
  source: PlanSource;
}

// ── Strength ─────────────────────────────────────────────────────────────────

export interface PlannedSet {
  /** null = bodyweight / to-be-filled by user */
  weight: number | null;
  reps: number;
  restSec: number;
}

export interface PlannedExercise {
  name: string;
  sets: PlannedSet[];
  notes?: string;
}

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'abs'
  | 'fullbody';

export interface StrengthWorkoutPlan {
  meta: PlanMeta & { mode: 'strength' };
  muscleGroup: MuscleGroup;
  muscleGroupLabel: string;
  exercises: PlannedExercise[];
}

// ── Cardio ───────────────────────────────────────────────────────────────────

export type CardioType = 'treadmill' | 'stairclimber';

export interface CardioWorkoutPlan {
  meta: PlanMeta & { mode: 'cardio' };
  cardioType: CardioType;
  targetDurationMin: number;
  suggestedSpeed?: number;
  suggestedIncline?: number;
  suggestedLevel?: number;
}

// ── Recovery ─────────────────────────────────────────────────────────────────

export interface RecoveryStep {
  name: string;
  durationSec: number;
  description: string;
}

export type RecoveryFocus =
  | 'full_body'
  | 'upper_body'
  | 'lower_body'
  | 'back'
  | 'mobility';

export interface RecoveryWorkoutPlan {
  meta: PlanMeta & { mode: 'recovery' };
  focus: RecoveryFocus;
  focusLabel: string;
  steps: RecoveryStep[];
}

// ── Union ────────────────────────────────────────────────────────────────────

export type WorkoutPlan =
  | StrengthWorkoutPlan
  | CardioWorkoutPlan
  | RecoveryWorkoutPlan;

// ── localStorage bridge key ───────────────────────────────────────────────────

export const PENDING_PLAN_KEY = 'fitcoach:v1:pending-plan' as const;
