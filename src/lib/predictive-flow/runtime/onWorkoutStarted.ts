// ── On Workout Started ──────────────────────────────────────────────────────
// Initializes predictive state when a workout begins.
// ─────────────────────────────────────────────────────────────────────────────

import type { PredictiveRuntimeState, SuggestedExerciseQueue } from '@/types/predictive-flow';
import type { WorkoutSessionMemory } from '@/types/workout-memory';

/** Initialize predictive runtime state at workout start. */
export function onWorkoutStarted(
  workoutId: string,
  queue: SuggestedExerciseQueue | null
): PredictiveRuntimeState {
  return {
    workoutId,
    originalQueue: queue,
    currentQueue: queue ? [...queue.exercises] : [],
    completed: [],
    nextPredictions: [],
    remainingDurationEstimate: queue?.estimatedDurationMin ?? 45,
    remainingVolumeEstimate: queue?.estimatedTotalVolume ?? 0,
    lastUpdatedAt: new Date().toISOString(),
  };
}
