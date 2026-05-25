/**
 * Causal Graph Engine — "Why It Happened"
 *
 * Provides:
 *   - CausalEdge graph (who caused what, typed by relation)
 *   - DecisionTrace on AI events (reason + inputs + confidence + strategy)
 *   - Conflict detection + resolution (parameter_collision / strategy_conflict)
 *   - Event enrichment pipeline (auto-annotate AI events before aiEmit)
 *   - Session-level explanation (human-readable causal summary)
 *
 * This module is READ-ONLY with respect to the event log.
 * It maintains its own module-level state for edges and conflict records.
 *
 * Dependency chain (no cycles):
 *   events.ts  ←  eventLog.ts  ←  causal.ts  ←  hooks / AI clients
 */

import { type WorkoutEvent, type WorkoutEventType } from './events';
import {
  type LoggedEvent,
  selectEventTimeline,
  queryEvents,
  getCurrentSessionId,
} from './eventLog';

// ── Types ─────────────────────────────────────────────────────────────────────

export type CausalRelation = 'caused_by' | 'influenced_by' | 'derived_from';

/** A directed edge in the causal graph — fromEventId → toEventId. */
export interface CausalEdge {
  readonly id: string;
  /** The parent / cause event. */
  readonly fromEventId: string;
  /** The child / effect event. */
  readonly toEventId: string;
  readonly relation: CausalRelation;
  readonly ts: number;
}

/**
 * Attached to AI events via payload.decisionTrace.
 * Explains WHY the AI emitted this event and HOW confident it was.
 */
export interface DecisionTrace {
  readonly reason: string;
  /** IDs of LoggedEvents that informed this decision. */
  readonly inputs: readonly string[];
  /** 0.0 – 1.0. Used by confidence-based conflict resolution. */
  readonly confidence: number;
  readonly strategy: string;
  /** Optional: identify the AI agent for multi-agent attribution. */
  readonly agentId?: string;
}

/** Signals derived from the live event log, auto-attached by enrichAIEvent. */
export interface DerivedSignals {
  /** 0-1: estimated from recent SET_COMPLETED density. */
  readonly fatigueScore: number;
  /** 0-1: urgency of rest based on elapsed time since last REST_STARTED. */
  readonly restPressure: number;
  /** Count of AI interventions so far in this session. */
  readonly aiInterventionCount: number;
}

export type ConflictType     = 'parameter_collision' | 'strategy_conflict';
export type ConflictSeverity = 'low' | 'medium' | 'high';
export type ResolutionStrategy = 'latest-wins' | 'confidence-based' | 'strategy-priority';

/** Two or more AI events that are in logical tension with each other. */
export interface ConflictRecord {
  readonly conflictId: string;
  /** IDs of the conflicting events. */
  readonly eventIds: readonly string[];
  readonly type: ConflictType;
  readonly severity: ConflictSeverity;
  readonly ts: number;
  resolution?: ConflictResolution;
}

/** Outcome of conflict arbitration. Rejected events are marked but never deleted. */
export interface ConflictResolution {
  readonly winnerId: string;
  readonly rejectedIds: readonly string[];
  readonly strategy: ResolutionStrategy;
  readonly reason: string;
}

/** The full causal graph for a session (or the entire log). */
export interface EventGraph {
  readonly nodes: readonly LoggedEvent[];
  readonly edges: readonly CausalEdge[];
}

export interface KeyDecision {
  readonly eventId: string;
  readonly type: WorkoutEventType;
  readonly ts: number;
  readonly trace: DecisionTrace;
  readonly outcome: 'accepted' | 'rejected' | 'conflicted';
}

export interface FatiguePoint {
  readonly ts: number;
  /** Normalised 0-1 fatigue estimate at this timestamp. */
  readonly score: number;
  /** Cumulative sets at this point. */
  readonly totalSets: number;
}

export interface AIIntervention {
  readonly eventId: string;
  readonly type: WorkoutEventType;
  readonly ts: number;
  readonly trace: DecisionTrace | null;
  readonly wasRejected: boolean;
}

export interface SessionExplanation {
  readonly sessionId: string;
  readonly keyDecisions: readonly KeyDecision[];
  readonly fatigueCurve: readonly FatiguePoint[];
  readonly aiInterventions: readonly AIIntervention[];
  readonly conflictCount: number;
  /** Deterministic Chinese summary of AI activity in this session. */
  readonly adaptationSummary: string;
}

// ── Module-level state ────────────────────────────────────────────────────────
const _edges: CausalEdge[]              = [];
const _conflicts: Map<string, ConflictRecord> = new Map();
const _rejectedIds: Set<string>         = new Set();

// ── Helpers ───────────────────────────────────────────────────────────────────
function _genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Conflict pairs: events of these type-pairs within the detection window are flagged. */
const CONFLICT_PAIRS = new Set<string>([
  'REST_MODIFIED:INTENSITY_TUNED',
  'INTENSITY_TUNED:REST_MODIFIED',
  'SET_TARGET_UPDATED:WORKOUT_ADJUSTED',
  'WORKOUT_ADJUSTED:SET_TARGET_UPDATED',
]);

/**
 * Lower number = higher priority. Used by strategy-priority resolution.
 * Add new strategies here as AI agents are introduced.
 */
const STRATEGY_PRIORITY: Record<string, number> = {
  injury_prevention:              1,
  adaptive_overload_protection:   2,
  fatigue_management:             3,
  adaptive_rest_extension:        4,
  strength_optimization:          5,
  default:                        99,
};

// ── Causal edge management ────────────────────────────────────────────────────

/**
 * Register a causal relationship between two logged events.
 * Call this after aiEmit() using the last logged event's ID as toEventId.
 */
export function addCausalEdge(
  fromEventId: string,
  toEventId: string,
  relation: CausalRelation,
): CausalEdge {
  const edge: CausalEdge = Object.freeze({
    id: _genId(), fromEventId, toEventId, relation, ts: Date.now(),
  });
  _edges.push(edge);
  return edge;
}

/**
 * Convenience: link the most recently logged event in the active session
 * as the causal child of fromEventId.
 */
export function linkLastEvent(fromEventId: string, relation: CausalRelation): void {
  const sid     = getCurrentSessionId();
  const recent  = queryEvents({ sessionId: sid, limit: 1 });
  if (recent.length > 0) addCausalEdge(fromEventId, recent[recent.length - 1].id, relation);
}

/**
 * Return the causal graph for a session (or the full log if no sessionId given).
 * Nodes = all logged events for the session.
 * Edges = all CausalEdges where both endpoints are in this session's node set.
 */
export function getCausalGraph(sessionId?: string): EventGraph {
  const nodes   = selectEventTimeline(sessionId);
  const nodeIds = new Set(nodes.map(n => n.id));
  const edges   = _edges.filter(e => nodeIds.has(e.fromEventId) && nodeIds.has(e.toEventId));
  return { nodes, edges };
}

/** All causal edges from a given event (edges where it is the cause). */
export function getChildren(eventId: string): readonly CausalEdge[] {
  return _edges.filter(e => e.fromEventId === eventId);
}

/** All causal edges into a given event (edges where it is the effect). */
export function getParents(eventId: string): readonly CausalEdge[] {
  return _edges.filter(e => e.toEventId === eventId);
}

// ── Decision trace helpers ────────────────────────────────────────────────────

/** Extract the DecisionTrace embedded in an event's payload. Returns null if absent. */
export function getDecisionTrace(event: LoggedEvent): DecisionTrace | null {
  const dt = event.payload?.decisionTrace as DecisionTrace | undefined;
  return dt ?? null;
}

// ── Event enrichment pipeline ─────────────────────────────────────────────────

/**
 * Enrich a WorkoutEvent before calling aiEmit().
 * Automatically attaches: parentEventId, decisionTrace, derivedSignals.
 * Returns a new WorkoutEvent — does NOT emit.
 *
 * Usage:
 *   const enriched = enrichAIEvent(rawEvent, { parentEventId, trace });
 *   aiEmit(enriched);
 *   linkLastEvent(parentEventId, 'caused_by');
 */
export function enrichAIEvent(
  event: WorkoutEvent,
  options: {
    parentEventId?: string;
    trace?: DecisionTrace;
    sessionId?: string;
  } = {},
): WorkoutEvent {
  const sid     = options.sessionId ?? getCurrentSessionId();
  const signals = _derivedSignals(sid, event.ts);
  return {
    ...event,
    payload: {
      ...event.payload,
      ...(options.parentEventId ? { parentEventId: options.parentEventId } : {}),
      ...(options.trace          ? { decisionTrace: options.trace }          : {}),
      derivedSignals: signals,
    },
  };
}

// ── Conflict detection ────────────────────────────────────────────────────────

const DEFAULT_CONFLICT_WINDOW_MS = 5_000;

/**
 * Scan AI events in the provided array and return detected conflicts.
 * Each returned ConflictRecord is also registered in the module-level registry.
 *
 * @param events    Subset of events to scan (typically AI-origin events for a session).
 * @param windowMs  Detection window in milliseconds (default 5 s).
 */
export function detectConflicts(
  events: readonly LoggedEvent[],
  windowMs = DEFAULT_CONFLICT_WINDOW_MS,
): readonly ConflictRecord[] {
  const aiEvents = events.filter(e => e.origin === 'ai');
  const found: ConflictRecord[] = [];

  for (let i = 0; i < aiEvents.length; i++) {
    for (let j = i + 1; j < aiEvents.length; j++) {
      const a = aiEvents[i];
      const b = aiEvents[j];
      if (Math.abs(a.ts - b.ts) > windowMs) continue;

      const pairKey = `${a.type}:${b.type}`;
      const isParamCollision  = CONFLICT_PAIRS.has(pairKey);
      const isSameType        = a.type === b.type;

      if (!isParamCollision && !isSameType) continue;

      // Severity: same-type double-emit = low; known conflict pair = medium by default;
      // elevate to high if confidence difference is large
      const confA = (a.payload?.decisionTrace as DecisionTrace | undefined)?.confidence ?? 0.5;
      const confB = (b.payload?.decisionTrace as DecisionTrace | undefined)?.confidence ?? 0.5;
      const confDiff = Math.abs(confA - confB);

      const severity: ConflictSeverity =
        isSameType           ? 'low'    :
        confDiff > 0.4       ? 'high'   :
                               'medium';

      const record: ConflictRecord = {
        conflictId: _genId(),
        eventIds:   [a.id, b.id],
        type:       isSameType ? 'parameter_collision' : 'strategy_conflict',
        severity,
        ts:         Math.max(a.ts, b.ts),
      };
      _conflicts.set(record.conflictId, record);
      found.push(record);
    }
  }
  return found;
}

/** All registered conflict records (across all sessions). */
export function getAllConflicts(): readonly ConflictRecord[] {
  return [..._conflicts.values()];
}

/** Conflict records for a specific session. */
export function getSessionConflicts(sessionId: string): readonly ConflictRecord[] {
  const sessionEventIds = new Set(
    selectEventTimeline(sessionId).map(e => e.id),
  );
  return [..._conflicts.values()].filter(c =>
    c.eventIds.some(id => sessionEventIds.has(id)),
  );
}

// ── Conflict resolution ───────────────────────────────────────────────────────

/**
 * Arbitrate a ConflictRecord and attach a resolution.
 * Rejected events are tracked in `_rejectedIds` — they remain in the log
 * (immutability preserved) but are flagged for downstream consumers.
 *
 * @param conflict  The conflict to resolve (mutated in place with .resolution).
 * @param strategy  Resolution strategy (default: 'latest-wins').
 */
export function resolveConflict(
  conflict: ConflictRecord,
  strategy: ResolutionStrategy = 'latest-wins',
): ConflictResolution {
  const events  = conflict.eventIds
    .map(id => queryEvents({ limit: undefined }).find(e => e.id === id))
    .filter((e): e is LoggedEvent => e !== undefined);

  if (events.length < 2) {
    const resolution: ConflictResolution = {
      winnerId: conflict.eventIds[0] ?? '',
      rejectedIds: [],
      strategy,
      reason: 'single event — no arbitration needed',
    };
    (conflict as { resolution?: ConflictResolution }).resolution = resolution;
    return resolution;
  }

  let winner: LoggedEvent;
  let reason: string;

  if (strategy === 'confidence-based') {
    winner = events.reduce((best, e) => {
      const bc = (best.payload?.decisionTrace as DecisionTrace | undefined)?.confidence ?? 0;
      const ec = (e.payload?.decisionTrace    as DecisionTrace | undefined)?.confidence ?? 0;
      return ec > bc ? e : best;
    });
    const conf = (winner.payload?.decisionTrace as DecisionTrace | undefined)?.confidence ?? 0;
    reason = `highest confidence: ${(conf * 100).toFixed(0)}%`;

  } else if (strategy === 'strategy-priority') {
    winner = events.reduce((best, e) => {
      const bp = STRATEGY_PRIORITY[(best.payload?.decisionTrace as DecisionTrace | undefined)?.strategy ?? ''] ?? STRATEGY_PRIORITY.default;
      const ep = STRATEGY_PRIORITY[(e.payload?.decisionTrace    as DecisionTrace | undefined)?.strategy ?? ''] ?? STRATEGY_PRIORITY.default;
      return ep < bp ? e : best;
    });
    const strat = (winner.payload?.decisionTrace as DecisionTrace | undefined)?.strategy ?? 'default';
    reason = `highest strategy priority: "${strat}"`;

  } else {
    // latest-wins (default)
    winner = events.reduce((latest, e) => e.ts > latest.ts ? e : latest);
    reason = 'latest event wins';
  }

  const rejectedIds = events.filter(e => e.id !== winner.id).map(e => e.id);
  rejectedIds.forEach(id => _rejectedIds.add(id));

  const resolution: ConflictResolution = {
    winnerId:    winner.id,
    rejectedIds,
    strategy,
    reason,
  };
  (conflict as { resolution?: ConflictResolution }).resolution = resolution;
  return resolution;
}

/** True if this event was rejected by conflict arbitration. */
export function isRejected(eventId: string): boolean {
  return _rejectedIds.has(eventId);
}

// ── Derived signals (private) ─────────────────────────────────────────────────

function _derivedSignals(sessionId: string, atTs: number): DerivedSignals {
  const FATIGUE_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
  const MAX_SETS_PER_10MIN = 15;             // 15 sets in 10 min = full fatigue

  const sessionEvents = selectEventTimeline(sessionId);
  const recentSets    = sessionEvents.filter(
    e => e.type === 'SET_COMPLETED' && e.ts >= atTs - FATIGUE_WINDOW_MS && e.ts <= atTs,
  ).length;
  const fatigueScore = Math.min(1, recentSets / MAX_SETS_PER_10MIN);

  const lastRest = [...sessionEvents].reverse().find(e => e.type === 'REST_STARTED');
  const lastRestMs = lastRest ? atTs - lastRest.ts : 0;
  const restPressure = lastRest
    ? Math.min(1, lastRestMs / (3 * 60 * 1000)) // pressure peaks at 3 min without rest
    : 0;

  const aiInterventionCount = sessionEvents.filter(
    e => e.origin === 'ai' && e.ts <= atTs,
  ).length;

  return { fatigueScore, restPressure, aiInterventionCount };
}

// ── Session explanation ───────────────────────────────────────────────────────

/**
 * Generate a human-readable causal summary of a training session.
 * Pure function over the event log + causal state — no side effects.
 */
export function generateSessionExplanation(sessionId: string): SessionExplanation {
  const events   = selectEventTimeline(sessionId);
  const aiEvents = events.filter(e => e.origin === 'ai');

  // ── Key decisions ──────────────────────────────────────────────────────────
  const keyDecisions: KeyDecision[] = aiEvents
    .map(e => {
      const trace = getDecisionTrace(e);
      if (!trace) return null;
      const inConflict = getSessionConflicts(sessionId).some(c => c.eventIds.includes(e.id));
      const rejected   = isRejected(e.id);
      return {
        eventId: e.id,
        type:    e.type,
        ts:      e.ts,
        trace,
        outcome: rejected ? 'rejected' : inConflict ? 'conflicted' : 'accepted',
      } satisfies KeyDecision;
    })
    .filter((d): d is KeyDecision => d !== null);

  // ── Fatigue curve (data point per SET_COMPLETED) ───────────────────────────
  const setEvents    = events.filter(e => e.type === 'SET_COMPLETED');
  const WINDOW_MS    = 10 * 60 * 1000;
  const MAX_RATE     = 15;
  const fatigueCurve: FatiguePoint[] = setEvents.map((e, i) => {
    const windowStart = e.ts - WINDOW_MS;
    const recent      = setEvents.slice(0, i + 1).filter(s => s.ts >= windowStart).length;
    return { ts: e.ts, score: Math.min(1, recent / MAX_RATE), totalSets: i + 1 };
  });

  // ── AI interventions ───────────────────────────────────────────────────────
  const aiInterventions: AIIntervention[] = aiEvents.map(e => ({
    eventId:    e.id,
    type:       e.type,
    ts:         e.ts,
    trace:      getDecisionTrace(e),
    wasRejected: isRejected(e.id),
  }));

  // ── Adaptation summary (deterministic Chinese text) ────────────────────────
  const conflictCount    = getSessionConflicts(sessionId).length;
  const acceptedCount    = aiInterventions.filter(i => !i.wasRejected).length;
  const avgConf          = keyDecisions.length > 0
    ? keyDecisions.reduce((s, d) => s + d.trace.confidence, 0) / keyDecisions.length
    : 0;

  const adaptationSummary = _buildAdaptationSummary(
    acceptedCount, conflictCount, avgConf, fatigueCurve,
  );

  return {
    sessionId,
    keyDecisions,
    fatigueCurve,
    aiInterventions,
    conflictCount,
    adaptationSummary,
  };
}

function _buildAdaptationSummary(
  aiCount: number,
  conflictCount: number,
  avgConf: number,
  fatigueCurve: readonly FatiguePoint[],
): string {
  if (aiCount === 0) return '本次训练无 AI 干预';
  const parts: string[] = [`AI 共做出 ${aiCount} 次有效调整`];
  if (conflictCount > 0) parts.push(`${conflictCount} 次策略冲突已仲裁`);
  if (avgConf >= 0.8)       parts.push('决策置信度高');
  else if (avgConf >= 0.5)  parts.push('决策置信度中等');
  else if (avgConf > 0)     parts.push('决策置信度较低，建议复查');
  const peakFatigue = fatigueCurve.reduce((max, p) => Math.max(max, p.score), 0);
  if (peakFatigue >= 0.8)       parts.push('训练强度达到峰值');
  else if (peakFatigue >= 0.5)  parts.push('训练强度中等');
  return parts.join('，');
}
