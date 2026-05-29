// ── Persist Runtime Snapshot ──────────────────────────────────────────────────
// Persists the runtime snapshot to localStorage for crash recovery.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutRuntimeSnapshot } from '../reducers/reduceWorkoutRuntime'
import { computeEventChecksum } from '../event-log/buildEventMetadata'
import type { RuntimeCoreEvent } from '../event-log/createRuntimeEvent'

const SNAPSHOT_KEY       = 'fitcoach:v1:runtime-snapshot'
const SNAPSHOT_VERSION   = 1

export interface PersistedRuntimeSnapshot {
  snapshot: WorkoutRuntimeSnapshot
  persistedAt: number
  version: number
  checksum: string
}

/** Compute checksum over key snapshot fields. */
function snapshotChecksum(s: WorkoutRuntimeSnapshot): string {
  const str = `${s.sessionId}:${s.totalSets}:${s.totalVolume}:${s.sessionPhase}:${s.eventCount}`
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

/** Persist the current snapshot to localStorage. */
export function persistRuntimeSnapshot(snapshot: WorkoutRuntimeSnapshot): void {
  if (typeof window === 'undefined') return
  if (snapshot.sessionPhase === 'idle') return

  const persisted: PersistedRuntimeSnapshot = {
    snapshot,
    persistedAt: Date.now(),
    version: SNAPSHOT_VERSION,
    checksum: snapshotChecksum(snapshot),
  }

  try {
    localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(persisted))
  } catch { /* storage quota */ }
}

/** Load the persisted snapshot for crash recovery. */
export function loadPersistedSnapshot(): PersistedRuntimeSnapshot | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as PersistedRuntimeSnapshot

    // Validate checksum
    const expectedChecksum = snapshotChecksum(p.snapshot)
    if (p.checksum !== expectedChecksum) {
      console.warn('[RuntimeCore] Snapshot checksum mismatch — discarding')
      return null
    }

    return p
  } catch { return null }
}

/** Clear the persisted snapshot (after session completion). */
export function clearPersistedSnapshot(): void {
  if (typeof window === 'undefined') return
  try { localStorage.removeItem(SNAPSHOT_KEY) } catch {}
}

/** Check if a persisted snapshot represents a recoverable live session. */
export function isSnapshotRecoverable(p: PersistedRuntimeSnapshot): boolean {
  if (!p.snapshot.sessionId) return false
  if (p.snapshot.sessionPhase === 'done') return false

  // Only recover sessions that are < 4 hours old
  const ageMs = Date.now() - p.persistedAt
  return ageMs < 4 * 60 * 60 * 1000
}
