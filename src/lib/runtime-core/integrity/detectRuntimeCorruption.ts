// ── Detect Runtime Corruption ─────────────────────────────────────────────────
// Detects snapshot and event log corruption patterns.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutRuntimeSnapshot } from '../reducers/reduceWorkoutRuntime'
import { getRuntimeLogForSession } from '../event-log/appendRuntimeEvent'

export type CorruptionType =
  | 'snapshot_event_count_mismatch'
  | 'negative_volume'
  | 'negative_sets'
  | 'sets_exceed_events'
  | 'active_session_no_events'

export interface CorruptionReport {
  corrupted: boolean
  type: CorruptionType | null
  detail: string | null
  confidence: 'high' | 'medium' | 'low'
}

/** Check a snapshot for corruption signals. */
export function detectRuntimeCorruption(
  snapshot: WorkoutRuntimeSnapshot
): CorruptionReport {
  if (!snapshot.sessionId) {
    return { corrupted: false, type: null, detail: null, confidence: 'high' }
  }

  const events = getRuntimeLogForSession(snapshot.sessionId)

  // Active session with no events = corruption
  if (snapshot.sessionPhase === 'active' && events.length === 0) {
    return {
      corrupted: true,
      type: 'active_session_no_events',
      detail: '活跃会话无事件记录',
      confidence: 'high',
    }
  }

  // Negative volume
  if (snapshot.totalVolume < 0) {
    return { corrupted: true, type: 'negative_volume', detail: `总容量为负: ${snapshot.totalVolume}`, confidence: 'high' }
  }

  // Negative set count
  if (snapshot.totalSets < 0) {
    return { corrupted: true, type: 'negative_sets', detail: `总组数为负: ${snapshot.totalSets}`, confidence: 'high' }
  }

  // Event count mismatch (allow ±5 tolerance for compression)
  const logCount = events.length
  if (Math.abs(snapshot.eventCount - logCount) > 5) {
    return {
      corrupted: true,
      type: 'snapshot_event_count_mismatch',
      detail: `快照事件数 ${snapshot.eventCount} 与日志 ${logCount} 不符`,
      confidence: 'medium',
    }
  }

  return { corrupted: false, type: null, detail: null, confidence: 'high' }
}
