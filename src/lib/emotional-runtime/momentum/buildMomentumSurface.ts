// ── Build Momentum Surface ────────────────────────────────────────────────────
// Assembles the complete momentum surface for UI consumption.
// ─────────────────────────────────────────────────────────────────────────────

import type { MomentumSurface } from '@/types/emotional-runtime';
import type { ProgressData, RecoveryData } from '@/lib/dashboard-bootstrap';
import { calculateTrainingMomentum } from './calculateTrainingMomentum';
import { getMomentumBadge, getTodaySuggestion } from './detectMomentumState';

/** Build the full momentum surface from dashboard data. */
export function buildMomentumSurface(
  progress: ProgressData,
  recovery: RecoveryData
): MomentumSurface {
  const momentum = calculateTrainingMomentum({
    last14Days: progress.last14Days,
    daysSinceLastWorkout: recovery.daysSinceLastWorkout,
    currentStreak: progress.currentStreak,
    totalWorkouts: progress.totalWorkouts,
    weeklyWorkouts: progress.weeklyWorkouts,
  });

  const badge = getMomentumBadge(momentum);
  const suggestion = getTodaySuggestion(momentum);

  return { momentum, badge, suggestion };
}
