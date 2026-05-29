// ── Calculate Adaptive Streak ─────────────────────────────────────────────────
// Non-punishing, recovery-aware streak system.
// "过去 14 天完成 9 次" > "连续 9 天" philosophy.
// ─────────────────────────────────────────────────────────────────────────────

import type { AdaptiveStreak } from '@/types/emotional-runtime';
import type { ProgressData, RecoveryData } from '@/lib/dashboard-bootstrap';

/** Calculate adaptive streak from 14-day activity window. */
export function calculateAdaptiveStreak(
  progress: ProgressData,
  recovery: RecoveryData
): AdaptiveStreak {
  const { last14Days, currentStreak } = progress;

  const completedDays = last14Days.filter((d) => d.done).length;
  const totalDays = last14Days.length;
  const consistencyPct = Math.round((completedDays / totalDays) * 100);

  // Protected streak: count rest days (based on current recovery signal) as protected
  const protectedStreak = computeProtectedStreak(last14Days, recovery);
  const restDaysThisWeek = last14Days.slice(7).filter((d) => !d.done).length;

  const isOnTrack = consistencyPct >= 50 || completedDays >= 4;
  const onTrackMessage = buildOnTrackMessage(completedDays, totalDays);

  return {
    flexibleConsistency: completedDays,
    flexibleWindow: totalDays,
    consistencyPct,
    rawStreak: currentStreak,
    protectedStreak,
    isOnTrack,
    onTrackMessage,
    restDaysThisWeek,
    isRecoveryAware: true,
  };
}

/** Extended streak that doesn't penalize intentional rest days.
 *  A "break" only resets when there are 3+ consecutive unplanned off-days.
 */
function computeProtectedStreak(
  days: { done: boolean }[],
  recovery: RecoveryData
): number {
  let streak = 0;
  let consecutiveOff = 0;
  const MAX_OFF = recovery.fatigueLevel === 'high' ? 3 : 2; // allow more off days when fatigued

  // Work backwards from most recent
  for (let i = days.length - 1; i >= 0; i--) {
    if (days[i].done) {
      streak++;
      consecutiveOff = 0;
    } else {
      consecutiveOff++;
      if (consecutiveOff > MAX_OFF) break;
    }
  }

  return streak;
}

function buildOnTrackMessage(completed: number, total: number): string {
  if (completed === total) return `过去 ${total} 天每天都完成了训练`;
  if (completed >= total * 0.7) return `过去 ${total} 天完成 ${completed} 次训练`;
  return `过去 ${total} 天完成 ${completed} 次训练，持续保持`;
}
