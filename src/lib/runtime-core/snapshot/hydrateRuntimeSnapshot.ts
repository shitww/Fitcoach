// ── Hydrate Runtime Snapshot ──────────────────────────────────────────────────
// On app startup, hydrates runtime-core from persisted state.
// Supports seamless lock-screen / PWA-suspend / tab-reload recovery.
// ─────────────────────────────────────────────────────────────────────────────

import { loadPersistedRuntimeLog } from '../event-log/appendRuntimeEvent'
import { loadPersistedSnapshot, isSnapshotRecoverable } from './persistRuntimeSnapshot'
import { buildIdleSnapshot, reduceWorkoutRuntime } from '../reducers/reduceWorkoutRuntime'
import { getRuntimeLogForSession } from '../event-log/appendRuntimeEvent'
import type { WorkoutRuntimeSnapshot } from '../reducers/reduceWorkoutRuntime'

export type HydrationResult =
  | { status: 'idle' }
  | { status: 'recovered'; snapshot: WorkoutRuntimeSnapshot; fromEventLog: boolean }
  | { status: 'corrupted'; partialSnapshot: WorkoutRuntimeSnapshot | null }

/** Hydrate the runtime-core on app startup.
 *  Priority: event log > persisted snapshot > idle.
 */
export function hydrateRuntimeSnapshot(): HydrationResult {
  // 1. Attempt to load the event log (most reliable)
  loadPersistedRuntimeLog()

  const persisted = loadPersistedSnapshot()
  if (!persisted) return { status: 'idle' }
  if (!isSnapshotRecoverable(persisted)) return { status: 'idle' }

  const { sessionId } = persisted.snapshot
  if (!sessionId) return { status: 'idle' }

  // 2. Try to rebuild from event log (deterministic)
  const events = getRuntimeLogForSession(sessionId)
  if (events.length > 0) {
    const rebuilt = reduceWorkoutRuntime(events)
    if (rebuilt.sessionPhase !== 'idle') {
      return { status: 'recovered', snapshot: rebuilt, fromEventLog: true }
    }
  }

  // 3. Fall back to persisted snapshot
  if (persisted.snapshot.sessionPhase !== 'idle' && persisted.snapshot.sessionPhase !== 'done') {
    return { status: 'recovered', snapshot: persisted.snapshot, fromEventLog: false }
  }

  return { status: 'idle' }
}

/** Build the initial snapshot for a fresh app load. */
export function buildInitialSnapshot(): WorkoutRuntimeSnapshot {
  const result = hydrateRuntimeSnapshot()
  if (result.status === 'recovered') return result.snapshot
  return buildIdleSnapshot()
}
