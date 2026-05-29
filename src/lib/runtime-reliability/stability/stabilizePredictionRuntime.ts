// ── Stabilize Prediction Runtime ──────────────────────────────────────────────
// Controls when predictions are recomputed — prevents thrashing.
// ─────────────────────────────────────────────────────────────────────────────

import type { StabilityConfig } from '@/types/runtime-reliability';

const DEFAULT_CONFIG: StabilityConfig = {
  maxUpdatesPerSecond: 10,
  criticalUpdateImmediateMs: 0,
  normalUpdateBatchMs: 50,
  lowPriorityDeferMs: 200,
  maxPendingUpdates: 50,
  enableDependencyIsolation: true,
};

export interface PredictionStabilityState {
  lastPredictionAt: string | null;
  predictionCount: number;
  throttledCount: number;
  currentSessionId: string | null;
  isStable: boolean;
}

/** Create initial stability state. */
export function createStabilityState(): PredictionStabilityState {
  return {
    lastPredictionAt: null,
    predictionCount: 0,
    throttledCount: 0,
    currentSessionId: null,
    isStable: true,
  };
}

/** Determine if a new prediction should be computed or deferred.
 *  Pure function — no side effects.
 */
export function shouldRecomputePrediction(
  state: PredictionStabilityState,
  trigger: 'set_logged' | 'weight_changed' | 'rest_ended' | 'exercise_changed' | 'manual',
  nowMs: number,
  config: Partial<StabilityConfig> = {}
): { shouldRecompute: boolean; deferMs: number; reason: string } {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  // Always recompute on exercise change or manual trigger
  if (trigger === 'exercise_changed' || trigger === 'manual') {
    return { shouldRecompute: true, deferMs: 0, reason: `Immediate recompute: ${trigger}` };
  }

  if (!state.lastPredictionAt) {
    return { shouldRecompute: true, deferMs: 0, reason: 'First prediction' };
  }

  const msSinceLast = nowMs - new Date(state.lastPredictionAt).getTime();

  // Throttle if we've recomputed very recently
  if (msSinceLast < cfg.normalUpdateBatchMs) {
    return {
      shouldRecompute: false,
      deferMs: cfg.normalUpdateBatchMs - msSinceLast,
      reason: `Throttled: ${Math.round(msSinceLast)}ms since last (min: ${cfg.normalUpdateBatchMs}ms)`,
    };
  }

  // Defer low-significance triggers if already stable
  if (trigger === 'weight_changed' && state.isStable && msSinceLast < cfg.lowPriorityDeferMs) {
    return {
      shouldRecompute: false,
      deferMs: cfg.lowPriorityDeferMs - msSinceLast,
      reason: 'Deferred: weight change while stable',
    };
  }

  return { shouldRecompute: true, deferMs: 0, reason: `Recompute: ${trigger}` };
}

/** Record that a prediction was computed. */
export function recordPredictionComputed(
  state: PredictionStabilityState,
  sessionId: string
): PredictionStabilityState {
  return {
    ...state,
    lastPredictionAt: new Date().toISOString(),
    predictionCount: state.predictionCount + 1,
    currentSessionId: sessionId,
    isStable: true,
  };
}

/** Record that a prediction was throttled/skipped. */
export function recordPredictionThrottled(
  state: PredictionStabilityState
): PredictionStabilityState {
  return {
    ...state,
    throttledCount: state.throttledCount + 1,
  };
}

/** Get the throttle efficiency ratio (how many predictions were avoided). */
export function getThrottleEfficiency(state: PredictionStabilityState): number {
  const total = state.predictionCount + state.throttledCount;
  if (total === 0) return 0;
  return Math.round((state.throttledCount / total) * 100) / 100;
}
