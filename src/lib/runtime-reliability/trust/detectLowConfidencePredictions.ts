// ── Detect Low Confidence Predictions ────────────────────────────────────────
// Flags predictions that should be suppressed or shown with lower prominence.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PredictionTrustState,
  GlobalPredictionTrust,
} from '@/types/runtime-reliability';

export type PredictionDisplayMode =
  | 'full'        // show prediction prominently
  | 'subtle'      // show with lower visual weight
  | 'fallback'    // show generic fallback, not the specific prediction
  | 'suppressed'; // do not show any prediction

export interface PredictionDisplayDecision {
  exerciseId: string;
  mode: PredictionDisplayMode;
  reason: string;
  showReasoning: boolean;
}

/** Decide how to display a prediction for a given exercise.
 *  Prevents recommendation spam when trust is low.
 */
export function detectLowConfidencePredictions(
  exerciseId: string,
  rawConfidence: number,
  global: GlobalPredictionTrust
): PredictionDisplayDecision {
  const trust = global.exerciseTrustMap[exerciseId];

  // No trust data yet — show subtly
  if (!trust) {
    return {
      exerciseId,
      mode: rawConfidence >= 0.8 ? 'subtle' : 'fallback',
      reason: 'No calibration data yet',
      showReasoning: false,
    };
  }

  // Hard suppression
  if (trust.shouldSuppressPrediction) {
    return {
      exerciseId,
      mode: 'suppressed',
      reason: trust.suppressReason ?? 'Prediction suppressed',
      showReasoning: false,
    };
  }

  // Full display for calibrated, high-trust predictions
  if (trust.calibrationLevel === 'calibrated' && trust.overallTrust >= 0.7) {
    return {
      exerciseId,
      mode: 'full',
      reason: 'High-confidence calibrated prediction',
      showReasoning: true,
    };
  }

  // Learning phase — show but less prominent
  if (trust.calibrationLevel === 'learning') {
    return {
      exerciseId,
      mode: 'subtle',
      reason: `Still learning (${trust.sampleSize} samples)`,
      showReasoning: true,
    };
  }

  // Raw confidence fallback when trust data is sparse
  if (rawConfidence >= 0.75) {
    return { exerciseId, mode: 'subtle', reason: 'Based on raw confidence', showReasoning: false };
  }

  return {
    exerciseId,
    mode: 'fallback',
    reason: 'Confidence too low for specific prediction',
    showReasoning: false,
  };
}

/** Batch-check all predictions and return a map of display decisions. */
export function batchDetectLowConfidence(
  exerciseIds: string[],
  confidences: Record<string, number>,
  global: GlobalPredictionTrust
): Record<string, PredictionDisplayDecision> {
  const result: Record<string, PredictionDisplayDecision> = {};
  for (const id of exerciseIds) {
    result[id] = detectLowConfidencePredictions(id, confidences[id] ?? 0, global);
  }
  return result;
}

/** Count how many predictions are being suppressed right now. */
export function countSuppressedPredictions(
  global: GlobalPredictionTrust
): number {
  return global.suppressedCount;
}
