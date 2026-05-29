// ── Validate Runtime Event Log ────────────────────────────────────────────────
// Validates the event log for corruption, gaps, and sequence issues.
// ─────────────────────────────────────────────────────────────────────────────

import { getRuntimeLogForSession } from '../event-log/appendRuntimeEvent'
import type { RuntimeCoreEvent } from '../event-log/createRuntimeEvent'

export type ValidationIssueType =
  | 'empty_log'
  | 'no_session_start'
  | 'orphan_rest_completed'
  | 'set_after_session_done'
  | 'duplicate_session_start'
  | 'timestamp_regression'
  | 'missing_exercise_for_set'

export interface ValidationIssue {
  type: ValidationIssueType
  eventId: string | null
  description: string
  severity: 'error' | 'warning'
}

export interface ValidationResult {
  valid: boolean
  issues: ValidationIssue[]
  eventCount: number
  sessionId: string
}

/** Validate the event log for a session. */
export function validateRuntimeEventLog(sessionId: string): ValidationResult {
  const events = getRuntimeLogForSession(sessionId) as RuntimeCoreEvent[]
  const issues: ValidationIssue[] = []

  if (events.length === 0) {
    return {
      valid: false,
      issues: [{ type: 'empty_log', eventId: null, description: '事件日志为空', severity: 'error' }],
      eventCount: 0,
      sessionId,
    }
  }

  const SESSION_START_TYPES = ['SESSION_STARTED', 'TRAINING_STARTED']
  const SESSION_DONE_TYPES  = ['SESSION_COMPLETED', 'TRAINING_COMPLETED']

  // Check for session start
  const hasStart = events.some(e => SESSION_START_TYPES.includes(e.type))
  if (!hasStart) {
    issues.push({ type: 'no_session_start', eventId: null, description: '缺少会话开始事件', severity: 'error' })
  }

  // Check duplicate session starts
  const startCount = events.filter(e => SESSION_START_TYPES.includes(e.type)).length
  if (startCount > 1) {
    const extras = events.filter(e => SESSION_START_TYPES.includes(e.type)).slice(1)
    extras.forEach(e => {
      issues.push({ type: 'duplicate_session_start', eventId: e.id, description: '重复的会话开始事件', severity: 'warning' })
    })
  }

  // Check timestamp ordering
  for (let i = 1; i < events.length; i++) {
    if (events[i].timestamp < events[i - 1].timestamp) {
      issues.push({
        type: 'timestamp_regression',
        eventId: events[i].id,
        description: `时间戳回退: ${events[i-1].timestamp} → ${events[i].timestamp}`,
        severity: 'warning',
      })
    }
  }

  // Check set events after session done
  let sessionDoneAt = -1
  for (let i = 0; i < events.length; i++) {
    if (SESSION_DONE_TYPES.includes(events[i].type)) { sessionDoneAt = i; break }
  }
  if (sessionDoneAt >= 0) {
    const afterDone = events.slice(sessionDoneAt + 1).filter(e => e.type === 'SET_LOGGED')
    afterDone.forEach(e => {
      issues.push({ type: 'set_after_session_done', eventId: e.id, description: '会话完成后出现组记录', severity: 'warning' })
    })
  }

  // Check orphan rest completions (no preceding REST_STARTED)
  let restActive = false
  for (const ev of events) {
    if (ev.type === 'REST_STARTED') { restActive = true; continue }
    if (ev.type === 'REST_COMPLETED' || ev.type === 'REST_SKIPPED') {
      if (!restActive) {
        issues.push({ type: 'orphan_rest_completed', eventId: ev.id, description: '无对应开始的休息完成事件', severity: 'warning' })
      }
      restActive = false
    }
  }

  return {
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues,
    eventCount: events.length,
    sessionId,
  }
}
