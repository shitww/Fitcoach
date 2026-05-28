// ── Prediction Confidence Calculator ──────────────────────────────────────────
// Derives an overall confidence score from individual signal strengths.
// ─────────────────────────────────────────────────────────────────────────────

import type { PredictionSignal } from '@/types/predictive-flow';

export interface ConfidenceBreakdown {
  overall: number; // 0-1
  primarySignal: string;
  weakSignals: string[];
  isReliable: boolean; // overall >= 0.6
}

/** Calculate overall prediction confidence from signals.
 *  Weighted harmonic mean of top signals — rewards strong consensus.
 */
export function calculatePredictionConfidence(
  signals: readonly PredictionSignal[]
): ConfidenceBreakdown {
  if (signals.length === 0) {
    return { overall: 0, primarySignal: 'none', weakSignals: [], isReliable: false };
  }

  // Sort by weighted contribution
  const sorted = [...signals].sort(
    (a, b) => b.value * b.weight - a.value * a.weight
  );

  const primary = sorted[0];
  const primarySignal = primary.name;

  // Harmonic mean of top 3 signals
  const top3 = sorted.slice(0, 3);
  const weightedValues = top3.map((s) => s.value * s.weight);
  const sum = weightedValues.reduce((a, b) => a + b, 0);
  const harmonic =
    sum > 0
      ? weightedValues.length / weightedValues.reduce((acc, v) => acc + 1 / Math.max(v, 0.001), 0)
      : 0;

  const overall = Math.min(1, Math.round(harmonic * 1000) / 1000);

  const weakSignals = sorted
    .filter((s) => s.value * s.weight < 0.2)
    .map((s) => s.name);

  return {
    overall,
    primarySignal,
    weakSignals,
    isReliable: overall >= 0.6,
  };
}

/** Derive confidence for a single exercise candidate. */
export function calculateCandidateConfidence(
  candidateScore: number,
  reasoningCount: number
): number {
  // More reasoning signals = higher confidence up to a point
  const signalBonus = Math.min(0.1, reasoningCount * 0.02);
  const confidence = candidateScore * 0.9 + signalBonus;
  return Math.min(1, Math.round(confidence * 1000) / 1000);
}
