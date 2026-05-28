// ── FitCoach V2 — Training Intelligence Type System ─────────────────────────
// Lightweight, deterministic, client-runnable. No AI/LLM dependencies.

/** A single historical set for an exercise (from DB or local cache). */
export interface HistoricalSet {
  weight: number;
  reps: number;
  rir: number | null;
  isFailure: boolean;
  isPR: boolean;
  date: string; // ISO date string YYYY-MM-DD
}

/** A single exercise's history, ordered oldest → newest. */
export interface ExerciseHistory {
  exerciseName: string;
  muscleGroup?: string;
  sessions: ExerciseSession[];
}

/** One training session for a specific exercise. */
export interface ExerciseSession {
  date: string;
  sets: HistoricalSet[];
  totalVolume: number;
}

/** A completed set within the current live workout. */
export interface LiveSet {
  weight: number;
  reps: number;
  rir: number | null;
  isFailure: boolean;
  isBodyweight: boolean;
}

/** Context about the current exercise within an active workout. */
export interface LiveExerciseContext {
  exerciseName: string;
  muscleGroup?: string;
  completedSets: LiveSet[];
  targetSets?: number; // e.g. 3 sets planned
  restTimesSec?: number[]; // actual rest times between sets
}

/** Snapshot of user's recent training state. */
export interface UserTrainingContext {
  recentWorkouts: RecentWorkout[];
  currentStreak: number;
  daysSinceLastWorkout: number;
  bodyWeightTrend?: BodyWeightTrend;
}

export interface RecentWorkout {
  date: string;
  exercises: string[];
  totalVolume: number;
  durationMin: number;
}

export interface BodyWeightTrend {
  last7dAvg: number;
  prev7dAvg: number;
  changeKg: number;
}

// ── Engine Outputs ─────────────────────────────────────────────────────────

export type ProgressionAction = 'increase' | 'maintain' | 'reduce' | 'deload';

export interface ProgressionRecommendation {
  action: ProgressionAction;
  targetWeight: number;
  targetReps: number;
  reason: string; // short, explainable
  confidence: 'high' | 'medium' | 'low';
}

export type FatigueLevel = 'none' | 'mild' | 'moderate' | 'elevated';

export interface FatigueSignal {
  level: FatigueLevel;
  reason: string;
  affectedMuscleGroups?: string[];
  suggestion: string;
}

export interface RecoverySuggestion {
  text: string;
  priority: 'info' | 'suggest' | 'recommend';
  reason: string;
}

export interface WarmupSet {
  weight: number;
  reps: number;
  percentOfWorkWeight: number;
}

export interface WarmupPlan {
  sets: WarmupSet[];
  note: string | null;
}

export type InsightType =
  | 'volume_trend'
  | 'pr_milestone'
  | 'frequency_gap'
  | 'recovery_quality'
  | 'consistency'
  | 'technique';

export interface TrainingInsight {
  type: InsightType;
  text: string; // one-liner, Apple Fitness style
  detail?: string; // optional short elaboration
  severity: 'positive' | 'neutral' | 'attention';
}

export interface ContextualTip {
  text: string;
  trigger: string; // why this tip fired
  urgency: 'subtle' | 'notice' | 'alert';
}
