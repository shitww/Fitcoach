// ── Throttle Input Updates ────────────────────────────────────────────────────
// Limits prediction frequency to prevent UI jank during fast typing.
// ─────────────────────────────────────────────────────────────────────────────

import type { MobileInputConfig } from '@/types/frictionless-runtime';

export const DEFAULT_MOBILE_INPUT_CONFIG: MobileInputConfig = {
  intentPredictionThrottleMs: 150,   // max 1 prediction per 150ms
  autoFillConfidenceThreshold: 0.9,
  maxInlineSuggestions: 4,
  keyboardDismissOnLogMs: 200,       // dismiss keyboard 200ms after log
  batchPredictionWindowMs: 300,      // collect inputs for 300ms then batch
  enableHapticFeedback: true,
};

export interface ThrottleState {
  lastPredictionTs: number;
  lastSurfaceUpdateTs: number;
  pendingInputs: string[];
  isThrottled: boolean;
}

export function createThrottleState(): ThrottleState {
  return {
    lastPredictionTs: 0,
    lastSurfaceUpdateTs: 0,
    pendingInputs: [],
    isThrottled: false,
  };
}

/** Check whether to process a prediction or defer it.
 *  Pure function — no side effects.
 */
export function shouldThrottlePrediction(
  state: ThrottleState,
  nowMs: number,
  config: MobileInputConfig = DEFAULT_MOBILE_INPUT_CONFIG
): { shouldProcess: boolean; nextState: ThrottleState } {
  const elapsed = nowMs - state.lastPredictionTs;

  if (elapsed >= config.intentPredictionThrottleMs) {
    return {
      shouldProcess: true,
      nextState: {
        ...state,
        lastPredictionTs: nowMs,
        pendingInputs: [],
        isThrottled: false,
      },
    };
  }

  return {
    shouldProcess: false,
    nextState: {
      ...state,
      isThrottled: true,
    },
  };
}

/** Flush deferred inputs and determine the latest value to predict on. */
export function flushDeferredInputs(
  state: ThrottleState
): { latestInput: string | null; nextState: ThrottleState } {
  if (state.pendingInputs.length === 0) {
    return { latestInput: null, nextState: state };
  }

  const latestInput = state.pendingInputs[state.pendingInputs.length - 1];

  return {
    latestInput,
    nextState: {
      ...state,
      pendingInputs: [],
      isThrottled: false,
    },
  };
}

/** Add an input to the deferred queue. */
export function enqueueInput(
  state: ThrottleState,
  input: string
): ThrottleState {
  return {
    ...state,
    pendingInputs: [...state.pendingInputs, input],
  };
}
