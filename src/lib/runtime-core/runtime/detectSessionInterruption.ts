// ── Detect Session Interruption ───────────────────────────────────────────────
// Classifies session interruption type and determines recovery strategy.
// ─────────────────────────────────────────────────────────────────────────────

import type { SessionPresence } from './maintainSessionPresence'
import type { WorkoutRuntimeSnapshot } from '../reducers/reduceWorkoutRuntime'

export type InterruptionType =
  | 'none'
  | 'brief_background'   // < 5 min in background
  | 'extended_background'// 5–30 min
  | 'lock_screen'        // mobile lock screen
  | 'tab_switch'         // web: tab changed
  | 'app_crash'          // no clean close
  | 'stale_session'      // > 4 hrs since last activity

export interface InterruptionAnalysis {
  type: InterruptionType
  durationMs: number
  shouldAutoResume: boolean
  shouldShowRecoveryBanner: boolean
  recoveryMessage: string | null
}

/** Analyze whether a session experienced an interruption. */
export function detectSessionInterruption(
  snapshot: WorkoutRuntimeSnapshot,
  presence: SessionPresence | null,
  now: number = Date.now()
): InterruptionAnalysis {
  if (!snapshot.sessionId || snapshot.sessionPhase === 'idle') {
    return { type: 'none', durationMs: 0, shouldAutoResume: false, shouldShowRecoveryBanner: false, recoveryMessage: null }
  }

  // No presence record = crash or cold start
  if (!presence) {
    const staleThreshold = 4 * 60 * 60 * 1000   // 4 hours
    const lastActivity   = snapshot.startTime ?? now
    const staleDuration  = now - lastActivity

    if (staleDuration > staleThreshold) {
      return {
        type: 'stale_session',
        durationMs: staleDuration,
        shouldAutoResume: false,
        shouldShowRecoveryBanner: true,
        recoveryMessage: `发现 ${Math.floor(staleDuration / 3600000)}h 前的未完成训练`,
      }
    }

    return {
      type: 'app_crash',
      durationMs: staleDuration,
      shouldAutoResume: true,
      shouldShowRecoveryBanner: true,
      recoveryMessage: '已恢复之前的训练',
    }
  }

  // Background duration
  const bgMs = presence.totalBackgroundMs
  if (bgMs === 0) {
    return { type: 'none', durationMs: 0, shouldAutoResume: true, shouldShowRecoveryBanner: false, recoveryMessage: null }
  }

  if (bgMs < 5 * 60 * 1000) {           // < 5 min
    return { type: 'brief_background',   durationMs: bgMs, shouldAutoResume: true,  shouldShowRecoveryBanner: false, recoveryMessage: null }
  }
  if (bgMs < 30 * 60 * 1000) {          // 5–30 min
    return { type: 'extended_background', durationMs: bgMs, shouldAutoResume: true,  shouldShowRecoveryBanner: true,  recoveryMessage: `后台 ${Math.round(bgMs / 60000)} 分钟，训练已继续` }
  }
  return { type: 'lock_screen',          durationMs: bgMs, shouldAutoResume: true,  shouldShowRecoveryBanner: true,  recoveryMessage: `锁屏 ${Math.round(bgMs / 60000)} 分钟，已恢复训练` }
}
