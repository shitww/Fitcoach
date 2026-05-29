// ── Restore Runtime Presence ──────────────────────────────────────────────────
// On app resume, restores the session to a live state.
// Emits SESSION_RECOVERED event to extend the event log.
// ─────────────────────────────────────────────────────────────────────────────

import { loadPresence, onSessionForeground } from './maintainSessionPresence'
import { detectSessionInterruption } from './detectSessionInterruption'
import { buildInitialSnapshot } from '../snapshot/hydrateRuntimeSnapshot'
import type { WorkoutRuntimeSnapshot } from '../reducers/reduceWorkoutRuntime'

export interface PresenceRestoreResult {
  snapshot: WorkoutRuntimeSnapshot
  wasInterrupted: boolean
  recoveryMessage: string | null
  shouldShowBanner: boolean
}

/** Restore runtime presence on app startup / page load. */
export function restoreRuntimePresence(): PresenceRestoreResult {
  const snapshot = buildInitialSnapshot()
  const presence = loadPresence()

  // Signal foreground
  onSessionForeground()

  const analysis = detectSessionInterruption(snapshot, presence)

  const wasInterrupted = analysis.type !== 'none' && snapshot.sessionPhase === 'active'

  return {
    snapshot,
    wasInterrupted,
    recoveryMessage: analysis.recoveryMessage,
    shouldShowBanner: analysis.shouldShowRecoveryBanner,
  }
}
