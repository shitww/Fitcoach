// ── Detect Runtime Phase ──────────────────────────────────────────────────────
// Infers the runtime phase from live session signals.
// Used for UI adaptation and motion triggers.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutRuntimePhase, WorkoutRuntimeState } from './buildWorkoutRuntimeState'

export interface PhaseSignals {
  isTrainingActive: boolean
  isPaused: boolean
  isRestActive: boolean
  restSecondsRemaining: number
  currentExercise: string | null
  totalSetsLogged: number
  sessionStartTime: number | null
  exerciseQueue: string[]
  completedExercises: string[]
}

/** Detect the current runtime phase from observable signals. */
export function detectRuntimePhase(signals: PhaseSignals): WorkoutRuntimePhase {
  const {
    isTrainingActive, isPaused, isRestActive,
    restSecondsRemaining, currentExercise,
    totalSetsLogged, sessionStartTime, exerciseQueue, completedExercises,
  } = signals

  if (!sessionStartTime && !isTrainingActive) return 'idle'
  if (isPaused) return 'paused'

  if (isRestActive && restSecondsRemaining > 0) return 'rest'

  if (!isTrainingActive && sessionStartTime) {
    // Was active, now done
    if (completedExercises.length > 0 || totalSetsLogged > 0) return 'completion'
    return 'idle'
  }

  if (isTrainingActive && !currentExercise) return 'pre_workout'

  if (isTrainingActive && currentExercise && totalSetsLogged === 0) {
    // First exercise selected but no sets yet
    return 'active_set'
  }

  if (isTrainingActive && currentExercise) return 'active_set'

  return 'idle'
}

/** Get phase-specific UI configuration. */
export function getPhaseConfig(phase: WorkoutRuntimePhase): {
  showHero: boolean
  showQueue: boolean
  showLogging: boolean
  showRest: boolean
  showCompletion: boolean
  dimBackground: boolean
  lockNavigation: boolean
} {
  const defaults = {
    showHero: false,
    showQueue: false,
    showLogging: false,
    showRest: false,
    showCompletion: false,
    dimBackground: false,
    lockNavigation: false,
  }

  switch (phase) {
    case 'pre_workout':
      return { ...defaults, showQueue: true }
    case 'warmup':
      return { ...defaults, showHero: true, showQueue: true }
    case 'active_set':
      return { ...defaults, showHero: true, showQueue: true, showLogging: true, lockNavigation: true }
    case 'rest':
      return { ...defaults, showHero: true, showQueue: true, showRest: true, lockNavigation: true }
    case 'transition':
      return { ...defaults, showHero: true, showQueue: true, lockNavigation: true }
    case 'completion':
      return { ...defaults, showCompletion: true, dimBackground: true }
    case 'reflection':
      return { ...defaults, showCompletion: true, dimBackground: true }
    case 'paused':
      return { ...defaults, showHero: true, lockNavigation: true }
    default:
      return defaults
  }
}

/** Whether the phase represents an active training state. */
export function isActivePhase(phase: WorkoutRuntimePhase): boolean {
  return ['active_set', 'rest', 'transition', 'warmup', 'paused'].includes(phase)
}

/** Whether the phase allows navigation away without warning. */
export function isExitSafe(phase: WorkoutRuntimePhase): boolean {
  return ['idle', 'reflection'].includes(phase)
}
