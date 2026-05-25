/**
 * Workout Event Log — Observable + Replayable Runtime
 *
 * Extends the event bus with:
 *   - Append-only, FIFO-ordered event log (identity: id + sessionId + seq)
 *   - Pure-function state projection from event history (event sourcing)
 *   - Session replay — derives historical state without touching the live store
 *   - Snapshot checkpoints every N events (in-memory + localStorage)
 *   - Replay-mode flag consumed by the effect layer to silence side-effects
 *
 * Dependency chain (no cycles):
 *   events.ts  ←  eventLog.ts  ←  workoutTimer.ts  ←  components
 */

import {
  emit as busEmit,
  type WorkoutEvent,
  type WorkoutEventType,
  type EventOrigin,
  type ReplayMode,
} from './events';

// ── Constants ────────────────────────────────────────────────────────────────
/** Increment when LoggedEvent shape changes. Drives migrateEvent(). */
export const CURRENT_EVENT_VERSION = 1;

const SNAPSHOT_INTERVAL      = 10;    // snapshot every N logged events
const MAX_LOG_SIZE            = 1000;  // in-memory cap before compression
const COMPRESSION_THRESHOLD   = 800;   // start compressing at this count
const SNAPSHOT_KEY            = 'fitcoach:v1:event-snapshot';

// ── Public types ─────────────────────────────────────────────────────────────

export type { WorkoutEventType, EventOrigin, ReplayMode } from './events';

/** An event as stored in the append-only log. All fields are readonly. */
export interface LoggedEvent {
  readonly id: string;
  readonly type: WorkoutEventType;
  readonly ts: number;
  readonly payload?: Record<string, unknown>;
  readonly sessionId: string;
  /** Monotonic sequence — guarantees deterministic FIFO ordering. */
  readonly seq: number;
  /** Schema version at time of logging. Used by migrateEvent(). */
  readonly version: number;
  /** Who produced this event. */
  readonly origin: EventOrigin;
}

/** Lightweight state view derived purely from the event log. */
export interface WorkoutStateProjection {
  sessionPhase: 'idle' | 'active' | 'paused' | 'done';
  trainingDurationSecs: number;
  totalSets: number;
  currentExercise: string | null;
  sessionType: string | null;
  isRestActive: boolean;
}

/** Persisted checkpoint — includes integrity fields for corruption detection. */
export interface WorkoutEventSnapshot {
  sessionId: string;
  lastSeq: number;
  ts: number;
  /** eventLog schema version at snapshot time. */
  version: number;
  /** FNV-1a checksum over sessionId + lastSeq + ts. */
  checksum: string;
  projection: WorkoutStateProjection;
}

/** Per-session metadata tracked in the session registry. */
export interface SessionMeta {
  readonly sessionId: string;
  readonly startedAt: number;
  eventCount: number;
  lastEventTs: number;
  lastPhase: WorkoutStateProjection['sessionPhase'];
}

/** Composable filter for cross-session event queries. */
export interface EventQuery {
  sessionId?: string;
  types?: WorkoutEventType[];
  /** Epoch ms lower bound (inclusive). */
  from?: number;
  /** Epoch ms upper bound (inclusive). */
  to?: number;
  origin?: EventOrigin;
  /** Return at most this many events (newest first when combined with slice). */
  limit?: number;
}

// ── Module-level state ───────────────────────────────────────────────────────
let _log: LoggedEvent[]                       = [];
let _currentSessionId                         = '';
let _seq                                      = 0;
const _sessionRegistry                        = new Map<string, SessionMeta>();
const _flags                                  = { replayMode: null as ReplayMode | null };

// FIFO queue — protects against re-entrant emits from bus handlers
interface _Queued { event: WorkoutEvent; sessionId: string; origin: EventOrigin }
const _queue: _Queued[]                       = [];
let _processing                               = false;

// ── Helpers ──────────────────────────────────────────────────────────────────
function _genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** FNV-1a 32-bit checksum for snapshot integrity verification. */
function _checksum(sessionId: string, lastSeq: number, ts: number): string {
  const str = `${sessionId}:${lastSeq}:${ts}`;
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

// ── Session management ───────────────────────────────────────────────────────

/** Generate a new session ID and register it. Called exclusively by startTraining(). */
export function beginSession(): string {
  _currentSessionId = _genId();
  _sessionRegistry.set(_currentSessionId, {
    sessionId: _currentSessionId,
    startedAt: Date.now(),
    eventCount: 0,
    lastEventTs: 0,
    lastPhase: 'active',
  });
  return _currentSessionId;
}

/** Return the currently active session ID (empty string when idle). */
export function getCurrentSessionId(): string {
  return _currentSessionId;
}

/**
 * Sync the event-log session ID from the persisted store after hydration.
 * Also registers the session in the registry if missing (e.g. first load after upgrade).
 */
export function setCurrentSessionId(id: string): void {
  if (!id) return;
  _currentSessionId = id;
  if (!_sessionRegistry.has(id)) {
    _sessionRegistry.set(id, {
      sessionId: id,
      startedAt: Date.now(), // approximate — actual startedAt not available
      eventCount: 0,
      lastEventTs: 0,
      lastPhase: 'active',
    });
  }
}

/** All tracked sessions ordered by start time (oldest first). */
export function getSessions(): readonly SessionMeta[] {
  return [..._sessionRegistry.values()].sort((a, b) => a.startedAt - b.startedAt);
}

/** All tracked session IDs in log order. */
export function getAllSessionIds(): readonly string[] {
  return [..._sessionRegistry.keys()];
}

// ── Event versioning / migration ─────────────────────────────────────────────

/**
 * Migrate a stored event to targetVersion.
 * Add cases here as the schema evolves — never remove old cases.
 *
 * v0 → v1: add `origin` field (legacy events default to 'user').
 */
export function migrateEvent(
  event: LoggedEvent,
  targetVersion: number = CURRENT_EVENT_VERSION,
): LoggedEvent {
  if (event.version >= targetVersion) return event;
  let e = event;
  if (e.version < 1) {
    e = { ...e, version: 1, origin: e.origin ?? 'user' };
  }
  // Future: if (e.version < 2) { e = { ...e, version: 2, ... }; }
  return e;
}

// ── Core: log → queue → dispatch ─────────────────────────────────────────────

/**
 * Log a user-originated event and dispatch it through the bus.
 *
 * FIFO guarantee: if a bus handler calls logAndEmit (re-entrant), the new item
 * is queued and processed in the same while-loop iteration — strict ordering.
 */
export function logAndEmit(event: WorkoutEvent, sessionId: string): void {
  _queue.push({ event, sessionId, origin: 'user' });
  _drain();
}

/**
 * AI event injection — AI is just another event source.
 * Follows the same FIFO pipeline as logAndEmit; logged with origin: 'ai'.
 * AI must NOT directly mutate store state or trigger UI — only through events.
 */
export function aiEmit(event: WorkoutEvent, sessionId?: string): void {
  _queue.push({ event, sessionId: sessionId ?? _currentSessionId, origin: 'ai' });
  _drain();
}

function _drain(): void {
  if (_processing) return; // Re-entrant guard
  _processing = true;
  while (_queue.length > 0) {
    const { event, sessionId, origin } = _queue.shift()!;

    if (_flags.replayMode === null) {
      // Only log when NOT in any replay mode (deterministic state lock)
      if (_log.length >= MAX_LOG_SIZE) _compressOrTrim();

      const logged: LoggedEvent = Object.freeze({
        id: _genId(),
        type: event.type,
        ts: event.ts,
        payload: event.payload,
        sessionId,
        seq: ++_seq,
        version: CURRENT_EVENT_VERSION,
        origin,
      });
      _log.push(logged);

      // Update session registry
      const meta = _sessionRegistry.get(sessionId);
      if (meta) {
        meta.eventCount++;
        meta.lastEventTs = logged.ts;
      }

      if (_seq % SNAPSHOT_INTERVAL === 0) _takeSnapshot(logged);
    }

    busEmit(event); // May enqueue more events — picked up by next loop iteration
  }
  _processing = false;
}

// ── Compression ───────────────────────────────────────────────────────────────

/**
 * Reduce log size when approaching MAX_LOG_SIZE.
 * Strategy: preserve all events for the active session; compact other sessions
 * by merging consecutive SET_COMPLETED runs into a single counted event.
 */
function _compressOrTrim(): void {
  if (_log.length < COMPRESSION_THRESHOLD) {
    // Simple trim: drop oldest quarter
    _log = _log.slice(Math.floor(_log.length / 4));
    return;
  }

  // Semantic compression: fold SET_COMPLETED runs in non-active sessions
  const compressed: LoggedEvent[] = [];
  let runCount = 0;
  let runSession = '';
  let runTs = 0;
  let runSeq = 0;

  for (const e of _log) {
    if (e.sessionId === _currentSessionId) {
      // Always keep active session events verbatim
      if (runCount > 0) {
        compressed.push(Object.freeze({
          id: _genId(), type: 'SET_COMPLETED' as WorkoutEventType,
          ts: runTs, sessionId: runSession, seq: runSeq,
          version: CURRENT_EVENT_VERSION, origin: 'system' as EventOrigin,
          payload: { count: runCount, compressed: true },
        }));
        runCount = 0;
      }
      compressed.push(e);
    } else if (e.type === 'SET_COMPLETED') {
      runCount++; runSession = e.sessionId; runTs = e.ts; runSeq = e.seq;
    } else {
      if (runCount > 0) {
        compressed.push(Object.freeze({
          id: _genId(), type: 'SET_COMPLETED' as WorkoutEventType,
          ts: runTs, sessionId: runSession, seq: runSeq,
          version: CURRENT_EVENT_VERSION, origin: 'system' as EventOrigin,
          payload: { count: runCount, compressed: true },
        }));
        runCount = 0;
      }
      compressed.push(e);
    }
  }
  if (runCount > 0) {
    compressed.push(Object.freeze({
      id: _genId(), type: 'SET_COMPLETED' as WorkoutEventType,
      ts: runTs, sessionId: runSession, seq: runSeq,
      version: CURRENT_EVENT_VERSION, origin: 'system' as EventOrigin,
      payload: { count: runCount, compressed: true },
    }));
  }
  _log = compressed;
}

// ── Snapshot system ───────────────────────────────────────────────────────────

function _takeSnapshot(lastEvent: LoggedEvent): void {
  const sessionEvents = _log.filter(e => e.sessionId === lastEvent.sessionId);
  const now = Date.now();
  const snapshot: WorkoutEventSnapshot = {
    sessionId: lastEvent.sessionId,
    lastSeq:   lastEvent.seq,
    ts:        now,
    version:   CURRENT_EVENT_VERSION,
    checksum:  _checksum(lastEvent.sessionId, lastEvent.seq, lastEvent.ts),
    projection: deriveStateFromEvents(sessionEvents),
  };
  if (typeof window !== 'undefined') {
    try { localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snapshot)); } catch { /* quota */ }
  }
}

/** Return the last persisted snapshot (for crash recovery + integrity checks). */
export function getLastSnapshot(): WorkoutEventSnapshot | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SNAPSHOT_KEY);
    return raw ? (JSON.parse(raw) as WorkoutEventSnapshot) : null;
  } catch { return null; }
}

// ── Read selectors ────────────────────────────────────────────────────────────

/**
 * Immutable, time-ordered view of the event log.
 * Pass a sessionId to scope to a single session.
 */
export function selectEventTimeline(sessionId?: string): readonly LoggedEvent[] {
  return sessionId ? _log.filter(e => e.sessionId === sessionId) : _log;
}

/**
 * Cross-session event query with composable filters.
 * Use for AI training analysis, progress insights, and adaptive plan generation.
 */
export function queryEvents(filter: EventQuery): readonly LoggedEvent[] {
  let r: readonly LoggedEvent[] = _log;
  if (filter.sessionId !== undefined) r = r.filter(e => e.sessionId === filter.sessionId);
  if (filter.types      !== undefined) r = r.filter(e => filter.types!.includes(e.type));
  if (filter.from       !== undefined) r = r.filter(e => e.ts >= filter.from!);
  if (filter.to         !== undefined) r = r.filter(e => e.ts <= filter.to!);
  if (filter.origin     !== undefined) r = r.filter(e => e.origin === filter.origin);
  if (filter.limit      !== undefined) r = r.slice(-filter.limit);
  return r;
}

// ── Pure state projection (event sourcing) ────────────────────────────────────

const _IDLE_PROJECTION: WorkoutStateProjection = {
  sessionPhase: 'idle', trainingDurationSecs: 0, totalSets: 0,
  currentExercise: null, sessionType: null, isRestActive: false,
};

/**
 * Derive workout state purely from an ordered event sequence.
 * Events are migrated to targetVersion before projection — guarantees
 * backward compatibility across all schema versions.
 *
 * No store access, no side effects: this IS event sourcing.
 */
export function deriveStateFromEvents(
  events: readonly LoggedEvent[],
  targetVersion: number = CURRENT_EVENT_VERSION,
): WorkoutStateProjection {
  const migrated = events.map(e => e.version < targetVersion ? migrateEvent(e, targetVersion) : e);
  let s = { ..._IDLE_PROJECTION };
  let activeStart: number | null = null;

  for (const ev of migrated) {
    switch (ev.type) {
      case 'TRAINING_STARTED':
        s = { ...s, sessionPhase: 'active' };
        activeStart = ev.ts;
        break;
      case 'TRAINING_PAUSED':
        if (activeStart !== null) {
          s = { ...s, sessionPhase: 'paused',
            trainingDurationSecs: s.trainingDurationSecs + Math.floor((ev.ts - activeStart) / 1000) };
          activeStart = null;
        }
        break;
      case 'TRAINING_RESUMED':
        s = { ...s, sessionPhase: 'active' };
        activeStart = ev.ts;
        break;
      case 'TRAINING_COMPLETED':
        if (activeStart !== null) {
          s = { ...s, trainingDurationSecs: s.trainingDurationSecs + Math.floor((ev.ts - activeStart) / 1000) };
          activeStart = null;
        }
        s = { ...s, sessionPhase: 'done' };
        break;
      case 'REST_STARTED':
        s = { ...s, isRestActive: true };
        break;
      case 'REST_COMPLETED':
      case 'REST_SKIPPED':
        s = { ...s, isRestActive: false };
        break;
      case 'SET_COMPLETED':
        // payload.count > 1 when event was compressed
        s = { ...s, totalSets: s.totalSets + ((ev.payload?.count as number) ?? 1) };
        break;
      case 'EXERCISE_CHANGED':
        s = { ...s, currentExercise: (ev.payload?.name as string) ?? null };
        break;
      // AI event projections — stubs ready for future AI state mutations
      case 'REST_MODIFIED':
      case 'WORKOUT_ADJUSTED':
      case 'SET_TARGET_UPDATED':
      case 'INTENSITY_TUNED':
        break;
    }
  }

  if (s.sessionPhase === 'active' && activeStart !== null) {
    s = { ...s, trainingDurationSecs: s.trainingDurationSecs + Math.floor((Date.now() - activeStart) / 1000) };
  }
  return s;
}

/**
 * Reconstruct the projected state of any session from its event history.
 * Pure function — never touches the live store or fires any effects.
 * Use for debug display, AI analysis, and post-session review.
 */
export function replaySession(sessionId: string): WorkoutStateProjection {
  return deriveStateFromEvents(_log.filter(e => e.sessionId === sessionId));
}

// ── Replay mode ───────────────────────────────────────────────────────────────

/**
 * True while any replay mode is active.
 * The effect layer checks this to suppress audio / vibration / toast.
 */
export function isReplayMode(): boolean { return _flags.replayMode !== null; }

/** Return the specific active replay mode, or null when live. */
export function getReplayMode(): ReplayMode | null { return _flags.replayMode; }

/**
 * Enter or exit replay mode.
 *
 * - 'debug': event log frozen; all side-effects silenced; pure deterministic projection
 * - 'ai':    AI event injection allowed; side-effects silenced; simulates AI decision paths
 * - 'normal': standard replay; side-effects silenced; store may be updated
 * - null:    exit replay mode → return to live
 *
 * While replayMode !== null, _drain() will NOT log new events (deterministic state lock).
 */
export function setReplayMode(mode: ReplayMode | null): void {
  _flags.replayMode = mode;
}
