// ── Calculate Prediction Trust ────────────────────────────────────────────────
// Scores prediction reliability from outcome history.
// Trust determines whether predictions are shown, suppressed, or degraded.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PredictionTrustState,
  PredictionOutcome,
  CalibrationLevel,
} from '@/types/runtime-reliability';

/** Minimum samples before trust scores are meaningful. */
const MIN_SAMPLE_SIZE = 5;

/** Acceptance rate below which predictions are suppressed. */
const SUPPRESSION_ACCEPTANCE_THRESHOLD = 0.25;

/** Accuracy below which predictions are flagged as unreliable. */
const LOW_ACCURACY_THRESHOLD = 0.4;

/** Calculate the trust state for a single exercise from outcome history. */
export function calculatePredictionTrust(
  exerciseId: string,
  exerciseName: string,
  outcomes: PredictionOutcome[]
): PredictionTrustState {
  const relevant = outcomes.filter((o) => o.exerciseId === exerciseId);
  const sampleSize = relevant.length;
  const now = new Date().toISOString();

  if (sampleSize === 0) {
    return newExerciseTrust(exerciseId, exerciseName, now);
  }

  const recentAccuracy = calculateAccuracy(relevant);
  const acceptanceRate = calculateAcceptanceRate(relevant);
  const overallTrust = computeOverallTrust(recentAccuracy, acceptanceRate, sampleSize);
  const calibrationLevel = deriveCalibrationLevel(sampleSize, overallTrust);
  const { shouldSuppress, suppressReason } = evaluateSuppression(
    sampleSize, acceptanceRate, recentAccuracy, calibrationLevel
  );

  return {
    exerciseId,
    exerciseName,
    overallTrust,
    recentAccuracy,
    acceptanceRate,
    sampleSize,
    calibrationLevel,
    shouldSuppressPrediction: shouldSuppress,
    suppressReason,
    lastEvaluatedAt: now,
  };
}

/** Compute overall trust score (0-1) from multiple signals. */
function computeOverallTrust(
  accuracy: number,
  acceptance: number,
  sampleSize: number
): number {
  // Weighted blend
  let trust = accuracy * 0.5 + acceptance * 0.5;

  // Penalize for small sample size (uncertain)
  if (sampleSize < MIN_SAMPLE_SIZE) {
    trust *= sampleSize / MIN_SAMPLE_SIZE;
  }

  return Math.max(0, Math.min(1, Math.round(trust * 100) / 100));
}

/** Prediction accuracy: how close was predicted vs actual? */
function calculateAccuracy(outcomes: PredictionOutcome[]): number {
  if (outcomes.length === 0) return 0;

  const accurateCount = outcomes.filter((o) => {
    const weightOk = Math.abs(o.weightDeltaPct) <= 0.1;  // within 10%
    const repsOk = Math.abs(o.repsDelta) <= 1;             // within 1 rep
    return weightOk && repsOk;
  }).length;

  return accurateCount / outcomes.length;
}

/** Acceptance rate: did the user use the prediction as-is? */
function calculateAcceptanceRate(outcomes: PredictionOutcome[]): number {
  if (outcomes.length === 0) return 0;
  const accepted = outcomes.filter((o) => o.wasAccepted && !o.wasModified).length;
  return accepted / outcomes.length;
}

function deriveCalibrationLevel(
  sampleSize: number,
  trust: number
): CalibrationLevel {
  if (sampleSize < MIN_SAMPLE_SIZE) return 'uncalibrated';
  if (trust < LOW_ACCURACY_THRESHOLD) return 'suppressed';
  if (sampleSize < 15) return 'learning';
  return 'calibrated';
}

function evaluateSuppression(
  sampleSize: number,
  acceptanceRate: number,
  accuracy: number,
  calibration: CalibrationLevel
): { shouldSuppress: boolean; suppressReason: string | null } {
  if (calibration === 'suppressed') {
    return { shouldSuppress: true, suppressReason: 'Accuracy consistently too low — waiting for more data' };
  }

  if (sampleSize >= MIN_SAMPLE_SIZE && acceptanceRate < SUPPRESSION_ACCEPTANCE_THRESHOLD) {
    return { shouldSuppress: true, suppressReason: 'User rarely accepts predictions — reducing intrusion' };
  }

  if (sampleSize >= MIN_SAMPLE_SIZE && accuracy < LOW_ACCURACY_THRESHOLD) {
    return { shouldSuppress: true, suppressReason: 'Predictions too inaccurate — learning more' };
  }

  return { shouldSuppress: false, suppressReason: null };
}

function newExerciseTrust(id: string, name: string, now: string): PredictionTrustState {
  return {
    exerciseId: id,
    exerciseName: name,
    overallTrust: 0.5, // neutral start
    recentAccuracy: 0,
    acceptanceRate: 0,
    sampleSize: 0,
    calibrationLevel: 'uncalibrated',
    shouldSuppressPrediction: false, // show by default for new exercises
    suppressReason: null,
    lastEvaluatedAt: now,
  };
}
