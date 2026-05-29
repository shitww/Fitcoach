// ── Update Queue Runtime ──────────────────────────────────────────────────────
// Mutations for the runtime queue: advance, reorder, insert, skip.
// ─────────────────────────────────────────────────────────────────────────────

import type { RuntimeQueueItem } from './buildRuntimeQueue'

/** Advance the queue to the next exercise. Returns updated names array. */
export function advanceQueue(
  exerciseNames: string[],
  currentExercise: string
): { next: string | null; updatedQueue: string[] } {
  const idx = exerciseNames.indexOf(currentExercise)
  if (idx === -1 || idx >= exerciseNames.length - 1) {
    return { next: null, updatedQueue: exerciseNames }
  }
  return { next: exerciseNames[idx + 1], updatedQueue: exerciseNames }
}

/** Insert a new exercise after the current position (adaptive insertion). */
export function insertExerciseAfterCurrent(
  exerciseNames: string[],
  currentExercise: string,
  newExercise: string
): string[] {
  const idx = exerciseNames.indexOf(currentExercise)
  const insertAt = idx === -1 ? exerciseNames.length : idx + 1
  const updated = [...exerciseNames]
  updated.splice(insertAt, 0, newExercise)
  return updated
}

/** Move an exercise earlier in the queue (adaptive reordering). */
export function prioritizeExercise(
  exerciseNames: string[],
  exerciseToMove: string,
  currentExercise: string
): string[] {
  const fromIdx = exerciseNames.indexOf(exerciseToMove)
  const currentIdx = exerciseNames.indexOf(currentExercise)
  if (fromIdx <= currentIdx + 1) return exerciseNames // already next

  const updated = exerciseNames.filter(n => n !== exerciseToMove)
  const insertAt = Math.min(currentIdx + 1, updated.length)
  updated.splice(insertAt, 0, exerciseToMove)
  return updated
}

/** Skip an exercise in the queue. */
export function skipExercise(
  exerciseNames: string[],
  toSkip: string
): string[] {
  return exerciseNames.filter(n => n !== toSkip)
}

/** Get the predicted set values for the next set of an exercise.
 *  Priority: last completed set of this session > historical record.
 */
export function predictNextSet(params: {
  completedSets: { weight: number; reps: number; isBodyweight: boolean }[]
  historicalRecord: { weight: number; reps: number } | null
  isBodyweight: boolean
}): { weight: number | null; reps: number | null; source: 'session' | 'history' | 'none' } {
  const { completedSets, historicalRecord, isBodyweight } = params

  if (completedSets.length > 0) {
    const last = completedSets[completedSets.length - 1]
    return { weight: last.weight, reps: last.reps, source: 'session' }
  }

  if (historicalRecord && (historicalRecord.weight > 0 || isBodyweight)) {
    return { weight: historicalRecord.weight, reps: historicalRecord.reps, source: 'history' }
  }

  return { weight: null, reps: null, source: 'none' }
}
