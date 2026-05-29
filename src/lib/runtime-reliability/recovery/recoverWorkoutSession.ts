// ── Recover Workout Session ───────────────────────────────────────────────────
// Rebuilds live session state from a recovery checkpoint.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  RecoverySessionState,
  RestoredWorkoutSession,
} from '@/types/runtime-reliability';

/** Recover a workout session from a crash/interruption checkpoint.
 *  Returns a RestoredWorkoutSession ready to resume training.
 */
export function recoverWorkoutSession(
  recovery: RecoverySessionState
): RestoredWorkoutSession {
  const now = new Date().toISOString();

  // Adjust rest timer: how much time has passed since interruption?
  const elapsedSinceInterruptionMs = Date.now() - new Date(recovery.interruptedAt).getTime();
  const restRemaining = adjustRestTimer(recovery.restTimerRemainingMs, elapsedSinceInterruptionMs);

  return {
    sessionId: recovery.sessionId,
    currentExerciseId: recovery.currentExerciseId,
    currentExerciseName: recovery.currentExerciseName,
    currentSetNumber: recovery.currentSetNumber,
    restTimerRemainingMs: restRemaining,
    exerciseQueue: recovery.exerciseQueue,
    elapsedMin: recovery.elapsedMin,
    restoredAt: now,
    wasAutoRestored: false,
  };
}

/** Automatically restore when interruption was less than 30 seconds.
 *  The user likely didn't notice the interruption.
 */
export function shouldAutoRecover(recovery: RecoverySessionState): boolean {
  const elapsedMs = Date.now() - new Date(recovery.interruptedAt).getTime();
  return elapsedMs < 30_000; // auto-recover if < 30 seconds
}

/** Check if a recovery is still valid (within window). */
export function isRecoveryValid(recovery: RecoverySessionState): boolean {
  if (!recovery.canRecover) return false;
  return Date.now() < new Date(recovery.recoveryExpiresAt).getTime();
}

/** Generate the user-facing recovery message. */
export function buildRecoveryPrompt(recovery: RecoverySessionState): {
  headline: string;
  body: string;
  restInfo: string | null;
} {
  const exercise = recovery.currentExerciseName ?? 'your workout';
  const elapsedMs = Date.now() - new Date(recovery.interruptedAt).getTime();
  const minutesSince = Math.floor(elapsedMs / 60_000);

  const headline = minutesSince < 2 ? 'Continue Training?' : 'Resume Training?';

  const body = recovery.currentExerciseName
    ? `${exercise} — Set ${recovery.currentSetNumber}`
    : `${recovery.completedExerciseIds.length} exercises completed`;

  const restRemaining = adjustRestTimer(recovery.restTimerRemainingMs, elapsedMs);
  const restInfo = restRemaining !== null && restRemaining > 0
    ? `${Math.round(restRemaining / 1000)}s rest remaining`
    : null;

  return { headline, body, restInfo };
}

function adjustRestTimer(remaining: number | null, elapsedMs: number): number | null {
  if (remaining === null) return null;
  const adjusted = remaining - elapsedMs;
  return adjusted > 0 ? adjusted : null;
}
