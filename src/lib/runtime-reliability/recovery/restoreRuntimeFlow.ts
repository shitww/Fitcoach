// ── Restore Runtime Flow ──────────────────────────────────────────────────────
// Full pipeline: detect → decide → recover → resume.
// ─────────────────────────────────────────────────────────────────────────────

import type { RestoredWorkoutSession } from '@/types/runtime-reliability';
import { detectInterruptedSession } from './detectInterruptedSession';
import { recoverWorkoutSession, shouldAutoRecover, isRecoveryValid } from './recoverWorkoutSession';

export type RecoveryDecision =
  | { type: 'auto_recover'; session: RestoredWorkoutSession }
  | { type: 'prompt_user'; session: RestoredWorkoutSession; message: string }
  | { type: 'no_recovery' };

/** Full recovery pipeline: detect → decide → optionally restore.
 *  Call on app launch. Returns what to do next.
 */
export function restoreRuntimeFlow(): RecoveryDecision {
  const detection = detectInterruptedSession();

  if (!detection.hasRecoverableSession || !detection.sessionState) {
    return { type: 'no_recovery' };
  }

  const recovery = detection.sessionState;

  if (!isRecoveryValid(recovery)) {
    return { type: 'no_recovery' };
  }

  const restored = recoverWorkoutSession(recovery);

  if (shouldAutoRecover(recovery)) {
    return {
      type: 'auto_recover',
      session: { ...restored, wasAutoRestored: true },
    };
  }

  return {
    type: 'prompt_user',
    session: restored,
    message: detection.message,
  };
}

/** Discard a recovery and clear persisted state. */
export function discardRecovery(): void {
  try {
    const { clearAllRuntimeState } = require('../persistence/persistRuntimeState');
    clearAllRuntimeState();
  } catch {
    // Graceful degradation
  }
}
