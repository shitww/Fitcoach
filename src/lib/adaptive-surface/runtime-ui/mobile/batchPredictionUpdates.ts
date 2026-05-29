// ── Batch Prediction Updates ─────────────────────────────────────────────────
// Batches multiple prediction changes into a single UI update.
// ─────────────────────────────────────────────────────────────────────────────

import type { BatchedPredictionUpdate, NextExercisePrediction, SurfaceAction } from '@/types/adaptive-surface';
import type { PredictedExerciseCandidate } from '@/types/predictive-flow';

export interface PendingPredictionUpdate {
  timestamp: number;
  type: 'candidate_added' | 'candidate_removed' | 'score_changed' | 'queue_reorder';
  candidateId: string;
  newScore?: number;
}

/** Collect pending updates into a single batch.
 *  Reduces React re-render count by coalescing rapid changes.
 */
export function batchPredictionUpdates(
  pending: readonly PendingPredictionUpdate[],
  currentPredictions: readonly NextExercisePrediction[]
): BatchedPredictionUpdate {
  const affectedCards = new Set<string>();
  let queueChanged = false;
  let confidenceChanged = false;
  const newPredictions: NextExercisePrediction[] = [];

  for (const update of pending) {
    affectedCards.add(update.candidateId);

    switch (update.type) {
      case 'candidate_added':
        confidenceChanged = true;
        break;
      case 'candidate_removed':
        queueChanged = true;
        confidenceChanged = true;
        break;
      case 'score_changed':
        confidenceChanged = true;
        if (update.newScore !== undefined && update.newScore > 0.5) {
          queueChanged = true;
        }
        break;
      case 'queue_reorder':
        queueChanged = true;
        break;
    }
  }

  // Rebuild predictions from current state
  const mapped: NextExercisePrediction[] = currentPredictions.map((p) => ({
    exerciseId: p.exerciseId,
    exerciseName: p.exerciseName,
    score: p.score,
    confidence: p.confidence,
    reasoning: p.reasoning,
    basedOn: p.basedOn,
    oneTapAction: p.oneTapAction ?? {
      id: `batch_${p.exerciseId}`,
      label: 'Add',
      icon: 'plus',
      variant: 'ghost',
      priority: 'secondary',
      enabled: true,
    } as SurfaceAction,
  }));

  return {
    timestamp: new Date().toISOString(),
    affectedCards: Array.from(affectedCards),
    newPredictions: mapped,
    queueChanged,
    confidenceChanged,
  };
}

/** Flush queued updates into a single surface patch.
 *  Returns null if no meaningful changes occurred.
 */
export function flushPendingUpdates(
  pending: readonly PendingPredictionUpdate[],
  currentPredictions: readonly NextExercisePrediction[]
): BatchedPredictionUpdate | null {
  if (pending.length === 0) return null;

  const batch = batchPredictionUpdates(pending, currentPredictions);

  // Only return if something actually changed
  if (!batch.queueChanged && !batch.confidenceChanged && batch.affectedCards.length === 0) {
    return null;
  }

  return batch;
}
