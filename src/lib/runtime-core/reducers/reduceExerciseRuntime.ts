// ── Reduce Exercise Runtime ───────────────────────────────────────────────────
// Pure helpers for per-exercise state derived from snapshot.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutRuntimeSnapshot, RuntimeExercise, RuntimeSet } from './reduceWorkoutRuntime'

/** Get the active exercise from a snapshot. */
export function getActiveExercise(snapshot: WorkoutRuntimeSnapshot): RuntimeExercise | null {
  if (!snapshot.activeExerciseName) return null
  return snapshot.exercises.find(e => e.name === snapshot.activeExerciseName) ?? null
}

/** Get completed working sets (non-warmup) for an exercise. */
export function getWorkingSets(exercise: RuntimeExercise): RuntimeSet[] {
  return exercise.sets.filter(s => !s.isWarmup)
}

/** Get warmup sets for an exercise. */
export function getWarmupSets(exercise: RuntimeExercise): RuntimeSet[] {
  return exercise.sets.filter(s => s.isWarmup)
}

/** Get the last completed set for an exercise (by timestamp). */
export function getLastSet(exercise: RuntimeExercise): RuntimeSet | null {
  const working = getWorkingSets(exercise)
  if (working.length === 0) return null
  return working[working.length - 1]
}

/** Determine if an exercise has met its target set count. */
export function isExerciseComplete(exercise: RuntimeExercise): boolean {
  return getWorkingSets(exercise).length >= exercise.targetSets
}

/** Get next set index for an exercise (0-indexed). */
export function getNextSetIndex(exercise: RuntimeExercise): number {
  return exercise.sets.length
}

/** Predict the next set values from exercise history. */
export function predictNextSetFromExercise(
  exercise: RuntimeExercise,
  historicalRecord: { weight: number; reps: number } | null,
  isBodyweight: boolean
): { weight: number | null; reps: number | null; source: 'session' | 'history' | 'none' } {
  const lastSet = getLastSet(exercise)
  if (lastSet) {
    return { weight: lastSet.weight, reps: lastSet.reps, source: 'session' }
  }
  if (historicalRecord && (historicalRecord.weight > 0 || isBodyweight)) {
    return { weight: historicalRecord.weight, reps: historicalRecord.reps, source: 'history' }
  }
  return { weight: null, reps: null, source: 'none' }
}

/** Compute total volume for an exercise across all working sets. */
export function computeExerciseVolume(exercise: RuntimeExercise): number {
  return getWorkingSets(exercise).reduce((sum, s) =>
    sum + (s.isBodyweight ? 0 : s.weight * s.reps), 0
  )
}

/** Derive exercise status for queue rail display. */
export function getExerciseStatus(
  exercise: RuntimeExercise,
  activeExerciseName: string | null,
  completedExerciseNames: string[]
): 'completed' | 'active' | 'upcoming' | 'skipped' {
  if (completedExerciseNames.includes(exercise.name)) return 'completed'
  if (exercise.name === activeExerciseName) return 'active'
  if (exercise.sets.length === 0) return 'upcoming'
  if (isExerciseComplete(exercise)) return 'completed'
  return 'upcoming'
}

/** Build exercise name list from snapshot for queue rail. */
export function buildExerciseQueueFromSnapshot(
  snapshot: WorkoutRuntimeSnapshot
): Array<{
  name: string
  status: 'completed' | 'active' | 'upcoming'
  setsLogged: number
  targetSets: number
}> {
  return snapshot.exerciseQueue.map(name => {
    const ex = snapshot.exercises.find(e => e.name === name)
    const working = ex ? getWorkingSets(ex) : []
    const isDone  = snapshot.completedExerciseNames.includes(name)
      || (ex ? isExerciseComplete(ex) : false)
    const isActive = name === snapshot.activeExerciseName

    return {
      name,
      status: isDone ? 'completed' : isActive ? 'active' : 'upcoming',
      setsLogged: working.length,
      targetSets: ex?.targetSets ?? 3,
    }
  })
}
