// ── Rebuild Runtime After Undo ────────────────────────────────────────────────
// After appending a correction event, rebuild the snapshot.
// Since the reducer is pure, this is just re-running reduceWorkoutRuntime.
// ─────────────────────────────────────────────────────────────────────────────

import { getRuntimeLogForSession } from '../event-log/appendRuntimeEvent'
import { reduceWorkoutRuntime } from '../reducers/reduceWorkoutRuntime'
import type { WorkoutRuntimeSnapshot } from '../reducers/reduceWorkoutRuntime'

/** Rebuild the runtime snapshot after an undo/correction event was appended.
 *  Deterministic — the reducer handles SET_CORRECTED events natively.
 */
export function rebuildRuntimeAfterUndo(sessionId: string): WorkoutRuntimeSnapshot {
  const events = getRuntimeLogForSession(sessionId)
  return reduceWorkoutRuntime(events)
}

/** Verify that an undo produced the expected state change. */
export function verifyUndoEffect(
  before: WorkoutRuntimeSnapshot,
  after: WorkoutRuntimeSnapshot,
  expectedDeltaSets: number = -1
): { ok: boolean; reason?: string } {
  const deltaSets = after.totalSets - before.totalSets
  if (deltaSets !== expectedDeltaSets) {
    return {
      ok: false,
      reason: `期望 set 变化 ${expectedDeltaSets}，实际 ${deltaSets}`,
    }
  }
  return { ok: true }
}
