// ── Reconstruct Workout Timeline ──────────────────────────────────────────────
// Builds a rich temporal timeline from session events.
// This is the foundation of the Training Story System.
// ─────────────────────────────────────────────────────────────────────────────

import { queryRuntimeLog } from '../event-log/appendRuntimeEvent'
import { reduceWorkoutRuntime } from '../reducers/reduceWorkoutRuntime'
import { describeEvent } from '../event-log/buildEventMetadata'
import type { RuntimeCoreEvent } from '../event-log/createRuntimeEvent'

export type TimelineEventKind =
  | 'session_start'
  | 'set_logged'
  | 'rest_period'
  | 'exercise_transition'
  | 'exercise_complete'
  | 'session_complete'
  | 'session_pause'
  | 'correction'
  | 'prediction'
  | 'meta'

export interface WorkoutTimelineEvent {
  id: string
  kind: TimelineEventKind
  timestamp: number
  sessionOffsetMs: number
  label: string
  detail: string | null
  exerciseName: string | null
  isMilestone: boolean
  sourceEventId: string
}

/** Reconstruct a complete timeline from a session's events. */
export function reconstructWorkoutTimeline(sessionId: string): WorkoutTimelineEvent[] {
  const events = queryRuntimeLog({ sessionId }) as RuntimeCoreEvent[]
  if (events.length === 0) return []

  const sessionStart = events[0]?.timestamp ?? Date.now()
  const timeline: WorkoutTimelineEvent[] = []

  for (const ev of events) {
    const offset = ev.timestamp - sessionStart
    const kind   = classifyEvent(ev)
    if (!kind) continue

    timeline.push({
      id:              `tl-${ev.id}`,
      kind,
      timestamp:       ev.timestamp,
      sessionOffsetMs: offset,
      label:           describeEvent(ev),
      detail:          buildDetail(ev),
      exerciseName:    (ev.payload.exerciseName as string) ?? (ev.payload.name as string) ?? null,
      isMilestone:     isMilestoneEvent(ev),
      sourceEventId:   ev.id,
    })
  }

  return timeline
}

function classifyEvent(ev: RuntimeCoreEvent): TimelineEventKind | null {
  switch (ev.type) {
    case 'SESSION_STARTED':
    case 'TRAINING_STARTED':    return 'session_start'
    case 'SET_LOGGED':          return 'set_logged'
    case 'REST_STARTED':        return 'rest_period'
    case 'EXERCISE_CHANGED':    return 'exercise_transition'
    case 'EXERCISE_COMPLETED':  return 'exercise_complete'
    case 'SESSION_COMPLETED':
    case 'TRAINING_COMPLETED':  return 'session_complete'
    case 'SESSION_PAUSED':
    case 'TRAINING_PAUSED':     return 'session_pause'
    case 'SET_CORRECTED':       return 'correction'
    case 'PREDICTION_ACCEPTED':
    case 'PREDICTION_REJECTED': return 'prediction'
    case 'SESSION_NOTES_UPDATED':
    case 'CARDIO_PARAMS_UPDATED': return 'meta'
    default: return null
  }
}

function buildDetail(ev: RuntimeCoreEvent): string | null {
  const p = ev.payload
  if (ev.type === 'SET_LOGGED') {
    const isBodyweight = p.isBodyweight as boolean
    const w = isBodyweight ? '自重' : `${p.weight}kg`
    return `${w} × ${p.reps}${p.rir != null ? ` @RIR${p.rir}` : ''}`
  }
  if (ev.type === 'REST_STARTED') {
    return `${p.duration}s 休息`
  }
  return null
}

function isMilestoneEvent(ev: RuntimeCoreEvent): boolean {
  return [
    'SESSION_STARTED', 'TRAINING_STARTED',
    'EXERCISE_COMPLETED',
    'SESSION_COMPLETED', 'TRAINING_COMPLETED',
  ].includes(ev.type)
}
