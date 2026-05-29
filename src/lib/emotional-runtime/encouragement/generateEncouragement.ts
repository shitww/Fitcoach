// ── Generate Encouragement ────────────────────────────────────────────────────
// Adaptive encouragement — only when meaningful, never spammy.
// Calm, analytical tone. No fake hype.
// ─────────────────────────────────────────────────────────────────────────────

import type { EncouragementMessage, EncouragementTone } from '@/types/emotional-runtime';
import type { ProgressData, RecoveryData } from '@/lib/dashboard-bootstrap';
import type { TrainingMomentumState } from '@/types/emotional-runtime';

const SUPPRESSION_KEY = 'fitcoach_encouragement_suppression';
const SUPPRESSION_HOURS = 24; // same tone suppressed for 24h

/** Generate the right encouragement message for the current context.
 *  Returns null if nothing meaningful to say.
 */
export function generateEncouragement(
  momentum: TrainingMomentumState,
  progress: ProgressData,
  recovery: RecoveryData
): EncouragementMessage | null {
  const { tone, text } = selectMessage(momentum, progress, recovery);

  // Spam guard: check suppression
  const isVisible = !isSuppressed(tone);
  const suppressUntil = isVisible ? null : getSuppressUntil(tone);

  if (!isVisible) return null;

  // Mark as shown
  markShown(tone);

  return { tone, text, isVisible: true, suppressUntil };
}

/** Decide which encouragement type fits the current context. */
function selectMessage(
  momentum: TrainingMomentumState,
  progress: ProgressData,
  recovery: RecoveryData
): { tone: EncouragementTone; text: string } {
  // Re-entry: warm welcome back
  if (momentum.phase === 're_entry') {
    return {
      tone: 're_entry_warm',
      text: '很高兴看到你重新开始训练',
    };
  }

  // Burnout risk: recovery care
  if (momentum.phase === 'fatigue_risk') {
    return {
      tone: 'recovery_care',
      text: '最近训练频率偏高，建议增加恢复',
    };
  }

  // Consistent for 2+ weeks: acknowledge rhythm
  const twoWeekCount = progress.last14Days.filter((d) => d.done).length;
  if (twoWeekCount >= 7 && momentum.phase === 'consistent_flow') {
    return {
      tone: 'consistency_note',
      text: '你的训练节奏正在变得很稳定',
    };
  }

  // Rising momentum: subtle positive
  if (momentum.phase === 'rising' && momentum.trend === 'up') {
    return {
      tone: 'analytical_good',
      text: '训练频率持续上升，节奏很好',
    };
  }

  // Long gap but trained today
  if (recovery.daysSinceLastWorkout <= 1 && momentum.twoWeekFrequency <= 3) {
    return {
      tone: 'quiet_positive',
      text: '今天的训练很有价值',
    };
  }

  return {
    tone: 'quiet_positive',
    text: '保持当前训练节奏',
  };
}

// ── Spam suppression ──────────────────────────────────────────────────────────

function isSuppressed(tone: EncouragementTone): boolean {
  try {
    const raw = localStorage.getItem(SUPPRESSION_KEY);
    if (!raw) return false;
    const map = JSON.parse(raw) as Record<string, string>;
    const until = map[tone];
    if (!until) return false;
    return new Date().toISOString() < until;
  } catch {
    return false;
  }
}

function getSuppressUntil(tone: EncouragementTone): string | null {
  try {
    const raw = localStorage.getItem(SUPPRESSION_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    return map[tone] ?? null;
  } catch {
    return null;
  }
}

function markShown(tone: EncouragementTone): void {
  try {
    const raw = localStorage.getItem(SUPPRESSION_KEY);
    const map = raw ? (JSON.parse(raw) as Record<string, string>) : {};
    const until = new Date(Date.now() + SUPPRESSION_HOURS * 60 * 60 * 1000).toISOString();
    map[tone] = until;
    localStorage.setItem(SUPPRESSION_KEY, JSON.stringify(map));
  } catch { /* non-critical */ }
}
