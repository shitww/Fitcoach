// ── useRuntimeCore ────────────────────────────────────────────────────────────
// The central Zustand store for Phase 9 Event-Sourced Runtime.
//
// Architecture:
//   dispatch(event) → appendRuntimeEvent → reduceWorkoutRuntime → snapshot → UI
//
// UI rules:
//   ✅ read from snapshot
//   ✅ call dispatch()
//   ❌ never mutate snapshot directly
//   ❌ never own training truth in component state
// ─────────────────────────────────────────────────────────────────────────────

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { createRuntimeEvent } from './event-log/createRuntimeEvent'
import { appendRuntimeEvent, getRuntimeLogForSession, flushRuntimeLog } from './event-log/appendRuntimeEvent'
import { reduceWorkoutRuntime, buildIdleSnapshot } from './reducers/reduceWorkoutRuntime'
import { persistRuntimeSnapshot, clearPersistedSnapshot } from './snapshot/persistRuntimeSnapshot'
import { beginSessionPresence, clearSessionPresence } from './runtime/maintainSessionPresence'
import { logAndEmit } from '@/lib/workout/eventLog'
import { beginSession } from '@/lib/workout/eventLog'
import type { WorkoutRuntimeSnapshot } from './reducers/reduceWorkoutRuntime'
import type { WorkoutEventType } from '@/lib/workout/events'

// ── Store interface ────────────────────────────────────────────────────────────

interface RuntimeCoreStore {
  // The single source of truth
  snapshot: WorkoutRuntimeSnapshot

  // Active session ID (persisted for crash recovery)
  activeSessionId: string | null

  // Whether the store has been hydrated from persisted state
  isHydrated: boolean

  // ── Dispatch (the ONLY way to mutate state) ──────────────────────────────────
  dispatch: (type: WorkoutEventType, payload?: Record<string, unknown>) => void

  // ── Session control ────────────────────────────────────────────────────────
  startSession: (params: {
    sessionType: 'strength' | 'cardio' | 'free'
    planId?: string
    planDayName?: string
    exerciseQueue?: string[]
  }) => string

  pauseSession: () => void
  resumeSession: () => void
  completeSession: () => WorkoutRuntimeSnapshot
  resetSession: () => void

  // ── Internal: rebuild snapshot from event log ─────────────────────────────
  _rebuildSnapshot: () => void
}

// ── Snapshot persist interval ─────────────────────────────────────────────────
let _snapshotInterval: ReturnType<typeof setInterval> | null = null

function _startSnapshotInterval(getSnapshot: () => WorkoutRuntimeSnapshot) {
  if (typeof window === 'undefined') return
  if (_snapshotInterval) return
  _snapshotInterval = setInterval(() => {
    const s = getSnapshot()
    if (s.sessionPhase !== 'idle') {
      persistRuntimeSnapshot(s)
      flushRuntimeLog()
    }
  }, 5000)   // persist every 5s during active session
}

function _stopSnapshotInterval() {
  if (_snapshotInterval) {
    clearInterval(_snapshotInterval)
    _snapshotInterval = null
  }
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useRuntimeCore = create<RuntimeCoreStore>()(
  persist(
    (set, get) => ({
      snapshot: buildIdleSnapshot(),
      activeSessionId: null,
      isHydrated: false,

      // ── Core dispatch ────────────────────────────────────────────────────────
      dispatch(type, payload = {}) {
        const { activeSessionId, snapshot } = get()
        const sessionId = activeSessionId ?? snapshot.sessionId ?? ''
        if (!sessionId) {
          console.warn('[RuntimeCore] dispatch called with no active session:', type)
          return
        }

        // 1. Create immutable event
        const event = createRuntimeEvent(type, sessionId, payload, 'user')

        // 2. Append to in-memory event log (append-only)
        appendRuntimeEvent(event)

        // 3. Bridge to legacy event bus (for existing subscribers / effects)
        try {
          logAndEmit({ type, ts: event.timestamp, payload }, sessionId)
        } catch { /* non-critical */ }

        // 4. Rebuild snapshot from event log (deterministic)
        const events = getRuntimeLogForSession(sessionId)
        const newSnapshot = reduceWorkoutRuntime(events)

        set({ snapshot: newSnapshot })

        // 5. Persist snapshot for crash recovery (throttled)
        if (newSnapshot.sessionPhase !== 'idle') {
          persistRuntimeSnapshot(newSnapshot)
        }
      },

      // ── Session control ──────────────────────────────────────────────────────
      startSession({ sessionType, planId, planDayName, exerciseQueue }) {
        // Create new session ID via the legacy event log (for backward compat)
        const sessionId = beginSession()

        set({ activeSessionId: sessionId })
        beginSessionPresence(sessionId)
        _startSnapshotInterval(() => get().snapshot)

        get().dispatch('SESSION_STARTED', {
          sessionType,
          planId: planId ?? null,
          planDayName: planDayName ?? null,
          exerciseQueue: exerciseQueue ?? [],
        })

        return sessionId
      },

      pauseSession() {
        get().dispatch('SESSION_PAUSED')
      },

      resumeSession() {
        get().dispatch('SESSION_RESUMED')
      },

      completeSession() {
        const { snapshot } = get()
        get().dispatch('SESSION_COMPLETED', {
          elapsedSec: snapshot.elapsedSec,
          totalVolume: snapshot.totalVolume,
          totalSets: snapshot.totalSets,
          exerciseCount: snapshot.exercises.length,
        })

        _stopSnapshotInterval()
        clearSessionPresence()
        clearPersistedSnapshot()

        return get().snapshot
      },

      resetSession() {
        _stopSnapshotInterval()
        clearSessionPresence()
        clearPersistedSnapshot()
        set({ snapshot: buildIdleSnapshot(), activeSessionId: null })
      },

      _rebuildSnapshot() {
        const { activeSessionId } = get()
        if (!activeSessionId) return
        const events = getRuntimeLogForSession(activeSessionId)
        if (events.length === 0) return
        const snapshot = reduceWorkoutRuntime(events)
        set({ snapshot })
      },
    }),
    {
      name: 'fitcoach:v1:runtime-core',
      partialize: (state) => ({
        activeSessionId: state.activeSessionId,
        // Snapshot is NOT persisted here — we use the dedicated snapshot layer
        // and rebuild from event log on hydration
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true
          // Rebuild snapshot from event log on hydration
          if (state.activeSessionId) {
            setTimeout(() => {
              state._rebuildSnapshot()
            }, 0)
          }
        }
      },
    }
  )
)

// ── Selectors ─────────────────────────────────────────────────────────────────

/** Select the current session phase from runtime-core. */
export const selectRTPhase = (s: RuntimeCoreStore) => s.snapshot.sessionPhase

/** Select active exercise name. */
export const selectRTActiveExercise = (s: RuntimeCoreStore) => s.snapshot.activeExerciseName

/** Select total sets logged. */
export const selectRTTotalSets = (s: RuntimeCoreStore) => s.snapshot.totalSets

/** Select whether rest is active. */
export const selectRTIsRestActive = (s: RuntimeCoreStore) => s.snapshot.isRestActive

/** Select rest end time for countdown derivation. */
export const selectRTRestEndAt = (s: RuntimeCoreStore) => s.snapshot.restEndAt

/** Select exercise queue for queue rail. */
export const selectRTExerciseQueue = (s: RuntimeCoreStore) => s.snapshot.exerciseQueue

/** Select exercises with sets for logging surface. */
export const selectRTExercises = (s: RuntimeCoreStore) => s.snapshot.exercises

/** Full snapshot accessor (use sparingly — prefer targeted selectors). */
export const selectRTSnapshot = (s: RuntimeCoreStore) => s.snapshot
