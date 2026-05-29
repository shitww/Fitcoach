// ── Track Prediction Accuracy ─────────────────────────────────────────────────
// Records and analyzes how accurate set predictions have been over time.
// ─────────────────────────────────────────────────────────────────────────────

import type { PredictionOutcome, RuntimeMetric } from '@/types/runtime-reliability';
import { recordMetric } from './monitorRuntimeHealth';
import { recordPredictionOutcome } from '../trust/buildConfidenceCalibration';

export interface SetPredictionFeedback {
  predictionId: string;
  exerciseId: string;
  predictedWeight: number;
  predictedReps: number;
  actualWeight: number;
  actualReps: number;
  sessionId: string | null;
}

/** Record a single set prediction's outcome after the user logs the set.
 *  This feeds both trust calibration and health monitoring.
 */
export function trackSetPrediction(feedback: SetPredictionFeedback): void {
  const weightDeltaPct =
    feedback.predictedWeight > 0
      ? Math.abs(feedback.predictedWeight - feedback.actualWeight) / feedback.predictedWeight
      : 0;

  const repsDelta = Math.abs(feedback.predictedReps - feedback.actualReps);

  const outcome: PredictionOutcome = {
    predictionId: feedback.predictionId,
    exerciseId: feedback.exerciseId,
    predictedWeight: feedback.predictedWeight,
    predictedReps: feedback.predictedReps,
    actualWeight: feedback.actualWeight,
    actualReps: feedback.actualReps,
    wasAccepted: isAccepted(feedback),
    wasModified: isModified(feedback),
    weightDeltaPct,
    repsDelta,
    recordedAt: new Date().toISOString(),
  };

  // Store for trust calibration
  recordPredictionOutcome(outcome);

  // Store as metric for health monitoring
  const accuracy = weightDeltaPct <= 0.1 && repsDelta <= 1 ? 1 : 0;
  const metric: RuntimeMetric = {
    metricId: `acc_${feedback.predictionId}`,
    type: 'accuracy',
    value: accuracy,
    unit: 'boolean',
    recordedAt: new Date().toISOString(),
    sessionId: feedback.sessionId,
  };
  recordMetric(metric);
}

/** Record prediction latency (time from request to display). */
export function trackPredictionLatency(
  latencyMs: number,
  sessionId: string | null
): void {
  recordMetric({
    metricId: `lat_${Date.now()}`,
    type: 'latency',
    value: latencyMs,
    unit: 'ms',
    recordedAt: new Date().toISOString(),
    sessionId,
  });
}

/** Record current memory usage snapshot. */
export function trackMemoryUsage(estimatedKb: number): void {
  recordMetric({
    metricId: `mem_${Date.now()}`,
    type: 'memory',
    value: estimatedKb,
    unit: 'kb',
    recordedAt: new Date().toISOString(),
    sessionId: null,
  });
}

function isAccepted(fb: SetPredictionFeedback): boolean {
  return fb.actualWeight === fb.predictedWeight && fb.actualReps === fb.predictedReps;
}

function isModified(fb: SetPredictionFeedback): boolean {
  return fb.actualWeight !== fb.predictedWeight || fb.actualReps !== fb.predictedReps;
}
