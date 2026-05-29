// ── Build Retention Surface ───────────────────────────────────────────────────
// Assembles gentle re-engagement surface. Non-intrusive, always subtle.
// ─────────────────────────────────────────────────────────────────────────────

import type { RetentionSurface } from '@/types/emotional-runtime';
import type { ProgressData, RecoveryData } from '@/lib/dashboard-bootstrap';
import { detectRetentionRisk } from './detectRetentionRisk';
import { getBestReEngagementSuggestion } from '../encouragement/buildReEngagementSuggestions';

/** Build the retention surface with gentle re-engagement messaging. */
export function buildRetentionSurface(
  progress: ProgressData,
  recovery: RecoveryData
): RetentionSurface {
  const risk = detectRetentionRisk(progress, recovery);

  if (!risk.isAtRisk) {
    return {
      risk,
      message: null,
      shouldShow: false,
      optimalReEntryDays: [],
      suggestion: null,
    };
  }

  const message = buildRetentionMessage(risk.level, risk.daysSinceLastWorkout);
  const suggestion = getBestReEngagementSuggestion(risk.daysSinceLastWorkout);

  // Never show for mild risk (too intrusive)
  const shouldShow = risk.level === 'moderate' || risk.level === 'high';

  return {
    risk,
    message,
    shouldShow,
    optimalReEntryDays: [],  // populated by predictReEngagementWindow
    suggestion,
  };
}

function buildRetentionMessage(
  level: RetentionSurface['risk']['level'],
  daysSince: number
): string | null {
  if (level === 'high') return `距上次训练 ${daysSince} 天，随时可以重新开始`;
  if (level === 'moderate') return `${daysSince} 天未训练，今天轻量开始也很好`;
  return null;
}
