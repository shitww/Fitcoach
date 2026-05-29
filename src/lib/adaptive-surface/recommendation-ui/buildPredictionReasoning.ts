// ── Build Prediction Reasoning ────────────────────────────────────────────────
// Converts raw prediction reasons into a user-facing explanation panel.
// ─────────────────────────────────────────────────────────────────────────────

import type { PredictionExplanation } from '@/types/adaptive-surface';
import type { PredictedExerciseCandidate } from '@/types/predictive-flow';

/** Build a human-readable explanation for a recommendation.
 *  Designed to be rendered inline or in a detail sheet.
 */
export function buildPredictionExplanation(
  candidate: PredictedExerciseCandidate
): PredictionExplanation {
  const title = `Why ${candidate.exerciseName}?`;

  const confidenceLevel: PredictionExplanation['confidenceBadge']['level'] =
    candidate.score >= 0.75 ? 'high' : candidate.score >= 0.5 ? 'medium' : 'low';

  const confidenceLabel =
    confidenceLevel === 'high'
      ? 'High Confidence'
      : confidenceLevel === 'medium'
        ? 'Medium Confidence'
        : 'Exploratory Suggestion';

  const topReason = candidate.reasoning[0];
  const topSignal = {
    name: topReason?.type ?? 'general',
    value: topReason?.confidence ?? candidate.score,
    description: topReason?.text ?? 'Based on your training patterns',
  };

  return {
    title,
    confidenceBadge: {
      label: confidenceLabel,
      level: confidenceLevel,
      score: candidate.score,
    },
    reasons: candidate.reasoning,
    topSignal,
  };
}

/** Build a compact reasoning summary for inline display.
 *  Returns a single-line string suitable for card subtitles.
 */
export function buildCompactReasoning(
  candidate: PredictedExerciseCandidate
): string {
  if (candidate.reasoning.length === 0) return 'Suggested for you';

  const top = candidate.reasoning[0];
  const typeLabels: Record<string, string> = {
    recent_history: 'Recently used',
    recovery_state: 'Well recovered',
    frequency: 'Frequently used',
    transition_graph: 'Next in your flow',
    training_style: 'Matches your style',
    time_spacing: 'Good timing',
    muscle_balance: 'Balances this session',
    equipment_availability: 'Equipment ready',
    pattern_match: 'Fits your pattern',
    user_affinity: 'Your top pick',
    fatigue_ordering: 'Optimal order',
  };

  return typeLabels[top.type] ?? top.text;
}
