// ── Adaptive Surface Contracts ────────────────────────────────────────────────
// UI-facing type definitions for the adaptive training UX layer.
// All UI components consume only these types. Internal algorithms are hidden.
// Phase 4: UX Runtime Integration — no new intelligence, just smart surfaces.
// ─────────────────────────────────────────────────────────────────────────────

import type { PredictionReason } from './predictive-flow';

// ── Shared Primitives ──────────────────────────────────────────────────────────

/** Visual prominence of a surface element. */
export type SurfaceProminence = 'hero' | 'primary' | 'secondary' | 'subtle';

/** A tap-able action on any adaptive surface. */
export interface SurfaceAction {
  id: string;
  label: string;
  icon: 'play' | 'repeat' | 'plus' | 'arrow-right' | 'zap' | 'clock' | 'target' | 'chevron-right' | 'dumbbell' | 'fire';
  variant: 'filled' | 'outline' | 'ghost';
  priority: SurfaceProminence;
  enabled: boolean;
  disabledReason?: string;
}

// ── Home Surface ─────────────────────────────────────────────────────────────

/** Recovery indicator for a single muscle group on the home surface. */
export interface HomeRecoveryBadge {
  muscleGroup: string;
  label: string; // localized
  recoveryScore: number; // 0-100
  status: 'recovered' | 'nearly_recovered' | 'fatigued' | 'very_fatigued';
  lastTrainedDaysAgo: number;
}

/** A quick-start entry on the home surface. */
export interface HomeQuickStart {
  id: string;
  title: string;
  subtitle: string;
  meta: string; // e.g. "6 exercises · 45 min"
  action: SurfaceAction;
  confidence: number;
  muscleGroups: string[];
  type: 'resume' | 'predicted_split' | 'frequent' | 'time_based' | 'quick' | 'recovery_based';
}

/** The complete adaptive home surface. */
export interface AdaptiveHomeSurface {
  userId: string;
  generatedAt: string;
  todayFocus: TodayFocus | null;
  quickStarts: HomeQuickStart[];
  recoveryBadges: HomeRecoveryBadge[];
  todayPrediction: {
    predictedSplit: string;
    confidence: number;
    reasoning: PredictionReason[];
  } | null;
  recentActivity: {
    lastWorkoutDate: string;
    daysSince: number;
    streakDays: number;
    lastSplit: string | null;
  };
  hasUnreadContext: boolean; // signals that recommendations exist
}

/** What the system thinks the user should focus on today. */
export interface TodayFocus {
  label: string;
  subtitle: string;
  priority: SurfaceProminence;
  action: SurfaceAction;
  muscleGroups: string[];
  estimatedDurationMin: number;
  reasoning: PredictionReason[];
}

// ── Training Surface ───────────────────────────────────────────────────────────

/** The adaptive training page surface. */
export interface AdaptiveTrainingSurface {
  sessionId: string | null;
  mode: 'planning' | 'active' | 'review' | 'empty';
  currentExercise: CurrentExerciseContext | null;
  nextPredictions: NextExercisePrediction[];
  sessionProgress: SessionProgress;
  smartActions: SmartActionSuggestion[];
  queue: ExerciseQueueItem[];
}

/** Live context for the currently active exercise. */
export interface CurrentExerciseContext {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  setNumber: number;
  totalSets: number;
  lastWeight: number | null;
  lastReps: number | null;
  bestWeight: number | null;
  bestReps: number | null;
  prStatus: 'none' | 'potential' | 'achieved';
  volumeTrend: string;
  recoveryContext: string;
  warmupRequired: boolean;
  suggestedActions: SurfaceAction[];
}

/** A predicted next exercise during an active session. */
export interface NextExercisePrediction {
  exerciseId: string;
  exerciseName: string;
  score: number;
  confidence: number;
  reasoning: PredictionReason[];
  basedOn: ('transition' | 'recovery' | 'frequency' | 'affinity' | 'muscle_balance')[];
  oneTapAction: SurfaceAction;
}

/** Overall session progress indicator. */
export interface SessionProgress {
  completedExercises: number;
  totalExercises: number;
  completedSets: number;
  totalSets: number;
  elapsedMin: number;
  estimatedRemainingMin: number;
  currentVolume: number;
}

/** A smart, context-aware action suggestion. */
export interface SmartActionSuggestion {
  id: string;
  type: 'increase_weight' | 'decrease_weight' | 'add_set' | 'reduce_rest' | 'swap_exercise' | 'finish_session' | 'start_warmup';
  label: string;
  description: string;
  action: SurfaceAction;
  priority: SurfaceProminence;
  context: string; // why this action is suggested right now
  confidence: number;
}

/** A single item in the live exercise queue. */
export interface ExerciseQueueItem {
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  status: 'pending' | 'current' | 'completed' | 'skipped';
  estimatedSets: number;
  targetMuscle: string;
}

// ── Recommendation Cards ───────────────────────────────────────────────────────

/** A rich, explainable exercise recommendation card. */
export interface ExerciseRecommendationCard {
  cardId: string;
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  score: number; // 0-1
  confidence: number; // 0-1
  prominence: SurfaceProminence;
  scoreLabel: string; // e.g. "Top Pick", "Great Match", "Try This"
  reasoning: PredictionReason[];
  metadata: {
    lastWeight: number | null;
    lastDate: string | null;
    frequency30d: number;
    recoveryScore: number;
    transitionProbability: number | null;
  };
  primaryAction: SurfaceAction;
  secondaryActions: SurfaceAction[];
}

/** Explanation panel for a single prediction. */
export interface PredictionExplanation {
  title: string;
  confidenceBadge: {
    label: string; // e.g. "High Confidence"
    level: 'high' | 'medium' | 'low';
    score: number;
  };
  reasons: PredictionReason[];
  topSignal: {
    name: string;
    value: number;
    description: string;
  };
}

/** A confidence badge for any recommendation. */
export interface ConfidenceBadge {
  score: number;
  label: string;
  color: 'green' | 'yellow' | 'orange' | 'red';
  tooltip: string;
}

// ── Empty States ───────────────────────────────────────────────────────────────

/** Never show a blank page — always provide an adaptive empty state. */
export interface AdaptiveEmptyState {
  type: 'cold_start' | 'no_history' | 'no_active_session' | 'all_recovered' | 'first_workout';
  headline: string;
  body: string;
  illustration: 'welcome' | 'explore' | 'ready' | 'rest' | 'celebrate';
  primaryAction: SurfaceAction;
  secondaryActions: SurfaceAction[];
  suggestions: string[];
  showOnboardingHint: boolean;
}

/** A surface for brand-new users with zero history. */
export interface ColdStartSurface {
  headline: string;
  body: string;
  suggestedFocusAreas: {
    label: string;
    muscleGroups: string[];
    reason: string;
    action: SurfaceAction;
  }[];
  popularFlows: {
    label: string;
    exercises: string[];
    action: SurfaceAction;
  }[];
}

// ── One-Tap Surface ────────────────────────────────────────────────────────────

/** The complete one-tap workout start surface. */
export interface OneTapWorkoutSurface {
  heroSuggestion: OneTapHero | null;
  quickOptions: OneTapOption[];
  recentOptions: OneTapOption[];
  hasActiveSession: boolean;
  activeSessionId: string | null;
}

/** The hero / primary one-tap suggestion. */
export interface OneTapHero {
  title: string;
  subtitle: string;
  meta: string;
  action: SurfaceAction;
  muscleGroups: string[];
  estimatedDurationMin: number;
  confidence: number;
  reasoning: PredictionReason[];
}

/** A compact one-tap option row. */
export interface OneTapOption {
  id: string;
  title: string;
  subtitle: string;
  icon: SurfaceAction['icon'];
  action: SurfaceAction;
  type: 'resume' | 'split' | 'frequent' | 'time_based' | 'muscle_group';
}

// ── Live Runtime ───────────────────────────────────────────────────────────────

/** The live workout runtime UI state. */
export interface LiveWorkoutRuntime {
  workoutId: string;
  phase: 'warmup' | 'working' | 'finishing';
  currentExerciseIndex: number;
  currentSetIndex: number;
  predictionsStale: boolean;
  nextRefreshInMs: number;
  pendingUpdates: string[];
  surface: AdaptiveTrainingSurface;
}

// ── Mobile Optimizations ───────────────────────────────────────────────────────

/** Configuration for mobile runtime update behavior. */
export interface MobileRuntimeConfig {
  predictionRefreshIntervalMs: number;
  maxQueuedUpdates: number;
  batchedUpdateIntervalMs: number;
  enablePredictivePreload: boolean;
  maxCardsInViewport: number;
  reduceMotion: boolean;
}

/** Result of a batched prediction update. */
export interface BatchedPredictionUpdate {
  timestamp: string;
  affectedCards: string[]; // cardIds
  newPredictions: NextExercisePrediction[];
  queueChanged: boolean;
  confidenceChanged: boolean;
}
