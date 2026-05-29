// ── Build Workout Timeline ────────────────────────────────────────────────────
// Continuous temporal view of a training session.
// Training is not a list of sets — it's a story arc.
// ─────────────────────────────────────────────────────────────────────────────

import { queryRuntimeLog } from '../event-log/appendRuntimeEvent'
import type { RuntimeCoreEvent } from '../event-log/createRuntimeEvent'

export type TimelineMomentType =
  | 'warmup'
  | 'work_set'
  | 'rest'
  | 'exercise_chapter'
  | 'peak_moment'       // PR, highest volume, PB
  | 'fatigue_signal'    // RIR 0, failure, deload
  | 'session_start'
  | 'session_end'

export interface TimelineMoment {
  id: string
  type: TimelineMomentType
  startMs: number            // session offset ms
  endMs: number | null       // null = point event (no duration)
  exerciseName: string | null
  setIndex: number | null
  weight: number | null
  reps: number | null
  volume: number | null
  isPeak: boolean
  label: string
}

/** Build the continuous moment timeline for a session. */
export function buildWorkoutTimeline(sessionId: string): TimelineMoment[] {
  const events = queryRuntimeLog({ sessionId }) as RuntimeCoreEvent[]
  if (events.length === 0) return []

  const sessionStart = events[0].timestamp
  const moments: TimelineMoment[] = []
  let restStartOffset: number | null = null

  for (const ev of events) {
    const offset = ev.timestamp - sessionStart

    switch (ev.type) {
      case 'SESSION_STARTED':
      case 'TRAINING_STARTED':
        moments.push(buildPointMoment('session_start', offset, null, null, null, null, '训练开始', ev.id))
        break

      case 'SET_LOGGED': {
        const p = ev.payload
        const isWarmup = p.isBodyweight as boolean
        const weight   = (p.weight as number) ?? 0
        const reps     = (p.reps as number) ?? 0
        const vol      = isWarmup ? 0 : weight * reps
        const rir      = p.rir as number | null
        const isPeak   = rir === 0 || (rir != null && rir <= 1)
        moments.push({
          id:           `m-${ev.id}`,
          type:         (p.isWarmup as boolean) ? 'warmup' : 'work_set',
          startMs:      offset,
          endMs:        null,
          exerciseName: (p.exerciseName as string) ?? null,
          setIndex:     (p.setIndex as number) ?? null,
          weight:       weight,
          reps:         reps,
          volume:       vol,
          isPeak,
          label:        buildSetLabel(weight, reps, p.isBodyweight as boolean),
        })
        break
      }

      case 'REST_STARTED':
        restStartOffset = offset
        break

      case 'REST_COMPLETED':
      case 'REST_SKIPPED':
        if (restStartOffset !== null) {
          moments.push({
            id:           `m-${ev.id}`,
            type:         'rest',
            startMs:      restStartOffset,
            endMs:        offset,
            exerciseName: null,
            setIndex:     null,
            weight:       null,
            reps:         null,
            volume:       null,
            isPeak:       false,
            label:        `休息 ${Math.round((offset - restStartOffset) / 1000)}s`,
          })
          restStartOffset = null
        }
        break

      case 'EXERCISE_COMPLETED':
        moments.push(buildPointMoment(
          'exercise_chapter', offset,
          (ev.payload.exerciseName as string) ?? null,
          null, null, null,
          `${ev.payload.exerciseName} 完成`, ev.id
        ))
        break

      case 'SESSION_COMPLETED':
      case 'TRAINING_COMPLETED':
        moments.push(buildPointMoment('session_end', offset, null, null, null, null, '训练完成', ev.id))
        break
    }
  }

  return moments.sort((a, b) => a.startMs - b.startMs)
}

function buildPointMoment(
  type: TimelineMomentType,
  offsetMs: number,
  exerciseName: string | null,
  weight: number | null,
  reps: number | null,
  volume: number | null,
  label: string,
  sourceId: string
): TimelineMoment {
  return {
    id: `m-${sourceId}`,
    type, startMs: offsetMs, endMs: null,
    exerciseName, setIndex: null,
    weight, reps, volume,
    isPeak: false, label,
  }
}

function buildSetLabel(weight: number, reps: number, isBodyweight: boolean): string {
  if (isBodyweight) return `自重 × ${reps}`
  return `${weight}kg × ${reps}`
}
