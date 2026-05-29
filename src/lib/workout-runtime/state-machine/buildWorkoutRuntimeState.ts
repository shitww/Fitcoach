// ── Build Workout Runtime State ────────────────────────────────────────────────
// Formal state machine for the complete workout lifecycle.
// Replaces ad-hoc sessionPhase with rich runtime state.
// ─────────────────────────────────────────────────────────────────────────────

export type WorkoutRuntimePhase =
  | 'idle'          // App opened, no session started
  | 'pre_workout'   // Session initializing, exercise selection
  | 'warmup'        // Warmup phase (before first working set)
  | 'active_set'    // User is performing a set RIGHT NOW
  | 'rest'          // Between sets — rest timer running
  | 'transition'    // Moving between exercises
  | 'completion'    // All sets done, workout finishing
  | 'reflection'    // Post-workout narrative surface
  | 'paused'        // Session paused (lock screen, break)

export interface RuntimeSetContext {
  exerciseName: string
  setNumber: number             // 1-indexed
  predictedWeight: number | null
  predictedReps: number | null
  lastWeight: number | null
  lastReps: number | null
  isBodyweight: boolean
  restSeconds: number
}

export interface WorkoutRuntimeState {
  phase: WorkoutRuntimePhase
  sessionId: string | null
  sessionStartTime: number | null
  totalElapsedSec: number

  // Current exercise focus
  currentExercise: string | null
  exerciseIndex: number          // 0-indexed position in queue
  totalExercises: number
  completedSetsThisExercise: number
  targetSetsThisExercise: number

  // Active set context
  currentSet: RuntimeSetContext | null

  // Rest state
  restSecondsRemaining: number
  restDuration: number

  // Queue
  exerciseQueue: string[]        // ordered names
  completedExercises: string[]

  // Session stats (live)
  totalSetsLogged: number
  totalVolume: number
  prCount: number

  // Runtime feel metadata
  momentum: 'rising' | 'consistent' | 'fading'
  sessionEnergy: 'high' | 'normal' | 'low'
}

/** Build the initial idle state. */
export function buildIdleRuntimeState(): WorkoutRuntimeState {
  return {
    phase: 'idle',
    sessionId: null,
    sessionStartTime: null,
    totalElapsedSec: 0,
    currentExercise: null,
    exerciseIndex: 0,
    totalExercises: 0,
    completedSetsThisExercise: 0,
    targetSetsThisExercise: 3,
    currentSet: null,
    restSecondsRemaining: 0,
    restDuration: 0,
    exerciseQueue: [],
    completedExercises: [],
    totalSetsLogged: 0,
    totalVolume: 0,
    prCount: 0,
    momentum: 'consistent',
    sessionEnergy: 'normal',
  }
}

/** Build a runtime state snapshot from live session data. */
export function buildWorkoutRuntimeState(params: {
  phase: WorkoutRuntimePhase
  sessionId: string | null
  sessionStartTime: number | null
  currentExercise: string | null
  exerciseQueue: string[]
  completedExercises: string[]
  completedSetsThisExercise: number
  targetSetsThisExercise: number
  currentSet: RuntimeSetContext | null
  restSecondsRemaining: number
  restDuration: number
  totalSetsLogged: number
  totalVolume: number
  prCount: number
}): WorkoutRuntimeState {
  const elapsed = params.sessionStartTime
    ? Math.floor((Date.now() - params.sessionStartTime) / 1000)
    : 0

  const exerciseIndex = params.currentExercise
    ? params.exerciseQueue.indexOf(params.currentExercise)
    : 0

  // Derive momentum from set pace
  const sessionDurationMin = elapsed / 60
  const setsPerMin = sessionDurationMin > 0
    ? params.totalSetsLogged / sessionDurationMin
    : 0

  const momentum: WorkoutRuntimeState['momentum'] =
    setsPerMin >= 0.8 ? 'rising' :
    setsPerMin >= 0.4 ? 'consistent' : 'fading'

  const sessionEnergy: WorkoutRuntimeState['sessionEnergy'] =
    elapsed < 1200 ? 'high' :          // first 20 min
    elapsed < 2700 ? 'normal' :        // 20–45 min
    'low'                               // >45 min

  return {
    ...params,
    totalElapsedSec: elapsed,
    exerciseIndex: Math.max(0, exerciseIndex),
    totalExercises: params.exerciseQueue.length,
    momentum,
    sessionEnergy,
  }
}
