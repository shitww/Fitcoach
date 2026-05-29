// ── Build Event Metadata ──────────────────────────────────────────────────────
// Enriches runtime events with contextual metadata.
// ─────────────────────────────────────────────────────────────────────────────

import type { RuntimeCoreEvent } from './createRuntimeEvent'

export interface EventMetadata {
  /** Milliseconds since session start */
  sessionOffsetMs: number
  /** Running total sets at time of event */
  setsAtEvent: number
  /** Running total volume at time of event */
  volumeAtEvent: number
  /** Whether this event occurred during rest */
  duringRest: boolean
  /** Device/context info for replay debugging */
  context: 'active' | 'background' | 'lock_screen' | 'unknown'
}

/** Build context metadata to attach to an event. */
export function buildEventMetadata(
  sessionStartTime: number | null,
  runningSetCount: number,
  runningVolume: number,
  isRestActive: boolean
): EventMetadata {
  const context = detectContext()
  return {
    sessionOffsetMs: sessionStartTime ? Date.now() - sessionStartTime : 0,
    setsAtEvent: runningSetCount,
    volumeAtEvent: runningVolume,
    duringRest: isRestActive,
    context,
  }
}

function detectContext(): EventMetadata['context'] {
  if (typeof document === 'undefined') return 'unknown'
  if (document.visibilityState === 'hidden') return 'background'
  return 'active'
}

/** FNV-1a 32-bit checksum over event id + type + timestamp. */
export function computeEventChecksum(event: RuntimeCoreEvent): string {
  const str = `${event.id}:${event.type}:${event.timestamp}:${event.sessionId}`
  let h = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 0x01000193)
  }
  return (h >>> 0).toString(16).padStart(8, '0')
}

/** Build a human-readable event description for debug / timeline display. */
export function describeEvent(event: RuntimeCoreEvent): string {
  const p = event.payload
  switch (event.type) {
    case 'SESSION_STARTED':
      return `训练开始 (${p.sessionType ?? 'strength'})`
    case 'EXERCISE_ADDED':
      return `动作入队: ${p.name}`
    case 'EXERCISE_QUEUE_SET':
      return `队列设置: ${(p.exerciseNames as string[])?.length ?? 0} 个动作`
    case 'SET_LOGGED': {
      const w = p.isBodyweight ? '自重' : `${p.weight}kg`
      return `${p.exerciseName} — ${w} × ${p.reps}` + (p.rir != null ? ` @RIR${p.rir}` : '')
    }
    case 'SET_CORRECTED':
      return `修正 ${p.exerciseName} — 第 ${Number(p.targetSetIndex ?? 0) + 1} 组`
    case 'REST_STARTED':
      return `休息开始 ${p.duration}s`
    case 'REST_COMPLETED':  return '休息完成'
    case 'REST_SKIPPED':    return '跳过休息'
    case 'EXERCISE_COMPLETED':
      return `${p.exerciseName} 完成 (${p.setsLogged} 组)`
    case 'SESSION_COMPLETED':
      return `训练完成 — ${p.totalSets} 组 / ${p.totalVolume}kg`
    case 'SESSION_RECOVERED':
      return `会话恢复 (${p.recoveryType})`
    case 'PREDICTION_ACCEPTED':
      return `预测确认: ${p.exerciseName}`
    case 'PREDICTION_REJECTED':
      return `预测调整: ${p.exerciseName}`
    default:
      return event.type
  }
}
