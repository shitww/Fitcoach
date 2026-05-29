// ── Build Confidence Badge ──────────────────────────────────────────────────
// Pure helper to map a prediction score into a visual confidence badge.
// ─────────────────────────────────────────────────────────────────────────────

import type { ConfidenceBadge } from '@/types/adaptive-surface';

/** Map any prediction score into a standardized confidence badge.
 *  Used consistently across cards, surfaces, and tooltips.
 */
export function buildConfidenceBadge(score: number): ConfidenceBadge {
  if (score >= 0.8) {
    return {
      score,
      label: 'High Confidence',
      color: 'green',
      tooltip: 'Multiple strong signals support this prediction',
    };
  }
  if (score >= 0.6) {
    return {
      score,
      label: 'Good Match',
      color: 'yellow',
      tooltip: 'Reasonable basis from your training data',
    };
  }
  if (score >= 0.4) {
    return {
      score,
      label: 'Exploratory',
      color: 'orange',
      tooltip: 'Limited data — a suggestion to try out',
    };
  }
  return {
    score,
    label: 'Low Confidence',
    color: 'red',
    tooltip: 'Weak signal; may not fit your current context',
  };
}

/** Get a localized label for a score threshold.
 *  Useful for accessibility and screen readers.
 */
export function getConfidenceAccessibilityLabel(score: number): string {
  if (score >= 0.8) return 'High confidence recommendation';
  if (score >= 0.6) return 'Medium confidence recommendation';
  if (score >= 0.4) return 'Exploratory suggestion';
  return 'Low confidence suggestion';
}
