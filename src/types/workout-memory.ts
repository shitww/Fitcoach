// ── Workout Memory Type System ───────────────────────────────────────────────
// Deterministic, explainable, local-first behavior memory for FitCoach.
// No AI/LLM dependencies. Designed to power future predictive systems.
// ─────────────────────────────────────────────────────────────────────────────

/** A normalized workout set from any source (DB, local cache, imported). */
export interface MemoryWorkoutSet {
  setNumber: number;
  weight: number;
  reps: number;
  rir: number | null;
  isFailure: boolean;
  isPR: boolean;
  type: 'W' | 'D' | string; // W = working, D = drop, etc.
}

/** A single exercise within a remembered workout session. */
export interface MemoryWorkoutExercise {
  exerciseName: string;
  exerciseId?: string | null; // FK to Exercise.id when available
  muscleGroup: string;
  sets: MemoryWorkoutSet[];
  orderIndex: number; // 0-based position in session
}

/** Canonical representation of a completed workout session.
 *  Decoupled from DB schema; can be built from Workout + WorkoutSet[]
 *  or reconstructed from localStorage.
 */
export interface WorkoutSessionMemory {
  workoutId: string;
  userId: string;
  date: string; // ISO YYYY-MM-DD
  startedAt: string; // ISO datetime
  endedAt?: string; // ISO datetime
  durationSec: number;
  exercises: MemoryWorkoutExercise[];
  totalVolume: number;
  muscleGroups: string[]; // deduplicated
  equipmentUsed: string[]; // inferred or explicit
  estimatedFatigueScore: number; // 0-100, derived
}

/** Performance snapshot for a single exercise.
 *  Aggregated across all historical sessions.
 */
export interface ExercisePerformanceSnapshot {
  exerciseId?: string | null;
  exerciseName: string;

  // Last session stats
  lastWeight: number;
  lastReps: number;
  lastVolume: number;
  lastPerformedAt: string; // ISO date

  // Best-ever stats
  bestWeight: number;
  bestVolume: number;
  best1RMEstimate: number;

  // Rolling averages
  averageVolume: number; // over last N sessions
  averageReps: number;
  averageWeight: number;

  // Frequency
  recentFrequency: number; // sessions in last 30 days
  totalSessions: number;

  // Trend
  volumeTrend: 'up' | 'down' | 'stable' | 'insufficient_data';
}

/** Timeline of recent workout sessions, newest first. */
export interface WorkoutTimeline {
  sessions: WorkoutSessionMemory[];
  totalSessions: number;
  firstWorkoutDate: string | null;
  lastWorkoutDate: string | null;
  currentStreak: number;
  longestStreak: number;
}

/** Recovery state for a single muscle group.
 *  Deterministic model based on last trained date and session intensity.
 */
export interface MuscleRecoveryState {
  muscleGroup: string;
  lastTrainedAt: string | null; // ISO date
  daysSinceTrained: number;
  recoveryScore: number; // 0-100, higher = more recovered
  lastSessionVolume: number;
  estimatedFatigueContribution: number;
  status: 'recovered' | 'recovering' | 'fatigued' | 'unknown';
}

/** Recovery snapshot for all tracked muscle groups. */
export interface BodyRecoverySnapshot {
  muscleGroups: MuscleRecoveryState[];
  overallRecoveryScore: number; // weighted average
  mostFatigued: MuscleRecoveryState | null;
  fullyRecovered: MuscleRecoveryState[];
}

/** Aggregated weekly summary for pattern detection. */
export interface WeeklyTrainingSummary {
  weekStart: string; // ISO date (Monday)
  sessionCount: number;
  totalVolume: number;
  totalDurationSec: number;
  muscleGroups: string[];
  exerciseNames: string[];
  avgFatigueScore: number;
}

/** User-level workout intelligence — the top-level memory object. */
export interface UserWorkoutMemory {
  userId: string;
  version: number;
  lastUpdatedAt: string; // ISO datetime
  timeline: WorkoutTimeline;
  exerciseSnapshots: Record<string, ExercisePerformanceSnapshot>;
  recoverySnapshot: BodyRecoverySnapshot;
  weeklySummaries: WeeklyTrainingSummary[];
}

// ── Food Memory Types ───────────────────────────────────────────────────────

/** A normalized food log entry. */
export interface MemoryFoodLog {
  foodId: string;
  foodName: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  date: string; // ISO YYYY-MM-DD
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingG: number;
}

/** Snapshot for a single food item's usage history. */
export interface FoodUsageSnapshot {
  foodId: string;
  foodName: string;
  totalLogs: number;
  lastLoggedAt: string;
  frequency30d: number;
  frequency7d: number;
  commonMealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other' | null;
  typicalServingG: number; // median
}

/** Detected meal pattern: foods that commonly appear together. */
export interface MealPattern {
  patternId: string;
  foodIds: string[];
  foodNames: string[];
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  occurrenceCount: number;
  firstSeen: string;
  lastSeen: string;
}

/** User-level food intelligence. */
export interface UserFoodMemory {
  userId: string;
  version: number;
  lastUpdatedAt: string;
  foodSnapshots: Record<string, FoodUsageSnapshot>;
  mealPatterns: MealPattern[];
  recentLogs: MemoryFoodLog[]; // last 30 days, newest first
}

// ── Behavior Memory Snapshot ──────────────────────────────────────────────────

/** The complete persisted behavior memory for a user.
 *  This is what gets serialized to localStorage / IndexedDB / server.
 */
export interface BehaviorMemorySnapshot {
  version: number; // schema version for migration
  userId: string;
  createdAt: string;
  updatedAt: string;
  workoutMemory: UserWorkoutMemory;
  foodMemory: UserFoodMemory;
}

// ── Ranking Types ────────────────────────────────────────────────────────────

/** Explainable basis for a single ranking decision. */
export interface RankingBasis {
  factor: 'recency' | 'frequency' | 'affinity' | 'recovery' | 'pattern' | 'trend';
  score: number; // normalized 0-1
  explanation: string; // human-readable, e.g. "Last used 2 days ago"
}

/** A ranked item with explainable basis. */
export interface RankedItem<T> {
  item: T;
  totalScore: number;
  basis: RankingBasis[];
}

// ── Transition Graph Types ───────────────────────────────────────────────────

/** A single directed edge in the exercise transition graph. */
export interface ExerciseTransition {
  fromExerciseId: string;
  toExerciseId: string;
  count: number;
  probability: number; // count / total transitions from fromExerciseId
  lastObservedAt: string;
}

/** The full transition graph for a user. */
export interface ExerciseTransitionGraph {
  userId: string;
  edges: Record<string, ExerciseTransition[]>; // keyed by fromExerciseId
  totalTransitions: number;
  lastUpdatedAt: string;
}

// ── Affinity Types ───────────────────────────────────────────────────────────

/** User preference affinity for a specific exercise. */
export interface UserExerciseAffinity {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  frequencyScore: number;
  recencyScore: number;
  consistencyScore: number;
  overallScore: number;
  rank: number;
  basis: string[];
}

/** Equipment preference scores. */
export interface EquipmentAffinity {
  equipment: string;
  usageCount: number;
  usageRatio: number; // 0-1
  score: number; // 0-1, normalized
}

/** Detected training style classification. */
export interface TrainingStyleProfile {
  primaryStyle: TrainingStyle;
  secondaryStyles: TrainingStyle[];
  confidence: number; // 0-1
  basis: string[]; // explainable evidence
}

export const TRAINING_STYLES = [
  'strength_focused',
  'hypertrophy_focused',
  'high_volume',
  'minimalist',
  'machine_heavy',
  'compound_heavy',
  'unilateral_focused',
  'cardio_focused',
  'mixed',
] as const;

export type TrainingStyle = (typeof TRAINING_STYLES)[number];
