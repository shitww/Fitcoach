// ── Group Timeline Events ─────────────────────────────────────────────────────
// Groups raw events into logical chapters (exercise blocks, rest blocks).
// ─────────────────────────────────────────────────────────────────────────────

import type { RuntimeCoreEvent } from '../event-log/createRuntimeEvent'
import { queryRuntimeLog } from '../event-log/appendRuntimeEvent'

export type EventGroupType = 'exercise_block' | 'rest_block' | 'session_meta' | 'correction'

export interface TimelineEventGroup {
  id: string
  type: EventGroupType
  exerciseName: string | null
  events: RuntimeCoreEvent[]
  startTs: number
  endTs: number
  durationMs: number
  summary: string
}

/** Group session events into logical blocks for timeline display. */
export function groupTimelineEvents(sessionId: string): TimelineEventGroup[] {
  const events = queryRuntimeLog({ sessionId }) as RuntimeCoreEvent[]
  if (events.length === 0) return []

  const groups: TimelineEventGroup[] = []
  let currentGroup: RuntimeCoreEvent[] | null = null
  let currentType: EventGroupType | null       = null
  let currentExercise: string | null           = null

  function flushGroup() {
    if (!currentGroup || currentGroup.length === 0 || !currentType) return
    const startTs = currentGroup[0].timestamp
    const endTs   = currentGroup[currentGroup.length - 1].timestamp
    groups.push({
      id:           `grp-${currentGroup[0].id}`,
      type:         currentType,
      exerciseName: currentExercise,
      events:       [...currentGroup],
      startTs,
      endTs,
      durationMs:   endTs - startTs,
      summary:      buildGroupSummary(currentType, currentExercise, currentGroup),
    })
    currentGroup = null
    currentType  = null
  }

  for (const ev of events) {
    const newType = classifyGroupEvent(ev)
    const evExercise   = (ev.payload.exerciseName as string | undefined)
      ?? (ev.payload.name as string | undefined)
      ?? null
    const newExercise: string | null = evExercise ?? currentExercise

    if (newType !== currentType || (newExercise !== currentExercise && newType === 'exercise_block')) {
      flushGroup()
      currentGroup   = [ev]
      currentType    = newType
      currentExercise = newExercise
    } else {
      currentGroup = currentGroup ?? [ev]
      if (!currentGroup.includes(ev)) currentGroup.push(ev)
    }
  }

  flushGroup()
  return groups
}

function classifyGroupEvent(ev: RuntimeCoreEvent): EventGroupType {
  switch (ev.type) {
    case 'REST_STARTED':
    case 'REST_COMPLETED':
    case 'REST_SKIPPED':  return 'rest_block'
    case 'SET_CORRECTED': return 'correction'
    case 'SESSION_NOTES_UPDATED':
    case 'CARDIO_PARAMS_UPDATED': return 'session_meta'
    default:              return 'exercise_block'
  }
}

function buildGroupSummary(
  type: EventGroupType,
  exerciseName: string | null,
  events: RuntimeCoreEvent[]
): string {
  if (type === 'rest_block') {
    const started = events.find(e => e.type === 'REST_STARTED')
    const dur     = started ? (started.payload.duration as number) : 0
    return `休息 ${dur}s`
  }
  if (type === 'exercise_block' && exerciseName) {
    const setCount = events.filter(e => e.type === 'SET_LOGGED').length
    const name = exerciseName.split(' (')[0]
    return setCount > 0 ? `${name} × ${setCount} 组` : name
  }
  if (type === 'correction') return '修正记录'
  return '训练元数据'
}
