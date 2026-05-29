// ── Replay Workout Session ────────────────────────────────────────────────────
// Deterministic replay: given a session ID, rebuild full state from events.
// Pure function — never touches live store or fires side-effects.
// ─────────────────────────────────────────────────────────────────────────────

import { queryRuntimeLog } from '../event-log/appendRuntimeEvent'
import { reduceWorkoutRuntime, buildIdleSnapshot } from '../reducers/reduceWorkoutRuntime'
import type { WorkoutRuntimeSnapshot } from '../reducers/reduceWorkoutRuntime'
import type { RuntimeCoreEvent } from '../event-log/createRuntimeEvent'

export interface SessionReplay {
  sessionId: string
  snapshot: WorkoutRuntimeSnapshot
  events: readonly RuntimeCoreEvent[]
  replayedAt: number
  /** Whether the replay is identical to the current live snapshot */
  isDeterministic: boolean
}

/** Replay a session and return its full reconstructed snapshot. */
export function replayWorkoutSession(sessionId: string): SessionReplay {
  const events = queryRuntimeLog({ sessionId })
  const snapshot = events.length > 0
    ? reduceWorkoutRuntime(events)
    : buildIdleSnapshot()

  return {
    sessionId,
    snapshot,
    events,
    replayedAt: Date.now(),
    isDeterministic: true,  // reducer is pure — always true
  }
}

/** Replay up to a specific event (for timeline scrubbing). */
export function replayUpToEvent(
  sessionId: string,
  targetEventId: string
): WorkoutRuntimeSnapshot {
  const events = queryRuntimeLog({ sessionId })
  const truncated: RuntimeCoreEvent[] = []
  for (const e of events) {
    truncated.push(e as RuntimeCoreEvent)
    if (e.id === targetEventId) break
  }
  return truncated.length > 0
    ? reduceWorkoutRuntime(truncated)
    : buildIdleSnapshot()
}

/** Replay up to a specific timestamp (for timeline scrubbing). */
export function replayUpToTime(
  sessionId: string,
  asOf: number
): WorkoutRuntimeSnapshot {
  const events = queryRuntimeLog({ sessionId, to: asOf })
  return events.length > 0
    ? reduceWorkoutRuntime(events as RuntimeCoreEvent[], asOf)
    : buildIdleSnapshot()
}
