// ── Build Confidence Calibration ──────────────────────────────────────────────
// Builds the global trust map from all prediction outcomes.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  GlobalPredictionTrust,
  PredictionOutcome,
  PredictionTrustState,
} from '@/types/runtime-reliability';
import { calculatePredictionTrust } from './calculatePredictionTrust';

const OUTCOMES_STORAGE_KEY = 'fitcoach_prediction_outcomes';
const MAX_STORED_OUTCOMES = 200;

/** Build a complete global trust calibration from stored outcomes. */
export function buildConfidenceCalibration(
  exerciseList: { id: string; name: string }[]
): GlobalPredictionTrust {
  const outcomes = loadStoredOutcomes();
  const trustMap: Record<string, PredictionTrustState> = {};

  for (const ex of exerciseList) {
    trustMap[ex.id] = calculatePredictionTrust(ex.id, ex.name, outcomes);
  }

  const values = Object.values(trustMap);
  const overallTrust =
    values.length > 0
      ? values.reduce((sum, t) => sum + t.overallTrust, 0) / values.length
      : 0.5;

  return {
    overallSystemTrust: Math.round(overallTrust * 100) / 100,
    exerciseTrustMap: trustMap,
    suppressedCount: values.filter((t) => t.shouldSuppressPrediction).length,
    calibratedCount: values.filter((t) => t.calibrationLevel === 'calibrated').length,
    learningCount: values.filter((t) => t.calibrationLevel === 'learning').length,
    lastUpdatedAt: new Date().toISOString(),
  };
}

/** Record a new prediction outcome for future calibration. */
export function recordPredictionOutcome(outcome: PredictionOutcome): void {
  try {
    const existing = loadStoredOutcomes();
    const updated = [...existing, outcome];

    // Cap at max to prevent unbounded growth
    const trimmed = updated.slice(-MAX_STORED_OUTCOMES);
    localStorage.setItem(OUTCOMES_STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // Graceful degradation — outcome recording is non-critical
  }
}

/** Load stored prediction outcomes from localStorage. */
export function loadStoredOutcomes(): PredictionOutcome[] {
  try {
    const raw = localStorage.getItem(OUTCOMES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PredictionOutcome[];
  } catch {
    return [];
  }
}

/** Get the trust level for a single exercise. */
export function getExerciseTrust(
  global: GlobalPredictionTrust,
  exerciseId: string
): PredictionTrustState | null {
  return global.exerciseTrustMap[exerciseId] ?? null;
}
