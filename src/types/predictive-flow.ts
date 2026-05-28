// ── Predictive Flow Contracts ────────────────────────────────────────────────
// UI-facing type definitions for the predictive workout system.
// All UI components consume only these types. Internal algorithms are hidden.
// ─────────────────────────────────────────────────────────────────────────────

// ── Core Prediction Primitives ───────────────────────────────────────────────

/** A single explainable reason for a prediction. */
export interface PredictionReason {
  type:
    | 'recent_history'
    | 'recovery_state'
    | 'frequency'
    | 'transition_graph'
    | 'training_style'
    | 'time_spacing'
    | 'muscle_balance'
    | 'equipment_availability'
    | 'pattern_match'
    | 'user_affinity'
    | 'fatigue_ordering';
  text: string; // Human-readable, localized
  confidence: number; // 0-1, how strongly this reason contributes
}

/** A signal used internally to build predictions. */
export interface PredictionSignal {
  name: string;
  value: number; // normalized 0-1
  weight: number; // contribution weight in final score
  source: string; // which engine produced this
}

// ── Session Prediction ───────────────────────────────────────────────────────

/** A predicted workout split (e.g. "push", "pull", "legs", "upper"). */
export interface PredictedWorkoutSession {
  predictedSplit: string; // e.g. "push", "pull", "legs", "upper", "fullbody"
  confidence: number; // 0-1
  supportingSignals: PredictionSignal[];
  suggestedExercises: PredictedExerciseCandidate[];
  reasoning: PredictionReason[];
  estimatedDurationMin: number;
  targetMuscleGroups: string[];
}

/** A candidate exercise within a predicted session. */
export interface PredictedExerciseCandidate {
  exerciseId: string;
  exerciseName: string;
  score: number; // 0-1
  reasoning: PredictionReason[];
  basedOn: ('transition' | 'recovery' | 'frequency' | 'affinity' | 'muscle_balance')[];
  estimatedSets: number;
  estimatedStartingWeight: number | null;
}

// ── Resume Flow ───────────────────────────────────────────────────────────────

/** A candidate for "continue previous workout" quick start. */
export interface ResumeWorkoutCandidate {
  workoutId: string;
  label: string; // e.g. "Continue Push Day"
  description: string;
  lastDate: string;
  lastExercises: string[];
  confidence: number;
  estimatedDurationMin: number;
  expectedVolume: number;
  isRepeat: boolean; // same split as a previous session
}

/** An exercise within a resumed session. */
export interface ResumeExercise {
  exerciseId: string;
  exerciseName: string;
  lastWeight: number;
  lastReps: number;
  lastVolume: number;
  targetSets: number;
  suggestedWeight: number;
  deltaFromLast: string; // e.g. "+2.5kg", "same"
}

// ── Exercise Queue ─────────────────────────────────────────────────────────────

/** A complete suggested exercise queue for a session. */
export interface SuggestedExerciseQueue {
  queueId: string;
  sessionType: string;
  exercises: QueueExerciseItem[];
  totalExercises: number;
  estimatedDurationMin: number;
  estimatedTotalVolume: number;
  movementPatternBalance: Record<string, number>;
  reasoning: PredictionReason[];
}

/** A single item in the suggested queue. */
export interface QueueExerciseItem {
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  estimatedSets: number;
  estimatedStartingWeight: number | null;
  targetMuscle: string;
  movementPattern: string;
  fatiguePosition: 'high' | 'moderate' | 'low'; // where in session it should appear
  warmupRequired: boolean;
}

// ── Warmup ─────────────────────────────────────────────────────────────────────

/** A recommended warmup step. */
export interface WarmupRecommendation {
  id: string;
  name: string;
  description: string;
  targetMuscles: string[];
  targetMovementPatterns: string[];
  type: 'activation' | 'mobility' | 'ramp_up' | 'movement_prep';
  durationSec: number;
  reason: string;
}

/** A complete warmup flow for a target exercise. */
export interface WarmupFlow {
  targetExerciseId: string;
  targetExerciseName: string;
  steps: WarmupRecommendation[];
  totalDurationSec: number;
  priority: 'required' | 'recommended' | 'optional';
}

// ── Quick Start ────────────────────────────────────────────────────────────────

/** A quick-start suggestion for the training surface. */
export interface QuickStartSuggestion {
  id: string;
  type: 'resume' | 'predicted_split' | 'frequent' | 'time_based' | 'recovery_based';
  label: string; // e.g. "Continue Push Day"
  subtitle: string; // e.g. "Last: 3 days ago · 6 exercises"
  icon: 'play' | 'repeat' | 'clock' | 'zap' | 'target';
  confidence: number;
  estimatedDurationMin: number;
  targetMuscleGroups: string[];
  primaryAction: 'resume' | 'start_new' | 'suggest_queue';
  metadata: {
    workoutId?: string;
    sessionType?: string;
    exerciseCount?: number;
    lastDate?: string;
  };
}

/** A one-tap workout ready to begin. */
export interface OneTapWorkout {
  title: string;
  subtitle: string;
  exercises: { exerciseId: string; name: string; sets: number; weightHint: string | null }[];
  estimatedDurationMin: number;
  warmupFlows: WarmupFlow[];
  reasoning: PredictionReason[];
}

// ── Context-Aware Ranking ──────────────────────────────────────────────────────

/** Context used to score exercises dynamically during a workout. */
export interface WorkoutContext {
  sessionType: string;
  completedExercises: string[];
  remainingMuscleGroups: string[];
  completedMovementPatterns: string[];
  currentFatigueEstimate: number; // 0-100
  availableEquipment: string[];
  targetDurationMin: number;
  elapsedMin: number;
}

/** Result of context-aware ranking. */
export interface ContextAwareRankingResult {
  candidates: PredictedExerciseCandidate[];
  topPick: PredictedExerciseCandidate | null;
  needsWarmup: boolean;
  sessionBalance: Record<string, number>;
}

// ── Runtime State ──────────────────────────────────────────────────────────────

/** Current predictive state during an active workout. */
export interface PredictiveRuntimeState {
  workoutId: string;
  originalQueue: SuggestedExerciseQueue | null;
  currentQueue: QueueExerciseItem[];
  completed: string[];
  nextPredictions: PredictedExerciseCandidate[];
  remainingDurationEstimate: number;
  remainingVolumeEstimate: number;
  lastUpdatedAt: string;
}

// ── Predictive Surface ─────────────────────────────────────────────────────────

/** The complete predictive surface for the training page.
 *  UI components render from this single object.
 */
export interface PredictiveWorkoutSurface {
  userId: string;
  generatedAt: string;
  quickStartSuggestions: QuickStartSuggestion[];
  predictedSession: PredictedWorkoutSession | null;
  resumeCandidates: ResumeWorkoutCandidate[];
  suggestedQueue: SuggestedExerciseQueue | null;
  muscleRecoverySnapshot: Record<string, number>; // muscleGroup -> recoveryScore
  todayContext: {
    dayOfWeek: number;
    hourOfDay: number;
    daysSinceLastWorkout: number;
    lastWorkoutSplit: string | null;
  };
}
