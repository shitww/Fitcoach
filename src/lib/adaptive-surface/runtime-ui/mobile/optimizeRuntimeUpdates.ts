// ── Optimize Runtime Updates ─────────────────────────────────────────────────
// Mobile-first update optimization: batched, throttled, lightweight.
// ─────────────────────────────────────────────────────────────────────────────

import type { MobileRuntimeConfig, LiveWorkoutRuntime } from '@/types/adaptive-surface';

export const DEFAULT_MOBILE_CONFIG: MobileRuntimeConfig = {
  predictionRefreshIntervalMs: 2000,
  maxQueuedUpdates: 10,
  batchedUpdateIntervalMs: 500,
  enablePredictivePreload: true,
  maxCardsInViewport: 3,
  reduceMotion: false,
};

export interface OptimizerState {
  lastPredictionUpdate: number;
  lastSurfaceUpdate: number;
  queuedUpdateTypes: string[];
  isThrottled: boolean;
}

/** Initialize optimizer state for a workout session. */
export function createOptimizerState(): OptimizerState {
  return {
    lastPredictionUpdate: 0,
    lastSurfaceUpdate: 0,
    queuedUpdateTypes: [],
    isThrottled: false,
  };
}

/** Determine if a prediction update should be processed now or deferred.
 *  Prevents UI jank by throttling rapid state changes.
 */
export function shouldProcessPredictionUpdate(
  state: OptimizerState,
  config: MobileRuntimeConfig = DEFAULT_MOBILE_CONFIG
): { shouldProcess: boolean; nextState: OptimizerState } {
  const now = Date.now();
  const timeSinceLast = now - state.lastPredictionUpdate;

  if (timeSinceLast >= config.predictionRefreshIntervalMs) {
    return {
      shouldProcess: true,
      nextState: {
        ...state,
        lastPredictionUpdate: now,
        queuedUpdateTypes: [],
      },
    };
  }

  // Queue for later
  return {
    shouldProcess: false,
    nextState: {
      ...state,
      queuedUpdateTypes: [...state.queuedUpdateTypes, 'prediction'],
    },
  };
}

/** Determine if a surface update should be processed now or deferred. */
export function shouldProcessSurfaceUpdate(
  state: OptimizerState,
  updateType: string,
  config: MobileRuntimeConfig = DEFAULT_MOBILE_CONFIG
): { shouldProcess: boolean; nextState: OptimizerState } {
  const now = Date.now();
  const timeSinceLast = now - state.lastSurfaceUpdate;

  // Critical updates always process immediately
  if (updateType === 'exercise_complete' || updateType === 'session_end') {
    return {
      shouldProcess: true,
      nextState: {
        ...state,
        lastSurfaceUpdate: now,
      },
    };
  }

  if (timeSinceLast >= config.batchedUpdateIntervalMs) {
    return {
      shouldProcess: true,
      nextState: {
        ...state,
        lastSurfaceUpdate: now,
        queuedUpdateTypes: [],
      },
    };
  }

  return {
    shouldProcess: false,
    nextState: {
      ...state,
      queuedUpdateTypes: [...state.queuedUpdateTypes, updateType],
    },
  };
}

/** Check if the runtime should preload next predictions.
 *  Used to reduce perceived latency when switching exercises.
 */
export function shouldPreloadPredictions(
  runtime: LiveWorkoutRuntime,
  config: MobileRuntimeConfig = DEFAULT_MOBILE_CONFIG
): boolean {
  if (!config.enablePredictivePreload) return false;

  // Preload when on the last set of the current exercise
  const isNearTransition =
    runtime.currentSetIndex >= 2 && runtime.phase === 'working';

  return isNearTransition && runtime.nextRefreshInMs <= 0;
}
