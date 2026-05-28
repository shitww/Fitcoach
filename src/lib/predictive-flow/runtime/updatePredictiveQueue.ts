// ── Update Predictive Queue ──────────────────────────────────────────────────
// Dynamically re-ranks the remaining queue based on completed work.
// ─────────────────────────────────────────────────────────────────────────────

import type { PredictiveRuntimeState, PredictedExerciseCandidate } from '@/types/predictive-flow';

/** Re-rank the remaining queue using fresh predictions.
 *  Lightweight: swaps order, does not rebuild from scratch.
 */
export function updatePredictiveQueue(
  state: PredictiveRuntimeState,
  freshPredictions: readonly PredictedExerciseCandidate[]
): PredictiveRuntimeState {
  if (freshPredictions.length === 0 || state.currentQueue.length === 0) {
    return {
      ...state,
      nextPredictions: [...freshPredictions],
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  // Reorder remaining queue to prioritize fresh predictions
  const predictionOrder = new Map(
    freshPredictions.map((p, i) => [p.exerciseId, i])
  );

  const reordered = [...state.currentQueue].sort((a, b) => {
    const aRank = predictionOrder.get(a.exerciseId) ?? 999;
    const bRank = predictionOrder.get(b.exerciseId) ?? 999;
    return aRank - bRank;
  });

  // Re-assign order indices
  reordered.forEach((item, i) => {
    item.orderIndex = i;
  });

  return {
    ...state,
    currentQueue: reordered,
    nextPredictions: [...freshPredictions],
    lastUpdatedAt: new Date().toISOString(),
  };
}
