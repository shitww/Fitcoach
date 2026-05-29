// ── Build Runtime Snapshot ────────────────────────────────────────────────────
// Assembles a complete, version-safe persistence snapshot from live state.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  RuntimeSnapshot,
  WorkoutSessionState,
  RecoverySessionState,
  PendingRuntimeInput,
} from '@/types/runtime-reliability';
import { RUNTIME_SNAPSHOT_VERSION } from '@/types/runtime-reliability';

export interface BuildSnapshotInput {
  sessionState: WorkoutSessionState | null;
  recoveryState: RecoverySessionState | null;
  pendingInputs: PendingRuntimeInput[];
  appVersion: string;
}

/** Build a complete runtime snapshot ready for persistence.
 *  Attaches version, timestamp, and checksum for integrity.
 */
export function buildRuntimeSnapshot(
  input: BuildSnapshotInput
): RuntimeSnapshot {
  const { sessionState, recoveryState, pendingInputs, appVersion } = input;

  const snapshotId = generateId();
  const createdAt = new Date().toISOString();

  const checksum = computeChecksum({
    sessionState,
    recoveryState,
    pendingInputs,
    createdAt,
  });

  return {
    snapshotId,
    version: RUNTIME_SNAPSHOT_VERSION,
    runtimeVersion: appVersion,
    createdAt,
    sessionState,
    recoveryState,
    pendingInputs,
    checksum,
  };
}

/** Build a recovery-only snapshot (lightweight — no full predictive state). */
export function buildRecoverySnapshot(
  sessionState: WorkoutSessionState,
  interruptionType: RecoverySessionState['interruptionType']
): RecoverySessionState {
  const now = new Date().toISOString();

  // Recovery window: 4 hours from interruption
  const windowMs = 4 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + windowMs).toISOString();

  return {
    sessionId: sessionState.sessionId,
    wasInterrupted: true,
    interruptedAt: now,
    interruptionType,
    currentExerciseId: sessionState.currentExerciseId,
    currentExerciseName: sessionState.currentExerciseName,
    currentSetNumber: sessionState.currentSetNumber,
    restTimerRemainingMs: computeRestRemaining(sessionState),
    exerciseQueue: sessionState.exerciseQueue,
    completedExerciseIds: sessionState.completedExerciseIds,
    elapsedMin: sessionState.elapsedMin,
    canRecover: true,
    recoveryWindowMs: windowMs,
    recoveryExpiresAt: expiresAt,
  };
}

/** Create an empty/clean snapshot with no active state. */
export function buildEmptySnapshot(appVersion: string): RuntimeSnapshot {
  return buildRuntimeSnapshot({
    sessionState: null,
    recoveryState: null,
    pendingInputs: [],
    appVersion,
  });
}

function computeRestRemaining(session: WorkoutSessionState): number | null {
  if (!session.restTimerStartedAt || !session.restRecommendedSec) return null;

  const elapsedMs = Date.now() - new Date(session.restTimerStartedAt).getTime();
  const remainingMs = session.restRecommendedSec * 1000 - elapsedMs;
  return Math.max(0, remainingMs);
}

function computeChecksum(data: unknown): string {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function generateId(): string {
  return `snap_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}
