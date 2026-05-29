// ── Build Runtime Workout Flow ────────────────────────────────────────────────
// Assembles the live workout flow state that drives the in-session UI.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  LiveWorkoutRuntime,
  AdaptiveTrainingSurface,
  ExerciseQueueItem,
} from '@/types/adaptive-surface';
import type { PredictedExerciseCandidate } from '@/types/predictive-flow';

export interface BuildRuntimeFlowInput {
  workoutId: string;
  queue: readonly ExerciseQueueItem[];
  currentExerciseIndex: number;
  currentSetIndex: number;
  phase: 'warmup' | 'working' | 'finishing';
  nextPredictions: readonly PredictedExerciseCandidate[];
  trainingSurface: AdaptiveTrainingSurface;
}

/** Build the live runtime state for an active workout.
 *  Drives real-time UI updates without full re-renders.
 */
export function buildRuntimeWorkoutFlow(
  input: BuildRuntimeFlowInput
): LiveWorkoutRuntime {
  const {
    workoutId,
    queue,
    currentExerciseIndex,
    currentSetIndex,
    phase,
    nextPredictions,
    trainingSurface,
  } = input;

  const stale = nextPredictions.length === 0;

  return {
    workoutId,
    phase,
    currentExerciseIndex,
    currentSetIndex,
    predictionsStale: stale,
    nextRefreshInMs: 0, // updated by mobile optimizer
    pendingUpdates: [],
    surface: trainingSurface,
  };
}

/** Advance the runtime to the next exercise.
 *  Lightweight: mutates only what changed.
 */
export function advanceToNextExercise(
  runtime: LiveWorkoutRuntime
): LiveWorkoutRuntime {
  const nextIndex = runtime.currentExerciseIndex + 1;
  const totalExercises = runtime.surface.queue.length;

  let nextPhase = runtime.phase;
  if (nextIndex >= totalExercises) {
    nextPhase = 'finishing';
  } else if (runtime.phase === 'warmup') {
    nextPhase = 'working';
  }

  return {
    ...runtime,
    currentExerciseIndex: nextIndex,
    currentSetIndex: 0,
    phase: nextPhase,
    predictionsStale: true,
    pendingUpdates: [...runtime.pendingUpdates, 'next_exercise'],
  };
}

/** Complete the current set and update runtime state. */
export function advanceSet(
  runtime: LiveWorkoutRuntime,
  totalSetsForCurrent: number
): LiveWorkoutRuntime {
  const nextSet = runtime.currentSetIndex + 1;
  const isLastSet = nextSet >= totalSetsForCurrent;

  return {
    ...runtime,
    currentSetIndex: nextSet,
    predictionsStale: isLastSet, // re-predict only when moving to next exercise
    pendingUpdates: isLastSet
      ? [...runtime.pendingUpdates, 'set_complete_last']
      : [...runtime.pendingUpdates, 'set_complete'],
  };
}
