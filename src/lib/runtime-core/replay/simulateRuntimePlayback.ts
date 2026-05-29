// ── Simulate Runtime Playback ─────────────────────────────────────────────────
// Step-by-step simulation of a session for AI analysis and debug.
// ─────────────────────────────────────────────────────────────────────────────

import { queryRuntimeLog } from '../event-log/appendRuntimeEvent'
import { reduceWorkoutRuntime, buildIdleSnapshot } from '../reducers/reduceWorkoutRuntime'
import type { WorkoutRuntimeSnapshot } from '../reducers/reduceWorkoutRuntime'
import type { RuntimeCoreEvent } from '../event-log/createRuntimeEvent'

export interface PlaybackFrame {
  stepIndex: number
  eventId: string
  eventType: string
  snapshot: WorkoutRuntimeSnapshot
  timestamp: number
}

/** Produce step-by-step snapshots for every event in a session.
 *  Used for AI analysis, debug replay, and training story reconstruction.
 */
export function simulateRuntimePlayback(sessionId: string): PlaybackFrame[] {
  const events = queryRuntimeLog({ sessionId }) as RuntimeCoreEvent[]
  const frames: PlaybackFrame[] = []

  for (let i = 0; i < events.length; i++) {
    const slice = events.slice(0, i + 1)
    const snapshot = reduceWorkoutRuntime(slice, events[i].timestamp)
    frames.push({
      stepIndex: i,
      eventId: events[i].id,
      eventType: events[i].type,
      snapshot,
      timestamp: events[i].timestamp,
    })
  }

  return frames
}

/** Simulate a hypothetical event sequence without touching the live log.
 *  Used by AI to model "what if I change rest time" scenarios.
 */
export function simulateHypotheticalEvents(
  baseSessionId: string,
  hypotheticalEvents: RuntimeCoreEvent[]
): WorkoutRuntimeSnapshot {
  const baseEvents  = queryRuntimeLog({ sessionId: baseSessionId }) as RuntimeCoreEvent[]
  const combined    = [...baseEvents, ...hypotheticalEvents]
  return reduceWorkoutRuntime(combined)
}
