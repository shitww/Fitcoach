// ── On Exercise Completed ───────────────────────────────────────────────────
// Updates predictive state after each exercise in a workout.
// ─────────────────────────────────────────────────────────────────────────────

import type { PredictiveRuntimeState, PredictedExerciseCandidate } from '@/types/predictive-flow';

/** Mark an exercise as completed and update runtime state. */
export function onExerciseCompleted(
  state: PredictiveRuntimeState,
  exerciseId: string,
  nextPredictions?: PredictedExerciseCandidate[]
): PredictiveRuntimeState {
  if (state.completed.includes(exerciseId)) return state;

  const completed = [...state.completed, exerciseId];

  // Remove from current queue
  const currentQueue = state.currentQueue.filter(
    (item) => item.exerciseId !== exerciseId
  );

  // Update estimates
  const avgExerciseDuration = state.originalQueue
    ? state.originalQueue.estimatedDurationMin /
      Math.max(state.originalQueue.totalExercises, 1)
    : 5;
  const remainingDurationEstimate = Math.max(
    0,
    state.remainingDurationEstimate - avgExerciseDuration
  );

  return {
    ...state,
    completed,
    currentQueue,
    nextPredictions: nextPredictions ?? state.nextPredictions,
    remainingDurationEstimate,
    lastUpdatedAt: new Date().toISOString(),
  };
}
