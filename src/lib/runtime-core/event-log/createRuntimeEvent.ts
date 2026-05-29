// ── Create Runtime Event ──────────────────────────────────────────────────────
// Typed factory for all Phase 9 runtime events.
// Every training interaction produces a typed, immutable event.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutEventType } from '@/lib/workout/events'

export const RUNTIME_CORE_VERSION = 1

// ── Typed payloads for every event ────────────────────────────────────────────

export interface SessionStartedPayload {
  sessionType: 'strength' | 'cardio' | 'free'
  planId?: string
  planDayName?: string
  exerciseQueue?: string[]
}

export interface ExerciseAddedPayload {
  name: string
  targetSets: number
  restTime: number
  isBodyweight: boolean
  position?: number            // index in queue (undefined = end)
}

export interface ExerciseQueueSetPayload {
  exerciseNames: string[]
  targetSetsPerExercise?: Record<string, number>
  restTimePerExercise?: Record<string, number>
}

export interface SetLoggedPayload {
  exerciseName: string
  setIndex: number             // 0-indexed within this exercise
  weight: number
  reps: number
  rir: number | null
  isBodyweight: boolean
  isWarmup: boolean
  isFailure: boolean
  estimated1RM: number
  predictionSource: 'session' | 'history' | 'none'
}

export interface SetCorrectedPayload {
  targetEventId: string        // id of SET_LOGGED being corrected
  exerciseName: string
  correctedWeight?: number
  correctedReps?: number
  correctedRir?: number | null
  reason?: string
}

export interface RestStartedPayload {
  duration: number             // seconds
  exerciseName: string
  setIndex: number
}

export interface PredictionAcceptedPayload {
  exerciseName: string
  predictedWeight: number | null
  predictedReps: number | null
  source: 'session' | 'history' | 'none'
}

export interface PredictionRejectedPayload extends PredictionAcceptedPayload {
  actualWeight: number | null
  actualReps: number | null
}

export interface CardioParamsUpdatedPayload {
  speed: number
  incline: number
  level: number
  sessionType: string
}

export interface ExerciseCompletedPayload {
  exerciseName: string
  setsLogged: number
  totalVolume: number
}

export interface SessionCompletedPayload {
  elapsedSec: number
  totalVolume: number
  totalSets: number
  exerciseCount: number
}

export interface SessionRecoveredPayload {
  originalSessionId: string
  recoveryType: 'lock_screen' | 'crash' | 'background' | 'navigate_back'
  elapsedBeforeMs: number
}

// ── Runtime Event definition ───────────────────────────────────────────────────

export interface RuntimeCoreEvent {
  readonly id: string
  readonly type: WorkoutEventType
  readonly timestamp: number
  readonly sessionId: string
  readonly payload: Record<string, unknown>
  readonly version: number
  readonly origin: 'user' | 'ai' | 'system'
}

let _seq = 0

function _genId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Create an immutable runtime event. */
export function createRuntimeEvent(
  type: WorkoutEventType,
  sessionId: string,
  payload: Record<string, unknown> = {},
  origin: RuntimeCoreEvent['origin'] = 'user'
): RuntimeCoreEvent {
  return Object.freeze({
    id: _genId(),
    type,
    timestamp: Date.now(),
    sessionId,
    payload,
    version: RUNTIME_CORE_VERSION,
    origin,
  })
}

/** Get current event sequence counter (monotonic, session-scoped). */
export function getRuntimeEventSeq(): number { return _seq }
export function incrementRuntimeEventSeq(): number { return ++_seq }
