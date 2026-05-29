// ── Undo Last Runtime Event ───────────────────────────────────────────────────
// Undo is NOT mutable history deletion.
// Undo appends a SET_CORRECTED event that nullifies the target.
// Event log stays append-only. Reducer handles correction events.
// ─────────────────────────────────────────────────────────────────────────────

import { queryRuntimeLog } from '../event-log/appendRuntimeEvent'
import type { RuntimeCoreEvent } from '../event-log/createRuntimeEvent'

export type UndoableEventType = 'SET_LOGGED' | 'EXERCISE_ADDED' | 'SESSION_NOTES_UPDATED'

export interface UndoCandidate {
  eventId: string
  type: string
  timestamp: number
  exerciseName: string | null
  description: string
}

/** Get the last N undoable events for a session. */
export function getUndoCandidates(
  sessionId: string,
  limit = 3
): UndoCandidate[] {
  const events = queryRuntimeLog({ sessionId }) as RuntimeCoreEvent[]

  // Walk backwards, find undoable events
  const undoable: UndoCandidate[] = []
  for (let i = events.length - 1; i >= 0 && undoable.length < limit; i--) {
    const ev = events[i]
    if (!isUndoable(ev.type)) continue

    // Skip events that already have a correction
    const hasCorrectionEvent = events
      .slice(i + 1)
      .some(e => e.type === 'SET_CORRECTED' && e.payload.targetEventId === ev.id)
    if (hasCorrectionEvent) continue

    undoable.push({
      eventId:      ev.id,
      type:         ev.type,
      timestamp:    ev.timestamp,
      exerciseName: (ev.payload.exerciseName as string) ?? null,
      description:  buildUndoDescription(ev),
    })
  }

  return undoable
}

function isUndoable(type: string): boolean {
  return ['SET_LOGGED', 'EXERCISE_ADDED', 'SESSION_NOTES_UPDATED'].includes(type)
}

function buildUndoDescription(ev: RuntimeCoreEvent): string {
  const p = ev.payload
  if (ev.type === 'SET_LOGGED') {
    const w = p.isBodyweight ? '自重' : `${p.weight}kg`
    return `撤销 ${p.exerciseName} — ${w} × ${p.reps}`
  }
  if (ev.type === 'EXERCISE_ADDED') return `撤销添加 ${p.name}`
  return `撤销操作`
}

/** Build the correction event payload for undoing a SET_LOGGED. */
export function buildSetUndoPayload(
  targetEventId: string,
  exerciseName: string
): Record<string, unknown> {
  return {
    targetEventId,
    exerciseName,
    correctedWeight: 0,   // zeroing out = effectively removes the set
    correctedReps: 0,
    reason: 'undo',
    undoneAt: Date.now(),
  }
}
