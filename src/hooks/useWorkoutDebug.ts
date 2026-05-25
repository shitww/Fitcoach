'use client';

/**
 * useWorkoutDebug — Reactive Debug Hook
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  DEV-ONLY  ·  Do NOT import this hook from production UI components.   │
 * │  All observability is intentionally hidden from the product-facing UI.  │
 * │  Wrap any usage with:  process.env.NODE_ENV === 'development'           │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Subscribes to the event bus and re-renders whenever a workout event fires,
 * exposing the full event timeline, state projection, causal graph, and
 * conflict records for the active session.
 *
 * This hook is read-only — it never writes to store or emits events.
 */

import { useState, useEffect } from 'react';
import { subscribe } from '@/lib/workout/events';
import {
  selectEventTimeline,
  getCurrentSessionId,
  deriveStateFromEvents,
  getLastSnapshot,
  getSessions,
  getReplayMode,
  queryEvents,
  replaySession,
  type LoggedEvent,
  type WorkoutStateProjection,
  type WorkoutEventSnapshot,
  type SessionMeta,
  type EventQuery,
  type ReplayMode,
} from '@/lib/workout/eventLog';
import {
  getCausalGraph,
  getSessionConflicts,
  generateSessionExplanation,
  type EventGraph,
  type ConflictRecord,
  type SessionExplanation,
} from '@/lib/workout/causal';

const MAX_RECENT = 20;

export interface WorkoutDebugInfo {
  /** ID of the currently active (or last completed) session. */
  sessionId: string;
  /** Total events logged in the current session. */
  eventCount: number;
  /** Full ordered event log for the active session. */
  timeline: readonly LoggedEvent[];
  /** Last N events (most recent first) — convenient for a debug overlay. */
  lastEvents: readonly LoggedEvent[];
  /** Pure state projection derived from the event log. */
  projection: WorkoutStateProjection;
  /** Last persisted snapshot (for crash recovery + integrity inspection). */
  lastSnapshot: WorkoutEventSnapshot | null;
  /** All tracked sessions — supports multi-session display. */
  sessions: readonly SessionMeta[];
  /** Current replay mode, or null when live. */
  replayMode: ReplayMode | null;
  /** Query events across sessions with composable filters. */
  query: (filter: EventQuery) => readonly LoggedEvent[];
  /** Derive projected state for any session by ID. */
  projectSession: (sid: string) => WorkoutStateProjection;
  /** Causal graph for the active session (nodes + directed edges). */
  causalGraph: EventGraph;
  /** Detected conflicts for the active session. */
  conflicts: readonly ConflictRecord[];
  /** Generate a full causal explanation for any session by ID. */
  explain: (sid: string) => SessionExplanation;
}

/** Inert stub returned in production so an accidental import never harms users. */
const _PROD_STUB: WorkoutDebugInfo = {
  sessionId: '', eventCount: 0, timeline: [], lastEvents: [],
  projection: { sessionPhase: 'idle', trainingDurationSecs: 0, totalSets: 0, currentExercise: null, sessionType: null, isRestActive: false },
  lastSnapshot: null, sessions: [], replayMode: null,
  query: () => [], projectSession: () => ({ sessionPhase: 'idle', trainingDurationSecs: 0, totalSets: 0, currentExercise: null, sessionType: null, isRestActive: false }),
  causalGraph: { nodes: [], edges: [] }, conflicts: [], explain: () => ({ sessionId: '', keyDecisions: [], fatigueCurve: [], aiInterventions: [], conflictCount: 0, adaptationSummary: '' }),
};

export function useWorkoutDebug(): WorkoutDebugInfo {
  if (process.env.NODE_ENV === 'production') {
    console.warn('[useWorkoutDebug] This hook is dev-only. Remove it from production UI.');
    return _PROD_STUB;
  }

  // Rules of hooks: useState/useEffect must always run (not after early return).
  // The production branch above returns before reaching these — that is intentional
  // because this entire hook must never be rendered in production components.
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [, setTick] = useState(0);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    return subscribe(() => setTick(t => t + 1));
  }, []);

  const sessionId = getCurrentSessionId();
  const timeline  = selectEventTimeline(sessionId || undefined);

  return {
    sessionId,
    eventCount:     timeline.length,
    timeline,
    lastEvents:     timeline.slice(-MAX_RECENT).reverse(),
    projection:     deriveStateFromEvents(timeline),
    lastSnapshot:   getLastSnapshot(),
    sessions:       getSessions(),
    replayMode:     getReplayMode(),
    query:          queryEvents,
    projectSession: replaySession,
    causalGraph:    getCausalGraph(sessionId || undefined),
    conflicts:      getSessionConflicts(sessionId),
    explain:        generateSessionExplanation,
  };
}
