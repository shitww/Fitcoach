// ── Transition Workout State ──────────────────────────────────────────────────
// Valid state machine transitions for the workout runtime.
// Enforces phase ordering and prevents illegal transitions.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutRuntimePhase, WorkoutRuntimeState } from './buildWorkoutRuntimeState'

type TransitionResult =
  | { ok: true; nextPhase: WorkoutRuntimePhase }
  | { ok: false; reason: string }

/** Legal phase transitions. */
const ALLOWED_TRANSITIONS: Record<WorkoutRuntimePhase, WorkoutRuntimePhase[]> = {
  idle:         ['pre_workout'],
  pre_workout:  ['warmup', 'active_set', 'idle'],
  warmup:       ['active_set', 'idle'],
  active_set:   ['rest', 'transition', 'completion', 'paused'],
  rest:         ['active_set', 'transition', 'paused'],
  transition:   ['active_set', 'completion', 'paused'],
  completion:   ['reflection', 'idle'],
  reflection:   ['idle'],
  paused:       ['active_set', 'rest', 'idle'],
}

/** Attempt a phase transition. Returns ok:true with next phase or ok:false with reason. */
export function transitionWorkoutState(
  current: WorkoutRuntimePhase,
  target: WorkoutRuntimePhase
): TransitionResult {
  const allowed = ALLOWED_TRANSITIONS[current]
  if (allowed.includes(target)) {
    return { ok: true, nextPhase: target }
  }
  return {
    ok: false,
    reason: `Illegal transition: ${current} → ${target}. Allowed: ${allowed.join(', ')}`,
  }
}

/** After logging a set, determine the correct next phase. */
export function getPhaseAfterSetLog(state: WorkoutRuntimeState): WorkoutRuntimePhase {
  const isLastExercise = state.exerciseIndex >= state.totalExercises - 1
  const nextExercise = state.exerciseQueue[state.exerciseIndex + 1]

  // If rest time > 0, go to rest phase
  if (state.restDuration > 0) return 'rest'

  // No rest configured — skip to transition or completion
  if (isLastExercise) return 'completion'
  if (nextExercise) return 'transition'

  return 'active_set'
}

/** After rest completes, determine the correct next phase. */
export function getPhaseAfterRest(state: WorkoutRuntimeState): WorkoutRuntimePhase {
  // Same exercise has more sets to do
  if (state.completedSetsThisExercise < state.targetSetsThisExercise) {
    return 'active_set'
  }
  // Move to next exercise
  const hasNextExercise = state.exerciseIndex < state.totalExercises - 1
  if (hasNextExercise) return 'transition'
  return 'completion'
}

/** Map store's legacy SessionPhase to RuntimePhase. */
export function mapLegacyPhase(
  phase: 'idle' | 'active' | 'paused' | 'done',
  restActive: boolean
): WorkoutRuntimePhase {
  if (phase === 'idle') return 'pre_workout'
  if (phase === 'active' && restActive) return 'rest'
  if (phase === 'active') return 'active_set'
  if (phase === 'paused') return 'paused'
  if (phase === 'done') return 'completion'
  return 'idle'
}
