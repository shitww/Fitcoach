// ── Reduce Workout Runtime ────────────────────────────────────────────────────
// Pure function: event log → full WorkoutRuntimeSnapshot
// THIS is the source of truth for all workout state.
// ─────────────────────────────────────────────────────────────────────────────

import type { RuntimeCoreEvent, SetLoggedPayload } from '../event-log/createRuntimeEvent'

// ── Snapshot types ────────────────────────────────────────────────────────────

export interface RuntimeSet {
  id: string                   // event id of the SET_LOGGED that produced this
  exerciseName: string
  setIndex: number             // 0-indexed within exercise
  weight: number
  reps: number
  rir: number | null
  isBodyweight: boolean
  isWarmup: boolean
  isFailure: boolean
  estimated1RM: number
  timestamp: number
  predictionSource: 'session' | 'history' | 'none'
  correctedBy?: string         // id of SET_CORRECTED event if applicable
}

export interface RuntimeExercise {
  name: string
  sets: RuntimeSet[]
  targetSets: number
  restTime: number
  isBodyweight: boolean
  startedAt: number | null
  completedAt: number | null
  totalVolume: number
}

export interface RuntimePRResult {
  type: 'weight' | 'reps' | 'volume'
  display: string
  exerciseName: string
  eventId: string
}

export interface WorkoutRuntimeSnapshot {
  // Session identity
  sessionId: string | null
  sessionType: 'strength' | 'cardio' | 'free' | null
  planId: string | null
  planDayName: string | null

  // Phase
  sessionPhase: 'idle' | 'active' | 'paused' | 'done'
  startTime: number | null
  elapsedSec: number           // computed at snapshot time
  pausedDurationSec: number    // accumulated paused seconds

  // Exercise truth
  exercises: RuntimeExercise[]
  exerciseQueue: string[]      // ordered, includes completed
  activeExerciseName: string | null
  completedExerciseNames: string[]

  // Rest state
  isRestActive: boolean
  restDuration: number         // seconds
  restEndAt: number | null     // epoch ms

  // Stats (live, derived from exercises)
  totalSets: number
  totalVolume: number
  prResults: RuntimePRResult[]

  // Cardio
  cardioSpeed: number
  cardioIncline: number
  cardioLevel: number

  // Session metadata
  trainingNotes: string

  // Predictions
  lastPrediction: {
    exerciseName: string
    weight: number | null
    reps: number | null
    accepted: boolean
  } | null

  // Integrity
  eventCount: number
  lastEventId: string | null
  snapshotVersion: number
}

export const SNAPSHOT_VERSION = 1

// ── Idle state ────────────────────────────────────────────────────────────────

export function buildIdleSnapshot(): WorkoutRuntimeSnapshot {
  return {
    sessionId: null,
    sessionType: null,
    planId: null,
    planDayName: null,
    sessionPhase: 'idle',
    startTime: null,
    elapsedSec: 0,
    pausedDurationSec: 0,
    exercises: [],
    exerciseQueue: [],
    activeExerciseName: null,
    completedExerciseNames: [],
    isRestActive: false,
    restDuration: 0,
    restEndAt: null,
    totalSets: 0,
    totalVolume: 0,
    prResults: [],
    cardioSpeed: 0,
    cardioIncline: 0,
    cardioLevel: 0,
    trainingNotes: '',
    lastPrediction: null,
    eventCount: 0,
    lastEventId: null,
    snapshotVersion: SNAPSHOT_VERSION,
  }
}

// ── Pure reducer ──────────────────────────────────────────────────────────────

/**
 * Deterministic runtime reducer.
 * Replays the given event sequence to produce a WorkoutRuntimeSnapshot.
 * Pure function — no side effects, no store access.
 */
export function reduceWorkoutRuntime(
  events: readonly RuntimeCoreEvent[],
  asOf: number = Date.now()
): WorkoutRuntimeSnapshot {
  let s = buildIdleSnapshot()
  let activeStartTs: number | null = null
  let pauseStartTs: number | null  = null

  for (const ev of events) {
    s = { ...s, eventCount: s.eventCount + 1, lastEventId: ev.id }

    switch (ev.type) {

      // ── Session lifecycle ──────────────────────────────────────────────────
      case 'TRAINING_STARTED':
      case 'SESSION_STARTED': {
        const p = ev.payload as Partial<Record<string, unknown>>
        s = {
          ...s,
          sessionId: ev.sessionId,
          sessionPhase: 'active',
          sessionType: (p.sessionType as WorkoutRuntimeSnapshot['sessionType']) ?? 'strength',
          planId: (p.planId as string) ?? null,
          planDayName: (p.planDayName as string) ?? null,
          startTime: ev.timestamp,
          elapsedSec: 0,
          pausedDurationSec: 0,
        }
        if (p.exerciseQueue && Array.isArray(p.exerciseQueue)) {
          s = { ...s, exerciseQueue: p.exerciseQueue as string[] }
        }
        activeStartTs = ev.timestamp
        break
      }

      case 'TRAINING_PAUSED':
      case 'SESSION_PAUSED': {
        if (activeStartTs !== null) {
          s = {
            ...s,
            sessionPhase: 'paused',
            elapsedSec: s.elapsedSec + Math.floor((ev.timestamp - activeStartTs) / 1000),
          }
          activeStartTs = null
          pauseStartTs = ev.timestamp
        }
        break
      }

      case 'TRAINING_RESUMED':
      case 'SESSION_RESUMED': {
        if (pauseStartTs !== null) {
          s = {
            ...s,
            sessionPhase: 'active',
            pausedDurationSec: s.pausedDurationSec + Math.floor((ev.timestamp - pauseStartTs) / 1000),
          }
          pauseStartTs = null
        } else {
          s = { ...s, sessionPhase: 'active' }
        }
        activeStartTs = ev.timestamp
        break
      }

      case 'TRAINING_COMPLETED':
      case 'SESSION_COMPLETED': {
        if (activeStartTs !== null) {
          s = {
            ...s,
            elapsedSec: s.elapsedSec + Math.floor((ev.timestamp - activeStartTs) / 1000),
          }
          activeStartTs = null
        }
        s = { ...s, sessionPhase: 'done', isRestActive: false, restDuration: 0, restEndAt: null }
        break
      }

      case 'SESSION_RECOVERED': {
        s = { ...s, sessionPhase: 'active' }
        activeStartTs = ev.timestamp
        break
      }

      // ── Exercise queue ─────────────────────────────────────────────────────
      case 'EXERCISE_ADDED': {
        const p = ev.payload as Partial<Record<string, unknown>>
        const name = p.name as string
        if (!s.exerciseQueue.includes(name)) {
          const pos = typeof p.position === 'number'
            ? p.position
            : s.exerciseQueue.length
          const q = [...s.exerciseQueue]
          q.splice(pos, 0, name)
          s = { ...s, exerciseQueue: q }
        }
        if (!s.exercises.find(e => e.name === name)) {
          const newEx: RuntimeExercise = {
            name,
            sets: [],
            targetSets: (p.targetSets as number) ?? 3,
            restTime: (p.restTime as number) ?? 90,
            isBodyweight: (p.isBodyweight as boolean) ?? false,
            startedAt: null,
            completedAt: null,
            totalVolume: 0,
          }
          s = { ...s, exercises: [...s.exercises, newEx] }
        }
        break
      }

      case 'EXERCISE_QUEUE_SET': {
        const p = ev.payload as Partial<Record<string, unknown>>
        const names = (p.exerciseNames as string[]) ?? []
        const targetMap = (p.targetSetsPerExercise as Record<string, number>) ?? {}
        const restMap   = (p.restTimePerExercise  as Record<string, number>) ?? {}
        s = { ...s, exerciseQueue: names }
        const newExercises: RuntimeExercise[] = names.map(name => {
          const existing = s.exercises.find(e => e.name === name)
          return existing ?? {
            name,
            sets: [],
            targetSets: targetMap[name] ?? 3,
            restTime: restMap[name] ?? 90,
            isBodyweight: false,
            startedAt: null,
            completedAt: null,
            totalVolume: 0,
          }
        })
        s = { ...s, exercises: newExercises }
        break
      }

      case 'EXERCISE_CHANGED': {
        const name = ev.payload.name as string ?? null
        s = { ...s, activeExerciseName: name }
        if (name) {
          const ex = s.exercises.find(e => e.name === name)
          if (ex && ex.startedAt === null) {
            s = {
              ...s,
              exercises: s.exercises.map(e =>
                e.name === name ? { ...e, startedAt: ev.timestamp } : e
              ),
            }
          }
        }
        break
      }

      case 'EXERCISE_COMPLETED': {
        const name = ev.payload.exerciseName as string
        s = {
          ...s,
          completedExerciseNames: s.completedExerciseNames.includes(name)
            ? s.completedExerciseNames
            : [...s.completedExerciseNames, name],
          exercises: s.exercises.map(e =>
            e.name === name ? { ...e, completedAt: ev.timestamp } : e
          ),
        }
        break
      }

      case 'EXERCISE_SKIPPED': {
        const name = ev.payload.exerciseName as string
        s = { ...s, exerciseQueue: s.exerciseQueue.filter(n => n !== name) }
        break
      }

      // ── Set events (core truth) ────────────────────────────────────────────
      case 'SET_LOGGED': {
        const p = ev.payload as unknown as SetLoggedPayload
        const setRecord: RuntimeSet = {
          id: ev.id,
          exerciseName: p.exerciseName,
          setIndex: p.setIndex,
          weight: p.weight,
          reps: p.reps,
          rir: p.rir,
          isBodyweight: p.isBodyweight,
          isWarmup: p.isWarmup,
          isFailure: p.isFailure,
          estimated1RM: p.estimated1RM,
          timestamp: ev.timestamp,
          predictionSource: p.predictionSource ?? 'none',
        }
        const setVol = p.isBodyweight ? 0 : p.weight * p.reps

        // Ensure exercise exists
        let exercises = s.exercises
        if (!exercises.find(e => e.name === p.exerciseName)) {
          exercises = [...exercises, {
            name: p.exerciseName,
            sets: [],
            targetSets: 3,
            restTime: 90,
            isBodyweight: p.isBodyweight,
            startedAt: ev.timestamp,
            completedAt: null,
            totalVolume: 0,
          }]
          if (!s.exerciseQueue.includes(p.exerciseName)) {
            s = { ...s, exerciseQueue: [...s.exerciseQueue, p.exerciseName] }
          }
        }

        s = {
          ...s,
          exercises: exercises.map(e =>
            e.name === p.exerciseName
              ? {
                  ...e,
                  sets: [...e.sets, setRecord],
                  totalVolume: e.totalVolume + setVol,
                  startedAt: e.startedAt ?? ev.timestamp,
                }
              : e
          ),
          totalSets: s.totalSets + (p.isWarmup ? 0 : 1),
          totalVolume: s.totalVolume + setVol,
          activeExerciseName: p.exerciseName,
        }
        break
      }

      case 'SET_COMPLETED': {
        // Legacy thin event — only increments counter
        s = { ...s, totalSets: s.totalSets + ((ev.payload?.count as number) ?? 1) }
        break
      }

      case 'SET_CORRECTED': {
        const p = ev.payload as Partial<Record<string, unknown>>
        const targetId = p.targetEventId as string
        const name     = p.exerciseName as string
        s = {
          ...s,
          exercises: s.exercises.map(e => {
            if (e.name !== name) return e
            return {
              ...e,
              sets: e.sets.map(set => {
                if (set.id !== targetId) return set
                const newWeight   = typeof p.correctedWeight === 'number' ? p.correctedWeight : set.weight
                const newReps     = typeof p.correctedReps   === 'number' ? p.correctedReps   : set.reps
                const oldVol      = set.isBodyweight ? 0 : set.weight * set.reps
                const newVol      = set.isBodyweight ? 0 : newWeight * newReps
                const volDelta    = newVol - oldVol
                // Patch volume diff
                s = { ...s, totalVolume: s.totalVolume + volDelta }
                return {
                  ...set,
                  weight: newWeight,
                  reps: newReps,
                  rir: p.correctedRir !== undefined ? (p.correctedRir as number | null) : set.rir,
                  correctedBy: ev.id,
                }
              }),
            }
          }),
        }
        break
      }

      // ── Rest events ────────────────────────────────────────────────────────
      case 'REST_STARTED': {
        const dur = (ev.payload.duration as number) ?? 90
        s = {
          ...s,
          isRestActive: true,
          restDuration: dur,
          restEndAt: ev.timestamp + dur * 1000,
        }
        break
      }

      case 'REST_COMPLETED':
      case 'REST_SKIPPED': {
        s = { ...s, isRestActive: false, restDuration: 0, restEndAt: null }
        break
      }

      // ── Prediction events ──────────────────────────────────────────────────
      case 'PREDICTION_ACCEPTED': {
        const p = ev.payload as Partial<Record<string, unknown>>
        s = {
          ...s,
          lastPrediction: {
            exerciseName: p.exerciseName as string,
            weight: (p.predictedWeight as number) ?? null,
            reps: (p.predictedReps as number) ?? null,
            accepted: true,
          },
        }
        break
      }

      case 'PREDICTION_REJECTED': {
        const p = ev.payload as Partial<Record<string, unknown>>
        s = {
          ...s,
          lastPrediction: {
            exerciseName: p.exerciseName as string,
            weight: (p.actualWeight as number) ?? null,
            reps: (p.actualReps as number) ?? null,
            accepted: false,
          },
        }
        break
      }

      // ── Metadata events ────────────────────────────────────────────────────
      case 'CARDIO_PARAMS_UPDATED': {
        const p = ev.payload as Partial<Record<string, unknown>>
        s = {
          ...s,
          cardioSpeed:   (p.speed   as number) ?? s.cardioSpeed,
          cardioIncline: (p.incline as number) ?? s.cardioIncline,
          cardioLevel:   (p.level   as number) ?? s.cardioLevel,
        }
        break
      }

      case 'SESSION_NOTES_UPDATED': {
        s = { ...s, trainingNotes: (ev.payload.notes as string) ?? s.trainingNotes }
        break
      }
    }
  }

  // ── Compute live elapsed at snapshot time ──────────────────────────────────
  if (s.sessionPhase === 'active' && activeStartTs !== null) {
    s = {
      ...s,
      elapsedSec: s.elapsedSec + Math.floor((asOf - activeStartTs) / 1000),
    }
  }

  return s
}
