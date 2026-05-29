// ── Detect Momentum State ─────────────────────────────────────────────────────
// Classifies current training state for UI surface decisions.
// ─────────────────────────────────────────────────────────────────────────────

import type { TrainingMomentumState, MomentumBadge } from '@/types/emotional-runtime';

/** Visual badge for momentum phase — subtle, not gamified. */
export function getMomentumBadge(state: TrainingMomentumState): MomentumBadge | null {
  switch (state.phase) {
    case 'rising':
      return { label: '上升期', color: '#CCFF00', bg: 'rgba(204,255,0,0.1)' };
    case 'consistent_flow':
      return { label: '稳定节奏', color: '#22c55e', bg: 'rgba(34,197,94,0.1)' };
    case 'fatigue_risk':
      return { label: '注意恢复', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' };
    case 'recovery_phase':
      return { label: '恢复中', color: '#60A5FA', bg: 'rgba(96,165,250,0.1)' };
    case 're_entry':
      return { label: '重新开始', color: '#A78BFA', bg: 'rgba(167,139,250,0.1)' };
    case 'building':
      return { label: '建立节奏', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)' };
    default:
      return null;
  }
}

/** Determine if a momentum insight should be displayed on the hero. */
export function shouldShowMomentumInsight(state: TrainingMomentumState): boolean {
  // Don't show for totally new users
  if (state.twoWeekFrequency === 0) return false;
  // Always show for re-entry and fatigue risk
  if (state.phase === 're_entry' || state.phase === 'fatigue_risk') return true;
  // Show when there's something meaningful to say
  return state.consistencyScore >= 0.4 || state.score >= 40;
}

/** Get a one-line contextual training suggestion for today. */
export function getTodaySuggestion(state: TrainingMomentumState): string | null {
  switch (state.phase) {
    case 'rising':
      return '今天适合继续当前计划';
    case 'consistent_flow':
      return null; // consistent is the goal — no need to suggest anything
    case 'fatigue_risk':
      return '今天适合轻量训练或主动恢复';
    case 'recovery_phase':
      return '今天适合轻量训练恢复节奏';
    case 're_entry':
      return '今天可以从轻量训练开始';
    case 'building':
      return '继续建立你的训练节奏';
    default:
      return null;
  }
}

/** Check if the user is in a healthy training state. */
export function isHealthyMomentum(state: TrainingMomentumState): boolean {
  return (
    state.score >= 50 &&
    state.phase !== 'fatigue_risk' &&
    state.daysSinceLastWorkout < 5
  );
}
