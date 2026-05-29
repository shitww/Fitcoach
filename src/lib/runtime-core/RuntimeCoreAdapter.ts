// ── Runtime Core Adapter ──────────────────────────────────────────────────────
// Bridges the event-sourced runtime-core snapshot into legacy Zustand stores.
//
// Legacy stores (workoutTimer, workoutSession) remain as THIN READ SURFACES.
// They are synced FROM runtime-core, not FROM UI mutations.
//
// This adapter is mounted once at the app level and subscribes to
// runtime-core state changes.
//
// Migration path:
//   Phase 9:  runtime-core emits events → adapter syncs legacy stores
//   Phase 10: legacy stores removed, UI reads runtime-core directly
// ─────────────────────────────────────────────────────────────────────────────

'use client'

import { useEffect, useRef } from 'react'
import { useRuntimeCore } from './useRuntimeCore'
import { useWorkoutTimer } from '@/stores/workoutTimer'
import { useWorkoutSession } from '@/stores/workoutSession'
import type { WorkoutRuntimeSnapshot } from './reducers/reduceWorkoutRuntime'

/** Mount this once at the app shell level. Keeps legacy stores in sync. */
export function useRuntimeCoreAdapter(): void {
  const snapshot   = useRuntimeCore(s => s.snapshot)
  const prevRef    = useRef<WorkoutRuntimeSnapshot | null>(null)

  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = snapshot

    if (snapshot === prev) return

    // ── Sync workoutTimer from snapshot ──────────────────────────────────────
    const timerPhase: 'idle' | 'active' | 'paused' | 'done' =
      snapshot.sessionPhase === 'active' ? 'active' :
      snapshot.sessionPhase === 'paused' ? 'paused' :
      snapshot.sessionPhase === 'done'   ? 'done'   : 'idle'

    useWorkoutTimer.setState({
      sessionPhase:     timerPhase,
      isTrainingActive: snapshot.sessionPhase === 'active',
      isPaused:         snapshot.sessionPhase === 'paused',
      isRestActive:     snapshot.isRestActive,
      currentExercise:  snapshot.activeExerciseName,
      totalSets:        snapshot.totalSets,
      sessionType:      snapshot.sessionType,
      isCardioSession:  snapshot.sessionType === 'cardio',
      isFreeSession:    snapshot.sessionType === 'free',
      cardioSpeed:      snapshot.cardioSpeed,
      cardioIncline:    snapshot.cardioIncline,
      cardioLevel:      snapshot.cardioLevel,
      sessionId:        snapshot.sessionId,
      ...(snapshot.restEndAt ? {
        restTimer: {
          phase: 'running' as const,
          duration: snapshot.restDuration,
          endAt: snapshot.restEndAt,
        },
      } : {
        restTimer: { phase: 'idle' as const, duration: 0, endAt: null },
      }),
      ...(snapshot.startTime ? {
        trainingStartTime: snapshot.startTime,
        trainingDuration: snapshot.elapsedSec,
      } : {}),
    })

    // ── Sync workoutSession from snapshot ─────────────────────────────────────
    if (snapshot.exercises.length > 0 || prev?.exercises.length !== 0) {
      useWorkoutSession.setState({
        exercises: snapshot.exercises.map(ex => ({
          id:          `rc-${ex.name}`,
          name:        ex.name,
          sets:        ex.sets.map(s => ({
            id:           s.id,
            weight:       s.weight,
            reps:         s.reps,
            rir:          s.rir,
            isBodyweight: s.isBodyweight,
            isFailure:    s.isFailure,
            estimated1RM: s.estimated1RM,
            completed:    true,
            isWarmup:     s.isWarmup,
            createdAt:    s.timestamp,
          })),
          restTime:    ex.restTime,
          totalVolume: ex.totalVolume,
          startedAt:   ex.startedAt
            ? new Date(ex.startedAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
            : undefined,
        })),
        activeExerciseName: snapshot.activeExerciseName ?? '',
        trainingNotes:      snapshot.trainingNotes,
      })
    }
  }, [snapshot])
}

/** Hook to dispatch a SET_LOGGED event via runtime-core from legacy UI. */
export function useDispatchSetLogged() {
  const dispatch = useRuntimeCore(s => s.dispatch)
  return (params: {
    exerciseName: string
    setIndex: number
    weight: number
    reps: number
    rir: number | null
    isBodyweight: boolean
    isWarmup: boolean
    estimated1RM: number
    predictionSource?: 'session' | 'history' | 'none'
  }) => {
    dispatch('SET_LOGGED', {
      ...params,
      isFailure: params.rir === 0,
      predictionSource: params.predictionSource ?? 'none',
    })
  }
}

/** Hook to dispatch an EXERCISE_ADDED event via runtime-core. */
export function useDispatchExerciseAdded() {
  const dispatch = useRuntimeCore(s => s.dispatch)
  return (name: string, targetSets = 3, restTime = 90, isBodyweight = false) => {
    dispatch('EXERCISE_ADDED', { name, targetSets, restTime, isBodyweight })
  }
}
