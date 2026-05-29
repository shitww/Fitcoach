// ── Build Live Prediction State ──────────────────────────────────────────────
// Creates the prediction state object used during an active session.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  NextExercisePrediction,
  LiveWorkoutRuntime,
  SurfaceAction,
} from '@/types/adaptive-surface';
import type { PredictedExerciseCandidate } from '@/types/predictive-flow';

export interface LivePredictionInput {
  currentExerciseId: string;
  completedExerciseIds: readonly string[];
  candidates: readonly PredictedExerciseCandidate[];
  elapsedMin: number;
  remainingDurationMin: number;
}

/** Build the live prediction state for the current session moment.
 *  Called every time the user completes an exercise or set.
 */
export function buildLivePredictionState(
  input: LivePredictionInput
): {
  predictions: NextExercisePrediction[];
  shouldShowPrediction: boolean;
  urgency: 'immediate' | 'relaxed' | 'hidden';
} {
  const { candidates, elapsedMin, remainingDurationMin } = input;

  // Don't show predictions if session is ending
  if (remainingDurationMin <= 5) {
    return { predictions: [], shouldShowPrediction: false, urgency: 'hidden' };
  }

  // Filter out completed exercises
  const completed = new Set(input.completedExerciseIds);
  const fresh = candidates.filter((c) => !completed.has(c.exerciseId));

  // Map to UI predictions
  const predictions: NextExercisePrediction[] = fresh.slice(0, 3).map((c, i) => ({
    exerciseId: c.exerciseId,
    exerciseName: c.exerciseName,
    score: c.score,
    confidence: c.score,
    reasoning: c.reasoning,
    basedOn: c.basedOn,
    oneTapAction: {
      id: `live_next_${c.exerciseId}`,
      label: i === 0 ? 'Next Up' : 'Add',
      icon: i === 0 ? 'arrow-right' : 'plus',
      variant: i === 0 ? 'filled' : 'ghost',
      priority: i === 0 ? 'primary' : 'secondary',
      enabled: true,
    } as SurfaceAction,
  }));

  // Urgency based on timing
  const urgency: typeof predictions = predictions;
  const urgencyLevel: 'immediate' | 'relaxed' | 'hidden' =
    elapsedMin > 30 && remainingDurationMin < 15
      ? 'relaxed'
      : predictions.length > 0
        ? 'immediate'
        : 'hidden';

  return {
    predictions,
    shouldShowPrediction: predictions.length > 0 && urgencyLevel !== 'hidden',
    urgency: urgencyLevel,
  };
}

/** Check if the prediction state should trigger a UI refresh.
 *  Used by the mobile optimizer to batch updates.
 */
export function shouldRefreshPredictions(
  previous: LiveWorkoutRuntime,
  current: LiveWorkoutRuntime
): boolean {
  if (previous.currentExerciseIndex !== current.currentExerciseIndex) return true;
  if (previous.phase !== current.phase) return true;
  if (previous.predictionsStale && !current.predictionsStale) return true;
  return false;
}
