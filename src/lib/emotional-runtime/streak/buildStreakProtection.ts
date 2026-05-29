// ── Build Streak Protection ───────────────────────────────────────────────────
// Rest days don't break your streak. Recovery is part of training.
// ─────────────────────────────────────────────────────────────────────────────

import type { StreakProtection } from '@/types/emotional-runtime';
import type { RecoveryData } from '@/lib/dashboard-bootstrap';

/** Determine if today should be a streak-protected rest day. */
export function buildStreakProtection(recovery: RecoveryData): StreakProtection {
  const { userStatus, fatigueLevel, daysSinceLastWorkout } = recovery;

  // Already trained today — no protection needed
  if (daysSinceLastWorkout === 0) {
    return { isProtected: false, protectionReason: null, recoveryDaysAllowed: 2 };
  }

  // High fatigue = rest day is explicitly good for streak
  if (fatigueLevel === 'high' || userStatus === 'FATIGUED') {
    return {
      isProtected: true,
      protectionReason: '高疲劳恢复日',
      recoveryDaysAllowed: 3,
    };
  }

  // Rest day status
  if (userStatus === 'REST_DAY') {
    return {
      isProtected: true,
      protectionReason: '计划休息日',
      recoveryDaysAllowed: 2,
    };
  }

  // Default: 2 rest days allowed without streak impact
  return {
    isProtected: false,
    protectionReason: null,
    recoveryDaysAllowed: 2,
  };
}

/** Get a user-facing message about streak protection. */
export function getProtectionMessage(protection: StreakProtection): string | null {
  if (!protection.isProtected) return null;
  if (protection.protectionReason === '高疲劳恢复日') {
    return '恢复日也是训练的一部分';
  }
  if (protection.protectionReason === '计划休息日') {
    return '今天是计划休息日';
  }
  return '恢复也是进步';
}
