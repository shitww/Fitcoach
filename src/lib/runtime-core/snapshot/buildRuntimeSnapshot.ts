// ── Build Runtime Snapshot ────────────────────────────────────────────────────
// Builds a complete, verified runtime snapshot from current event log.
// This is the single source of truth for all workout UI surfaces.
// ─────────────────────────────────────────────────────────────────────────────

import { getRuntimeLogForSession } from '../event-log/appendRuntimeEvent'
import { reduceWorkoutRuntime, buildIdleSnapshot } from '../reducers/reduceWorkoutRuntime'
import type { WorkoutRuntimeSnapshot } from '../reducers/reduceWorkoutRuntime'

/** Rebuild the full runtime snapshot from the event log for a given session. */
export function buildRuntimeSnapshot(
  sessionId: string,
  asOf: number = Date.now()
): WorkoutRuntimeSnapshot {
  if (!sessionId) return buildIdleSnapshot()
  const events = getRuntimeLogForSession(sessionId)
  if (events.length === 0) return buildIdleSnapshot()
  return reduceWorkoutRuntime(events, asOf)
}

/** Build a live snapshot using all events in the current session.
 *  Typically called after every dispatch to refresh the Zustand store. */
export function rebuildLiveSnapshot(
  activeSessionId: string | null
): WorkoutRuntimeSnapshot {
  if (!activeSessionId) return buildIdleSnapshot()
  return buildRuntimeSnapshot(activeSessionId)
}

/** Derive a diff between two snapshots for targeted UI updates. */
export function snapshotDiff(
  prev: WorkoutRuntimeSnapshot,
  next: WorkoutRuntimeSnapshot
): {
  phaseChanged: boolean
  exerciseChanged: boolean
  setsChanged: boolean
  restChanged: boolean
  volumeChanged: boolean
  queueChanged: boolean
} {
  return {
    phaseChanged:    prev.sessionPhase !== next.sessionPhase,
    exerciseChanged: prev.activeExerciseName !== next.activeExerciseName,
    setsChanged:     prev.totalSets !== next.totalSets,
    restChanged:     prev.isRestActive !== next.isRestActive || prev.restEndAt !== next.restEndAt,
    volumeChanged:   prev.totalVolume !== next.totalVolume,
    queueChanged:    prev.exerciseQueue.join(',') !== next.exerciseQueue.join(','),
  }
}
