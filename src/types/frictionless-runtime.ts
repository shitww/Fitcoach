// ── Frictionless Runtime Contracts ───────────────────────────────────────────
// UI-facing type definitions for zero-friction fitness logging.
// Phase 5: Predictive confirmation replaces manual entry.
// All UI components consume only these types. Internal algorithms are hidden.
// ─────────────────────────────────────────────────────────────────────────────

import type { PredictionReason } from './predictive-flow';

// ── Set Prediction ─────────────────────────────────────────────────────────────

/** How the predicted set was derived. */
export type ProgressionType =
  | 'progressive_overload'  // weight or reps increased from last session
  | 'same_as_last'          // exact repeat of previous set
  | 'auto_regulation'       // adjusted based on RIR / fatigue
  | 'deload'               // intentional reduction
  | 'drop_set'             // post-failure reduction
  | 'warmup'               // reduced load for activation
  | 'first_set';            // no prior data — seed suggestion

/** A system-predicted set for the upcoming effort. */
export interface PredictedSetSuggestion {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  suggestedWeight: number; // kg
  suggestedReps: number;
  suggestedRir: number | null; // Reps In Reserve
  confidence: number; // 0-1
  progressionType: ProgressionType;
  reasoning: PredictionReason[];
  delta: {
    weightDelta: number; // vs last session (+2.5 = "heavier", -5 = "lighter")
    repsDelta: number;   // vs last session
    label: string;       // e.g. "+2.5kg from last session"
  };
}

/** Input data needed to generate a set prediction. */
export interface SetPredictionInput {
  exerciseId: string;
  exerciseName: string;
  setNumber: number;
  previousSetsThisSession: CompletedSetRecord[];
  lastSessionSets: CompletedSetRecord[];
  fatigueEstimate: number; // 0-100, higher = more fatigued
  workoutStyle: 'strength' | 'hypertrophy' | 'endurance' | 'mixed';
  volumeTrend: 'up' | 'down' | 'stable' | 'insufficient_data';
}

/** A logged set, past or present. */
export interface CompletedSetRecord {
  setNumber: number;
  weight: number;
  reps: number;
  rir: number | null;
  isFailure: boolean;
  isPR: boolean;
  type: 'warmup' | 'working' | 'drop' | 'back_off';
  performedAt: string;
}

// ── Quick Set Actions ──────────────────────────────────────────────────────────

/** Type of one-tap set action. */
export type QuickSetActionType =
  | 'repeat_last'     // identical to previous set
  | 'increase_weight' // suggested weight up
  | 'decrease_weight' // suggested weight down
  | 'increase_reps'   // same weight, more reps
  | 'decrease_reps'   // same weight, fewer reps
  | 'drop_set'        // automatic drop set
  | 'warmup_set'      // auto-filled warmup
  | 'custom';         // user-defined

/** A one-tap action to log a set instantly. */
export interface QuickSetAction {
  id: string;
  type: QuickSetActionType;
  label: string; // e.g. "Repeat 80kg × 8"
  displayWeight: string; // formatted, e.g. "80 kg"
  displayReps: string;   // formatted, e.g. "8"
  weight: number;
  reps: number;
  rir: number | null;
  isOneTap: boolean;
  confidence: number;
  reasoning: string; // single-line explanation
}

/** A set of quick action options presented to the user. */
export interface QuickSetActionPanel {
  exerciseId: string;
  setNumber: number;
  primaryAction: QuickSetAction;
  secondaryActions: QuickSetAction[];
  prediction: PredictedSetSuggestion;
  showWeightInput: boolean;
  showRepsInput: boolean;
}

// ── Workout Momentum ─────────────────────────────────────────────────────────

/** Status of the current training flow. */
export type MomentumStatus = 'flowing' | 'slowing' | 'stalled' | 'dropped';

/** Momentum action type. */
export type MomentumActionType =
  | 'continue_set'
  | 'start_next_exercise'
  | 'take_extended_rest'
  | 'end_session'
  | 'quick_set';

/** A specific momentum-recovery action. */
export interface MomentumAction {
  type: MomentumActionType;
  label: string;
  sublabel: string;
  urgency: 'immediate' | 'gentle' | 'informational';
  enabled: boolean;
}

/** Real-time momentum state during a workout. */
export interface WorkoutMomentumState {
  sessionId: string;
  score: number; // 0-100 (100 = perfect flow)
  status: MomentumStatus;
  setsSinceLastRest: number;
  elapsedSinceLastActionSec: number;
  restTimeCurrentSec: number;
  averageRestTimeSec: number;
  dropoffRisk: number; // 0-1 probability of session abandonment
  suggestedActions: MomentumAction[];
  warning: string | null; // e.g. "Rest time 4× usual — still going?"
  encouragement: string | null; // e.g. "Great pace! 3 sets in flow"
}

/** Dropoff detection result. */
export interface WorkoutDropoffSignal {
  detected: boolean;
  type: 'extended_rest' | 'long_gap' | 'session_end' | null;
  elapsedSec: number;
  thresholdSec: number;
  confidence: number;
  message: string;
}

// ── Rest Runtime ───────────────────────────────────────────────────────────────

/** What prompted the rest duration recommendation. */
export type RestRecommendationBasis =
  | 'strength_training'
  | 'hypertrophy_training'
  | 'endurance_training'
  | 'near_failure'
  | 'pr_attempt'
  | 'high_fatigue'
  | 'user_preference'
  | 'default';

/** A smart rest time recommendation. */
export interface RestRecommendation {
  exerciseId: string;
  setNumber: number;
  recommendedSec: number;
  minSec: number;
  maxSec: number;
  basis: RestRecommendationBasis;
  label: string; // e.g. "90 sec" or "2 min"
  reasoning: string;
}

/** Live state of a running rest timer. */
export interface RestTimerState {
  isActive: boolean;
  recommendedSec: number;
  elapsedSec: number;
  remainingSec: number;
  isComplete: boolean;
  completionType: 'timer_expired' | 'user_ready' | 'auto_advance' | null;
  label: string; // "1:30 remaining" or "Rest Complete"
  urgency: 'waiting' | 'ready_soon' | 'ready' | 'overdue';
}

// ── Food Parsing ────────────────────────────────────────────────────────────────

/** A single food candidate extracted from natural language input. */
export interface ParsedFoodCandidate {
  id: string;
  name: string;           // normalized name
  nameOriginal: string;   // as extracted from input
  nameDisplay: string;    // localized display name
  language: 'zh' | 'en' | 'mixed';
  servingSize: string;    // e.g. "1 bowl", "350ml", "1 serving"
  servingGrams: number | null;
  calorieEstimate: number; // kcal per serving
  macros: {
    proteinG: number;
    carbsG: number;
    fatG: number;
  } | null;
  confidence: number; // 0-1, how confident the parse is
  matchedAlias: string | null; // which alias triggered this match
  matchType: 'exact' | 'alias' | 'partial' | 'fuzzy';
}

/** Result of parsing a natural language food input. */
export interface FoodParseResult {
  rawInput: string;
  candidates: ParsedFoodCandidate[];
  totalCalorieEstimate: number;
  parseConfidence: number;
  unparsedTokens: string[]; // parts of input that couldn't be matched
  hasMixedLanguage: boolean;
}

// ── Quick Meal Capture ─────────────────────────────────────────────────────────

/** Meal time classification. */
export type MealTime = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'pre_workout' | 'post_workout';

/** A one-tap meal suggestion. */
export interface QuickMealSuggestion {
  id: string;
  type: 'recent' | 'frequent' | 'pattern' | 'repeat_yesterday' | 'meal_template';
  label: string;         // e.g. "Yesterday's Lunch"
  subtitle: string;      // e.g. "牛肉面 · 珍珠奶茶 · ~850 kcal"
  mealTime: MealTime;
  items: string[];       // list of food names
  calorieTotal: number;
  frequency: number;     // how often this pattern appears (0-1)
  lastUsedDate: string;
  isOneTap: boolean;
}

/** Panel of quick meal actions. */
export interface QuickMealPanel {
  mealTime: MealTime;
  recentSuggestions: QuickMealSuggestion[];
  frequentPatterns: QuickMealSuggestion[];
  repeatYesterdayOption: QuickMealSuggestion | null;
  showFoodInput: boolean;
  inputPlaceholder: string;
}

// ── Input Intent Prediction ────────────────────────────────────────────────────

/** What the user is likely trying to input. */
export type InputIntent =
  | 'weight_kg'      // "80", "82.5", "80kg"
  | 'weight_lb'      // "180lbs", "180"
  | 'reps'           // "8", "12"
  | 'rpe'            // "@8", "rpe 8"
  | 'rir'            // "2rir", "rir2"
  | 'exercise_name'  // "bench", "卧推"
  | 'food_name'      // "牛肉面", "chicken breast"
  | 'serving_size'   // "1碗", "200g"
  | 'duration_min'   // "30min", "45"
  | 'unknown';

/** A single inline suggestion for the current input. */
export interface InlineInputSuggestion {
  value: string;      // actual value to insert
  display: string;    // formatted display text
  type: InputIntent;
  confidence: number;
  autofillable: boolean;    // can be applied with one tap
  secondary?: string; // additional context, e.g. "last used"
}

/** Full prediction of what the user intends to input. */
export interface InputIntentPrediction {
  rawInput: string;
  detectedIntent: InputIntent;
  intentConfidence: number;
  suggestions: InlineInputSuggestion[];
  bestMatch: InlineInputSuggestion | null;
  context: 'set_logging' | 'food_logging' | 'exercise_search' | 'general';
  shouldAutoFill: boolean; // if confidence > threshold, auto-apply bestMatch
}

// ── Mobile Optimization ────────────────────────────────────────────────────────

/** Configuration for mobile input behavior. */
export interface MobileInputConfig {
  intentPredictionThrottleMs: number;  // min interval between predictions
  autoFillConfidenceThreshold: number; // 0-1, above this = auto-fill
  maxInlineSuggestions: number;
  keyboardDismissOnLogMs: number;      // dismiss keyboard after log
  batchPredictionWindowMs: number;
  enableHapticFeedback: boolean;
}

/** A batch of input predictions for coalesced processing. */
export interface BatchedInputPrediction {
  timestamp: string;
  predictions: InputIntentPrediction[];
  processedCount: number;
  deferredCount: number;
  totalLatencyMs: number;
}

// ── Frictionless Surface ───────────────────────────────────────────────────────

/** The top-level frictionless surface combining all runtime states. */
export interface FrictionlessRuntimeSurface {
  sessionId: string | null;
  currentExerciseId: string | null;
  setNumber: number;
  setActions: QuickSetActionPanel | null;
  momentumState: WorkoutMomentumState | null;
  restTimer: RestTimerState | null;
  inputIntent: InputIntentPrediction | null;
  mealPanel: QuickMealPanel | null;
  isInWorkout: boolean;
  isInFoodLog: boolean;
}
