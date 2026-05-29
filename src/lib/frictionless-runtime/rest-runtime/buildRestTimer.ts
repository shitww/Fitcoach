// ── Build Rest Timer ─────────────────────────────────────────────────────────
// Constructs the live rest timer state from a recommendation + elapsed time.
// ─────────────────────────────────────────────────────────────────────────────

import type { RestTimerState, RestRecommendation } from '@/types/frictionless-runtime';

/** Build the live timer state.
 *  Called every second during rest; pure function — no side effects.
 */
export function buildRestTimer(
  recommendation: RestRecommendation,
  elapsedSec: number
): RestTimerState {
  const { recommendedSec } = recommendation;
  const remaining = Math.max(0, recommendedSec - elapsedSec);
  const isComplete = remaining === 0;

  const urgency = deriveUrgency(remaining, recommendedSec);
  const completionType = isComplete ? 'timer_expired' : null;

  return {
    isActive: !isComplete,
    recommendedSec,
    elapsedSec,
    remainingSec: remaining,
    isComplete,
    completionType,
    label: buildLabel(remaining, isComplete, elapsedSec, recommendedSec),
    urgency,
  };
}

/** Update timer state when user signals readiness before completion. */
export function markUserReady(timer: RestTimerState): RestTimerState {
  return {
    ...timer,
    isActive: false,
    remainingSec: 0,
    isComplete: true,
    completionType: 'user_ready',
    label: 'Ready — start set',
    urgency: 'ready',
  };
}

/** Update timer state when auto-advance is triggered. */
export function markAutoAdvance(timer: RestTimerState): RestTimerState {
  return {
    ...timer,
    isActive: false,
    remainingSec: 0,
    isComplete: true,
    completionType: 'auto_advance',
    label: 'Next set auto-started',
    urgency: 'ready',
  };
}

function deriveUrgency(remaining: number, total: number): RestTimerState['urgency'] {
  if (remaining === 0) return 'ready';
  if (remaining <= 10) return 'ready_soon';
  if (remaining <= total * 0.25) return 'ready_soon';
  return 'waiting';
}

function buildLabel(
  remaining: number,
  isComplete: boolean,
  elapsed: number,
  total: number
): string {
  if (isComplete) {
    if (elapsed > total * 1.5) return 'Rest complete — overdue';
    return 'Rest complete — go when ready';
  }
  if (remaining <= 10) return `${remaining}s — almost ready`;
  return `${formatSec(remaining)} remaining`;
}

function formatSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
