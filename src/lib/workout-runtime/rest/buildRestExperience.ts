// ── Build Rest Experience ─────────────────────────────────────────────────────
// Transforms rest from "waiting" to runtime continuation.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutRuntimeState } from '../state-machine/buildWorkoutRuntimeState'

export interface RestExperience {
  secondsRemaining: number
  totalDuration: number
  /** The next set predicted values */
  nextSetPrediction: {
    weight: number | null
    reps: number | null
    label: string
  }
  /** Current exercise context */
  currentExerciseName: string
  /** Recovery readiness signal */
  readinessLevel: 'resting' | 'recovering' | 'ready'
  /** Contextual hint during rest */
  hintText: string | null
  /** Next exercise hint */
  nextExerciseHint: string | null
  /** Whether to show "skip rest" CTA */
  allowSkip: boolean
}

/** Build the full rest experience surface. */
export function buildRestExperience(
  state: WorkoutRuntimeState,
  nextSetWeight: number | null,
  nextSetReps: number | null
): RestExperience {
  const { restSecondsRemaining, restDuration, currentExercise, exerciseQueue, exerciseIndex } = state
  const pct = restDuration > 0 ? restSecondsRemaining / restDuration : 0

  const readinessLevel: RestExperience['readinessLevel'] =
    restSecondsRemaining <= 0 ? 'ready' :
    pct <= 0.3 ? 'recovering' :
    'resting'

  const nextExercise = exerciseQueue[exerciseIndex + 1] ?? null
  const isLastSetsPhase = state.completedSetsThisExercise >= state.targetSetsThisExercise

  const hintText = buildHintText(state, pct)
  const nextSetLabel = buildNextSetLabel(nextSetWeight, nextSetReps, isLastSetsPhase, nextExercise)

  return {
    secondsRemaining: restSecondsRemaining,
    totalDuration: restDuration,
    nextSetPrediction: {
      weight: nextSetWeight,
      reps: nextSetReps,
      label: nextSetLabel,
    },
    currentExerciseName: currentExercise ?? '',
    readinessLevel,
    hintText,
    nextExerciseHint: isLastSetsPhase && nextExercise
      ? `下一个动作：${nextExercise.split(' (')[0]}`
      : null,
    allowSkip: restSecondsRemaining > 5,
  }
}

function buildHintText(
  state: WorkoutRuntimeState,
  pct: number
): string | null {
  if (state.sessionEnergy === 'low' && pct > 0.5) {
    return '深呼吸，充分恢复'
  }
  if (state.momentum === 'rising' && pct < 0.3) {
    return '节奏很好，准备下一组'
  }
  if (state.completedSetsThisExercise >= 3) {
    return '优秀的坚持，保持节奏'
  }
  return null
}

function buildNextSetLabel(
  weight: number | null,
  reps: number | null,
  isLastSet: boolean,
  nextExercise: string | null
): string {
  if (isLastSet) {
    if (nextExercise) return `准备切换：${nextExercise.split(' (')[0]}`
    return '准备完成训练'
  }
  if (weight && reps) return `预计下一组：${weight}kg × ${reps}`
  if (reps) return `预计下一组：× ${reps}`
  return '准备下一组'
}
