// ── Detect Interrupted Session ────────────────────────────────────────────────
// Checks if the last session was interrupted (crash, background kill, etc).
// ─────────────────────────────────────────────────────────────────────────────

import type { RecoveryDetectionResult } from '@/types/runtime-reliability';
import { restoreRuntimeState } from '../persistence/restoreRuntimeState';

/** Max age of a session before it's considered too stale to recover (ms). */
const MAX_RECOVERY_AGE_MS = 4 * 60 * 60 * 1000; // 4 hours

/** Detect if there is a recoverable interrupted session.
 *  Should be called on every app launch, before any rendering.
 */
export function detectInterruptedSession(): RecoveryDetectionResult {
  const { snapshot, source } = restoreRuntimeState();

  if (!snapshot) {
    return noRecovery('No persisted state found');
  }

  const recovery = snapshot.recoveryState;
  const session = snapshot.sessionState;

  // Recovery state takes priority (set at interruption time)
  if (recovery && recovery.canRecover) {
    const now = Date.now();
    const interruptedAt = new Date(recovery.interruptedAt).getTime();
    const elapsedMs = now - interruptedAt;
    const minutesSince = Math.floor(elapsedMs / 60_000);

    if (now > new Date(recovery.recoveryExpiresAt).getTime()) {
      return {
        hasRecoverableSession: false,
        sessionState: null,
        isExpired: true,
        minutesSinceInterruption: minutesSince,
        message: `Recovery window expired (${minutesSince} min ago)`,
      };
    }

    return {
      hasRecoverableSession: true,
      sessionState: recovery,
      isExpired: false,
      minutesSinceInterruption: minutesSince,
      message: buildRecoveryMessage(recovery, minutesSince),
    };
  }

  // Fall back to session state (normal mid-session snapshot)
  if (session) {
    const now = Date.now();
    const lastActivity = new Date(session.lastActivityAt).getTime();
    const elapsedMs = now - lastActivity;
    const minutesSince = Math.floor(elapsedMs / 60_000);

    if (elapsedMs > MAX_RECOVERY_AGE_MS) {
      return {
        hasRecoverableSession: false,
        sessionState: null,
        isExpired: true,
        minutesSinceInterruption: minutesSince,
        message: `Session too old to recover (${minutesSince} min ago)`,
      };
    }

    // Convert session state to recovery state for uniform handling
    const synthesized = synthesizeRecovery(session, minutesSince);
    return {
      hasRecoverableSession: true,
      sessionState: synthesized,
      isExpired: false,
      minutesSinceInterruption: minutesSince,
      message: buildRecoveryMessage(synthesized, minutesSince),
    };
  }

  return noRecovery('No active session to recover');
}

function noRecovery(message: string): RecoveryDetectionResult {
  return {
    hasRecoverableSession: false,
    sessionState: null,
    isExpired: false,
    minutesSinceInterruption: 0,
    message,
  };
}

function buildRecoveryMessage(
  recovery: { currentExerciseName: string | null; currentSetNumber: number },
  minutesSince: number
): string {
  const exercise = recovery.currentExerciseName ?? 'your workout';
  const setInfo = recovery.currentSetNumber > 0
    ? `, set ${recovery.currentSetNumber}`
    : '';
  const timeInfo = minutesSince < 2 ? '' : ` (${minutesSince} min ago)`;

  return `Resume ${exercise}${setInfo}${timeInfo}`;
}

function synthesizeRecovery(
  session: import('@/types/runtime-reliability').WorkoutSessionState,
  minutesSince: number
): import('@/types/runtime-reliability').RecoverySessionState {
  const windowMs = 4 * 60 * 60 * 1000;
  return {
    sessionId: session.sessionId,
    wasInterrupted: true,
    interruptedAt: session.lastActivityAt,
    interruptionType: 'unknown',
    currentExerciseId: session.currentExerciseId,
    currentExerciseName: session.currentExerciseName,
    currentSetNumber: session.currentSetNumber,
    restTimerRemainingMs: null,
    exerciseQueue: session.exerciseQueue,
    completedExerciseIds: session.completedExerciseIds,
    elapsedMin: session.elapsedMin,
    canRecover: true,
    recoveryWindowMs: windowMs,
    recoveryExpiresAt: new Date(Date.now() + windowMs).toISOString(),
  };
}
