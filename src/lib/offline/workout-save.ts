// ─── Offline-First Workout Save ────────────────────────────────────────────
// Unified entry point for persisting workouts locally.
// All finish functions call this instead of posting directly to /api/workout.
//
// Flow:
//   1. Build OfflineWorkout + OfflineWorkoutSet records
//   2. Write to IndexedDB
//   3. Enqueue CREATE_WORKOUT sync operation
//   4. (Optional) Immediate sync attempt if online
//   5. Return localId immediately — UI never blocks

import {
  saveWorkoutLocal,
  saveSetsLocal,
  enqueueOperation,
} from './helpers'
import { forceSync } from './sync-engine'

export interface SaveWorkoutInput {
  userId: string
  date?: string // defaults to today
  durationSec: number
  totalVolume?: number
  notes?: string | null
  type: 'strength' | 'cardio' | 'recovery' | 'free'
  exercises: Array<{
    name: string
    muscleGroup?: string
    sets: Array<{
      weight: number
      reps: number
      rir: number | null
      isWarmup?: boolean
      isCardio?: boolean
      isFailure?: boolean
      restTime?: number
    }>
  }>
}

/**
 * Save workout to local IndexedDB and queue for server sync.
 * Returns local workout ID immediately — never blocks on network.
 */
export async function saveWorkoutOffline(input: SaveWorkoutInput): Promise<string> {
  const today = input.date ?? new Date().toISOString().split('T')[0]

  // 1. Save workout header
  const workoutId = await saveWorkoutLocal({
    userId: input.userId,
    date: today,
    durationSec: input.durationSec,
    totalVolume: input.totalVolume ?? 0,
    notes: input.notes ?? null,
    type: input.type,
  })

  // 2. Save sets
  const setRecords: Array<Omit<Parameters<typeof saveSetsLocal>[1][number], 'syncStatus' | 'createdAt' | 'id' | 'workoutId'>> = []
  for (const ex of input.exercises) {
    let setNumber = 1
    for (const s of ex.sets) {
      setRecords.push({
        exerciseName: ex.name,
        exerciseId: undefined,
        muscleGroup: ex.muscleGroup ?? '',
        weight: s.weight,
        reps: s.reps,
        rir: s.rir ?? 0,
        setNumber: setNumber++,
        type: s.isWarmup ? 'W' : s.isCardio ? 'C' : 'S',
        isFailure: s.isFailure ?? false,
        isPR: false,
      })
    }
  }

  if (setRecords.length > 0) {
    await saveSetsLocal(workoutId, setRecords)
  }

  // 3. Enqueue sync
  await enqueueOperation('CREATE_WORKOUT', workoutId, {
    userId: input.userId,
    date: today,
    durationSec: input.durationSec,
    totalVolume: input.totalVolume ?? 0,
    notes: input.notes,
    type: input.type,
    exercises: input.exercises,
  })

  // 4. Fire-and-forget immediate sync if online
  void forceSync()

  return workoutId
}

/** Convenience: build the standard exercise payload from UI's Exercise[] array. */
export function buildExercisePayload(
  exercises: Array<{
    name: string
    sets: Array<{
      weight: number
      reps: number
      rir: number | null
      isFailure?: boolean
      isBodyweight?: boolean
    }>
    restTime?: number
    totalVolume?: number
  }>,
  muscleGroupResolver: (name: string) => string,
): SaveWorkoutInput['exercises'] {
  return exercises
    .filter((e) => e.sets.length > 0)
    .map((e) => ({
      name: e.name,
      muscleGroup: muscleGroupResolver(e.name),
      sets: e.sets.map((s) => ({
        weight: s.weight,
        reps: s.reps,
        rir: s.rir,
        isWarmup: false,
        isCardio: false,
        isFailure: s.isFailure ?? false,
        restTime: e.restTime ?? 120,
      })),
    }))
}
