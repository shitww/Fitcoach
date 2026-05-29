// ── Append Runtime Event ──────────────────────────────────────────────────────
// Append-only event log for Phase 9 runtime-core.
// This is the ONLY path for writing to the runtime event log.
// ─────────────────────────────────────────────────────────────────────────────

import type { RuntimeCoreEvent } from './createRuntimeEvent'
import { incrementRuntimeEventSeq } from './createRuntimeEvent'

const RUNTIME_LOG_KEY       = 'fitcoach:v1:runtime-core-log'
const MAX_IN_MEMORY         = 2000
const PERSIST_BATCH_SIZE    = 10   // flush to localStorage every N events

// ── In-memory log ─────────────────────────────────────────────────────────────

/** Append-only, chronologically ordered event log for the current runtime. */
let _runtimeLog: RuntimeCoreEvent[] = []
let _pendingFlush                   = 0

/** Append a new event to the runtime log. Returns the appended event. */
export function appendRuntimeEvent(event: RuntimeCoreEvent): RuntimeCoreEvent {
  if (_runtimeLog.length >= MAX_IN_MEMORY) {
    // Keep last 1500 events — preserve active session fully
    _runtimeLog = _runtimeLog.slice(-1500)
  }

  _runtimeLog.push(event)
  incrementRuntimeEventSeq()

  // Batch flush to localStorage
  _pendingFlush++
  if (_pendingFlush >= PERSIST_BATCH_SIZE) {
    flushRuntimeLog()
    _pendingFlush = 0
  }

  return event
}

/** Get all events in the runtime log (immutable view). */
export function getRuntimeLog(): readonly RuntimeCoreEvent[] {
  return _runtimeLog
}

/** Get all events for a specific session. */
export function getRuntimeLogForSession(sessionId: string): readonly RuntimeCoreEvent[] {
  return _runtimeLog.filter(e => e.sessionId === sessionId)
}

/** Get events matching a type filter. */
export function queryRuntimeLog(opts: {
  sessionId?: string
  types?: string[]
  from?: number
  to?: number
  limit?: number
}): readonly RuntimeCoreEvent[] {
  let result: readonly RuntimeCoreEvent[] = _runtimeLog
  if (opts.sessionId) result = result.filter(e => e.sessionId === opts.sessionId)
  if (opts.types)     result = result.filter(e => opts.types!.includes(e.type))
  if (opts.from)      result = result.filter(e => e.timestamp >= opts.from!)
  if (opts.to)        result = result.filter(e => e.timestamp <= opts.to!)
  if (opts.limit)     result = result.slice(-opts.limit)
  return result
}

/** Clear events for a finished session (keep only active session). */
export function pruneFinishedSessions(activeSessionId: string): void {
  _runtimeLog = _runtimeLog.filter(e => e.sessionId === activeSessionId)
}

/** Flush the in-memory log to localStorage. */
export function flushRuntimeLog(): void {
  if (typeof window === 'undefined') return
  try {
    const serializable = _runtimeLog.map(e => ({ ...e }))
    localStorage.setItem(RUNTIME_LOG_KEY, JSON.stringify(serializable))
  } catch {
    // Storage quota — keep in-memory, log will auto-compress on next cycle
  }
}

/** Load the persisted runtime log on startup / hydration. */
export function loadPersistedRuntimeLog(): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem(RUNTIME_LOG_KEY)
    if (!raw) return
    const parsed: RuntimeCoreEvent[] = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 0) {
      _runtimeLog = parsed
    }
  } catch { /* corrupted — start fresh */ }
}

/** Clear the entire runtime log (session end / reset). */
export function clearRuntimeLog(): void {
  _runtimeLog = []
  _pendingFlush = 0
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(RUNTIME_LOG_KEY) } catch {}
  }
}
