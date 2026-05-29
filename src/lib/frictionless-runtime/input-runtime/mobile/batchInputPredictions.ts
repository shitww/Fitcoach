// ── Batch Input Predictions ───────────────────────────────────────────────────
// Coalesces rapid keystrokes into a single prediction call.
// ─────────────────────────────────────────────────────────────────────────────

import type { BatchedInputPrediction, InputIntentPrediction } from '@/types/frictionless-runtime';
import { predictInputIntent } from '../predictInputIntent';
import type { PredictIntentInput } from '../predictInputIntent';

export interface PendingInputUpdate {
  rawInput: string;
  timestamp: number;
  context: PredictIntentInput['context'];
}

/** Collapse a queue of rapid input events into a single prediction.
 *  Returns the prediction for the most recent input only.
 */
export function batchInputPredictions(
  pending: readonly PendingInputUpdate[],
  baseInput: Omit<PredictIntentInput, 'rawInput' | 'context'>
): BatchedInputPrediction {
  if (pending.length === 0) {
    return {
      timestamp: new Date().toISOString(),
      predictions: [],
      processedCount: 0,
      deferredCount: 0,
      totalLatencyMs: 0,
    };
  }

  const startTs = Date.now();

  // Only process the most recent input — discard intermediate keystrokes
  const latest = pending[pending.length - 1];
  const deferred = pending.length - 1;

  const prediction = predictInputIntent({
    ...baseInput,
    rawInput: latest.rawInput,
    context: latest.context,
  });

  return {
    timestamp: new Date().toISOString(),
    predictions: [prediction],
    processedCount: 1,
    deferredCount: deferred,
    totalLatencyMs: Date.now() - startTs,
  };
}

/** Determine if a new input event should trigger an immediate prediction
 *  or be queued for batch processing.
 */
export function shouldProcessImmediately(
  rawInput: string,
  previousInput: string,
  isInWorkout: boolean
): boolean {
  // Always process immediately if input is empty (user cleared field)
  if (rawInput.length === 0) return true;

  // Process immediately if a space or separator was added (word boundary)
  if (rawInput.endsWith(' ') || rawInput.endsWith(',')) return true;

  // Process if input reaches a recognizable complete value
  if (/^\d+(?:\.\d+)?$/.test(rawInput.trim()) && rawInput.length >= 2 && isInWorkout) return true;

  // Otherwise, defer to batch
  return false;
}
