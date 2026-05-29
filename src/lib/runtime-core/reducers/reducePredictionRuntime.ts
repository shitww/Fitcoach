// ── Reduce Prediction Runtime ─────────────────────────────────────────────────
// Derives next-set predictions from runtime snapshot.
// Prediction = system reads session + history → confident suggestion.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutRuntimeSnapshot, RuntimeExercise } from './reduceWorkoutRuntime'
import { getWorkingSets, getLastSet } from './reduceExerciseRuntime'

export interface SetPrediction {
  exerciseName: string
  weight: number | null
  reps: number | null
  isBodyweight: boolean
  source: 'session' | 'history' | 'none'
  confidence: 'high' | 'medium' | 'low'
  label: string
}

/** Derive next set prediction for the active exercise. */
export function derivePrediction(
  snapshot: WorkoutRuntimeSnapshot,
  historicalRecord: { weight: number; reps: number } | null
): SetPrediction | null {
  const { activeExerciseName, exercises } = snapshot
  if (!activeExerciseName) return null

  const exercise = exercises.find(e => e.name === activeExerciseName)
  if (!exercise) return null

  const lastSet = getLastSet(exercise)
  const workingSets = getWorkingSets(exercise)

  // Session-based prediction (highest confidence)
  if (lastSet) {
    const consistency = workingSets.length >= 2
      ? checkSetConsistency(workingSets)
      : 'medium'
    return {
      exerciseName: activeExerciseName,
      weight: lastSet.weight,
      reps: lastSet.reps,
      isBodyweight: lastSet.isBodyweight,
      source: 'session',
      confidence: consistency,
      label: buildPredictionLabel(lastSet.weight, lastSet.reps, lastSet.isBodyweight),
    }
  }

  // History-based prediction
  if (historicalRecord) {
    return {
      exerciseName: activeExerciseName,
      weight: historicalRecord.weight,
      reps: historicalRecord.reps,
      isBodyweight: exercise.isBodyweight,
      source: 'history',
      confidence: 'medium',
      label: buildPredictionLabel(historicalRecord.weight, historicalRecord.reps, exercise.isBodyweight),
    }
  }

  // No prediction available
  return {
    exerciseName: activeExerciseName,
    weight: null,
    reps: null,
    isBodyweight: exercise.isBodyweight,
    source: 'none',
    confidence: 'low',
    label: '首次训练',
  }
}

function buildPredictionLabel(
  weight: number | null,
  reps: number | null,
  isBodyweight: boolean
): string {
  if (isBodyweight && reps) return `自重 × ${reps}`
  if (weight && reps) return `${weight}kg × ${reps}`
  if (reps) return `× ${reps}`
  return '—'
}

function checkSetConsistency(
  sets: ReturnType<typeof getWorkingSets>
): 'high' | 'medium' | 'low' {
  if (sets.length < 2) return 'medium'
  const last  = sets[sets.length - 1]
  const prev  = sets[sets.length - 2]
  if (last.weight === prev.weight && last.reps === prev.reps) return 'high'
  const weightDiff = Math.abs(last.weight - prev.weight)
  if (weightDiff <= 5) return 'medium'
  return 'low'
}

/** Build progressive overload suggestion from history + current performance. */
export function buildProgressionSuggestion(
  exercise: RuntimeExercise,
  historicalBestWeight: number | null
): string | null {
  const working = getWorkingSets(exercise)
  if (working.length === 0) return null

  const latestWeight = working[working.length - 1].weight
  const latestReps   = working[working.length - 1].reps

  // All sets hit high reps with current weight — suggest increase
  if (latestReps >= 12 && latestWeight > 0) {
    const suggested = Math.round((latestWeight * 1.05) / 2.5) * 2.5
    return `建议下次尝试 ${suggested}kg`
  }

  if (historicalBestWeight && latestWeight > historicalBestWeight) {
    return `当前超越历史记录 +${latestWeight - historicalBestWeight}kg`
  }

  return null
}
