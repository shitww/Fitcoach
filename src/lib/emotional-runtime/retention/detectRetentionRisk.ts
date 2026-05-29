// ── Detect Retention Risk ─────────────────────────────────────────────────────
// Identifies when a user may stop training — no panic, no manipulation.
// ─────────────────────────────────────────────────────────────────────────────

import type { RetentionRiskState } from '@/types/emotional-runtime';
import type { ProgressData, RecoveryData } from '@/lib/dashboard-bootstrap';

/** Detect if the user is at risk of disengaging from training. */
export function detectRetentionRisk(
  progress: ProgressData,
  recovery: RecoveryData
): RetentionRiskState {
  const { daysSinceLastWorkout } = recovery;
  const twoWeekCount = progress.last14Days.filter((d) => d.done).length;
  const signals: string[] = [];

  // Absence signal
  if (daysSinceLastWorkout >= 14) signals.push(`${daysSinceLastWorkout} 天未训练`);
  else if (daysSinceLastWorkout >= 7) signals.push(`${daysSinceLastWorkout} 天未训练`);
  else if (daysSinceLastWorkout >= 5) signals.push(`近 ${daysSinceLastWorkout} 天未训练`);

  // Declining frequency signal
  const lastWeek = progress.last14Days.slice(7).filter((d) => d.done).length;
  const priorWeek = progress.last14Days.slice(0, 7).filter((d) => d.done).length;
  if (priorWeek >= 3 && lastWeek <= 1) signals.push('近期训练频率明显下降');

  // Total low activity
  if (twoWeekCount <= 1 && progress.totalWorkouts >= 5) {
    signals.push('近 2 周训练极少');
  }

  const level: RetentionRiskState['level'] =
    daysSinceLastWorkout >= 14 ? 'high' :
    daysSinceLastWorkout >= 7  ? 'moderate' :
    signals.length >= 2        ? 'mild' :
    'none';

  return {
    level,
    daysSinceLastWorkout,
    signals,
    isAtRisk: level !== 'none',
  };
}
