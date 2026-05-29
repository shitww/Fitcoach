// ── Detect Workout Dropoff ────────────────────────────────────────────────────
// Identifies when a user's session momentum has broken down.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutDropoffSignal } from '@/types/frictionless-runtime';

export interface DropoffDetectionInput {
  elapsedSinceLastActionSec: number;
  workoutStyle: 'strength' | 'hypertrophy' | 'endurance' | 'mixed';
  setsCompleted: number;
  expectedRestSec: number;
}

/** When elapsed time × multiplier exceeds threshold, flag dropoff. */
const DROPOFF_CONFIGS = {
  extended_rest: { multiplier: 2.0, minSets: 1 },
  long_gap: { multiplier: 3.5, minSets: 0 },
  session_end: { multiplier: 6.0, minSets: 0 },
} as const;

/** Detect whether a workout session has experienced a dropoff.
 *  Returns a typed signal that drives UI warnings and prompts.
 */
export function detectWorkoutDropoff(
  input: DropoffDetectionInput
): WorkoutDropoffSignal {
  const { elapsedSinceLastActionSec, workoutStyle, setsCompleted, expectedRestSec } = input;

  // Session end: 6× expected rest
  const sessionEndThreshold = expectedRestSec * DROPOFF_CONFIGS.session_end.multiplier;
  if (elapsedSinceLastActionSec >= sessionEndThreshold) {
    return {
      detected: true,
      type: 'session_end',
      elapsedSec: elapsedSinceLastActionSec,
      thresholdSec: sessionEndThreshold,
      confidence: 0.9,
      message: `${formatMin(elapsedSinceLastActionSec)} since last set — did you finish?`,
    };
  }

  // Long gap: 3.5× expected rest
  const longGapThreshold = expectedRestSec * DROPOFF_CONFIGS.long_gap.multiplier;
  if (elapsedSinceLastActionSec >= longGapThreshold) {
    return {
      detected: true,
      type: 'long_gap',
      elapsedSec: elapsedSinceLastActionSec,
      thresholdSec: longGapThreshold,
      confidence: 0.75,
      message: `Long pause detected — ready for the next set?`,
    };
  }

  // Extended rest: 2× expected rest
  const extendedRestThreshold = expectedRestSec * DROPOFF_CONFIGS.extended_rest.multiplier;
  if (
    elapsedSinceLastActionSec >= extendedRestThreshold &&
    setsCompleted >= DROPOFF_CONFIGS.extended_rest.minSets
  ) {
    return {
      detected: true,
      type: 'extended_rest',
      elapsedSec: elapsedSinceLastActionSec,
      thresholdSec: extendedRestThreshold,
      confidence: 0.6,
      message: `Rest is 2× usual — still going?`,
    };
  }

  return {
    detected: false,
    type: null,
    elapsedSec: elapsedSinceLastActionSec,
    thresholdSec: extendedRestThreshold,
    confidence: 0,
    message: '',
  };
}

function formatMin(sec: number): string {
  const m = Math.floor(sec / 60);
  return m >= 1 ? `${m} min` : `${Math.round(sec)}s`;
}
