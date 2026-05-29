// ── Repair Runtime Snapshot ───────────────────────────────────────────────────
// If corruption is detected, attempt to repair from event log.
// Priority: event log rebuild > snapshot restoration > idle.
// ─────────────────────────────────────────────────────────────────────────────

import { getRuntimeLogForSession } from '../event-log/appendRuntimeEvent'
import { reduceWorkoutRuntime, buildIdleSnapshot } from '../reducers/reduceWorkoutRuntime'
import type { WorkoutRuntimeSnapshot } from '../reducers/reduceWorkoutRuntime'
import type { CorruptionReport } from './detectRuntimeCorruption'

export type RepairStrategy = 'rebuilt_from_events' | 'idle_reset' | 'unchanged'

export interface RepairResult {
  strategy: RepairStrategy
  snapshot: WorkoutRuntimeSnapshot
  repaired: boolean
  note: string
}

/** Attempt to repair a corrupted snapshot. */
export function repairRuntimeSnapshot(
  corrupted: WorkoutRuntimeSnapshot,
  report: CorruptionReport
): RepairResult {
  if (!report.corrupted) {
    return { strategy: 'unchanged', snapshot: corrupted, repaired: false, note: '无需修复' }
  }

  const sessionId = corrupted.sessionId
  if (!sessionId) {
    return { strategy: 'idle_reset', snapshot: buildIdleSnapshot(), repaired: true, note: '无 sessionId，重置为空闲' }
  }

  // Attempt event log rebuild
  const events = getRuntimeLogForSession(sessionId)
  if (events.length > 0) {
    const rebuilt = reduceWorkoutRuntime(events)
    return {
      strategy: 'rebuilt_from_events',
      snapshot: rebuilt,
      repaired: true,
      note: `从 ${events.length} 个事件重建`,
    }
  }

  // No events — reset to idle
  return {
    strategy: 'idle_reset',
    snapshot: buildIdleSnapshot(),
    repaired: true,
    note: `无法重建（${report.detail ?? '未知错误'}），重置为空闲`,
  }
}
