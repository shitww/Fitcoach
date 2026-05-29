// ── Detect Rest Completion ───────────────────────────────────────────────────
// Determines if a rest period has ended and what triggered the completion.
// ─────────────────────────────────────────────────────────────────────────────

import type { RestTimerState } from '@/types/frictionless-runtime';

export interface RestCompletionSignal {
  isComplete: boolean;
  reason: 'timer_expired' | 'user_ready' | 'auto_advance' | null;
  elapsedSec: number;
  wasEarly: boolean;
  wasLate: boolean;
  earlyByPct: number | null;
  lateByPct: number | null;
  message: string;
}

/** Detect how a rest period completed and what it means for momentum. */
export function detectRestCompletion(timer: RestTimerState): RestCompletionSignal {
  if (!timer.isComplete) {
    return {
      isComplete: false,
      reason: null,
      elapsedSec: timer.elapsedSec,
      wasEarly: false,
      wasLate: false,
      earlyByPct: null,
      lateByPct: null,
      message: '',
    };
  }

  const expected = timer.recommendedSec;
  const actual = timer.elapsedSec;
  const ratio = actual / expected;

  const wasEarly = ratio < 0.8; // rested less than 80% of recommendation
  const wasLate = ratio > 1.5;  // rested 50% longer than recommended
  const earlyByPct = wasEarly ? Math.round((1 - ratio) * 100) : null;
  const lateByPct = wasLate ? Math.round((ratio - 1) * 100) : null;

  const message = buildCompletionMessage(
    timer.completionType,
    wasEarly,
    wasLate,
    earlyByPct,
    lateByPct
  );

  return {
    isComplete: true,
    reason: timer.completionType,
    elapsedSec: actual,
    wasEarly,
    wasLate,
    earlyByPct,
    lateByPct,
    message,
  };
}

function buildCompletionMessage(
  completionType: RestTimerState['completionType'],
  wasEarly: boolean,
  wasLate: boolean,
  earlyByPct: number | null,
  lateByPct: number | null
): string {
  if (completionType === 'user_ready') {
    if (wasEarly && earlyByPct !== null && earlyByPct > 20) {
      return `Started ${earlyByPct}% early — watch fatigue accumulation`;
    }
    return 'Started when ready';
  }

  if (completionType === 'timer_expired') {
    return 'Rest complete';
  }

  if (completionType === 'auto_advance') {
    return 'Auto-advanced to next set';
  }

  if (wasLate && lateByPct !== null && lateByPct > 50) {
    return `Extended rest (+${lateByPct}%) — normal, back in flow`;
  }

  return 'Rest complete';
}
