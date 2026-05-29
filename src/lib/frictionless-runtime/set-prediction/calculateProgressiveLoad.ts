// ── Calculate Progressive Load ────────────────────────────────────────────────
// Deterministic progressive overload calculation from historical performance.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CompletedSetRecord,
  ProgressionType,
} from '@/types/frictionless-runtime';

export interface ProgressiveLoadResult {
  targetWeight: number;
  targetReps: number;
  progressionType: ProgressionType;
  rationale: string;
  delta: { weightDelta: number; repsDelta: number; label: string };
}

export interface LoadCalculationInput {
  lastSessionSets: CompletedSetRecord[];
  currentSessionSets: CompletedSetRecord[];
  setNumber: number;
  workoutStyle: 'strength' | 'hypertrophy' | 'endurance' | 'mixed';
  fatigueEstimate: number; // 0-100
  volumeTrend: 'up' | 'down' | 'stable' | 'insufficient_data';
}

/** Smallest weight increment by exercise type. */
const WEIGHT_INCREMENTS = {
  barbell: 2.5,
  dumbbell: 2.0,
  machine: 5.0,
  bodyweight: 0,
  default: 2.5,
} as const;

/** Rep target ranges per workout style. */
const REP_TARGETS = {
  strength: { low: 3, high: 5 },
  hypertrophy: { low: 8, high: 12 },
  endurance: { low: 15, high: 20 },
  mixed: { low: 6, high: 10 },
} as const;

/** Calculate the optimal weight and reps for the next set.
 *  Deterministic: same inputs always produce same output.
 */
export function calculateProgressiveLoad(
  input: LoadCalculationInput
): ProgressiveLoadResult {
  const { lastSessionSets, currentSessionSets, setNumber, workoutStyle, fatigueEstimate } = input;

  // No history — return seed
  if (lastSessionSets.length === 0 && currentSessionSets.length === 0) {
    return seedResult(workoutStyle);
  }

  // In-session repeat (not first set)
  if (setNumber > 1 && currentSessionSets.length > 0) {
    return calculateIntraSessionLoad(currentSessionSets, setNumber, fatigueEstimate, workoutStyle);
  }

  // First set of exercise — base on last session
  if (lastSessionSets.length > 0) {
    return calculateInterSessionLoad(lastSessionSets, fatigueEstimate, input.volumeTrend, workoutStyle);
  }

  return seedResult(workoutStyle);
}

/** Calculate load for the first set based on last session. */
function calculateInterSessionLoad(
  lastSets: CompletedSetRecord[],
  fatigue: number,
  trend: string,
  style: LoadCalculationInput['workoutStyle']
): ProgressiveLoadResult {
  const representativeSet = lastSets.reduce((best, s) =>
    s.type === 'working' && s.weight > (best?.weight ?? 0) ? s : best,
    lastSets[0]
  );

  const { weight, reps, isFailure, rir } = representativeSet;

  // All reps completed cleanly + good RIR = increase weight
  const wasClean = !isFailure && (rir === null || rir >= 2);
  const trendUp = trend === 'up';

  if (wasClean && trendUp) {
    const increment = WEIGHT_INCREMENTS.default;
    const newWeight = roundToNearest(weight + increment, 0.5);
    return {
      targetWeight: newWeight,
      targetReps: reps,
      progressionType: 'progressive_overload',
      rationale: `Completed ${weight}kg×${reps} cleanly last session`,
      delta: {
        weightDelta: increment,
        repsDelta: 0,
        label: `+${increment}kg from last session`,
      },
    };
  }

  // Was clean but trend stable — try adding a rep
  if (wasClean && !trendUp) {
    const newReps = Math.min(reps + 1, REP_TARGETS[style].high);
    return {
      targetWeight: weight,
      targetReps: newReps,
      progressionType: 'progressive_overload',
      rationale: `Same weight, +1 rep (double progression)`,
      delta: {
        weightDelta: 0,
        repsDelta: newReps - reps,
        label: `+1 rep at ${weight}kg`,
      },
    };
  }

  // Failure last time — repeat same weight
  if (isFailure) {
    return {
      targetWeight: weight,
      targetReps: reps,
      progressionType: 'same_as_last',
      rationale: `Hit failure at ${weight}kg×${reps} — consolidate before progressing`,
      delta: { weightDelta: 0, repsDelta: 0, label: 'Same as last session' },
    };
  }

  // Fatigue-adjusted deload
  if (fatigue > 70) {
    const deload = roundToNearest(weight * 0.9, 0.5);
    return {
      targetWeight: deload,
      targetReps: reps,
      progressionType: 'deload',
      rationale: `High fatigue detected — 10% deload`,
      delta: { weightDelta: deload - weight, repsDelta: 0, label: '-10% (deload)' },
    };
  }

  // Default: same as last session
  return {
    targetWeight: weight,
    targetReps: reps,
    progressionType: 'same_as_last',
    rationale: `Repeat last session: ${weight}kg×${reps}`,
    delta: { weightDelta: 0, repsDelta: 0, label: 'Same as last session' },
  };
}

/** Calculate load for subsequent sets in the current session. */
function calculateIntraSessionLoad(
  sessionSets: CompletedSetRecord[],
  setNumber: number,
  fatigue: number,
  style: LoadCalculationInput['workoutStyle']
): ProgressiveLoadResult {
  const lastSet = sessionSets[sessionSets.length - 1];
  const { weight, reps, isFailure } = lastSet;

  // Previous set was a failure — drop set
  if (isFailure) {
    const dropWeight = roundToNearest(weight * 0.85, 0.5);
    return {
      targetWeight: dropWeight,
      targetReps: reps + 2,
      progressionType: 'drop_set',
      rationale: `Previous set hit failure — drop set at -15%`,
      delta: { weightDelta: dropWeight - weight, repsDelta: 2, label: 'Drop set (-15%)' },
    };
  }

  // Fatigue increases through session — slight rep reduction or same weight
  const fatigueAdj = fatigue > 60 ? -1 : 0;
  const adjustedReps = Math.max(reps + fatigueAdj, 1);

  return {
    targetWeight: weight,
    targetReps: adjustedReps,
    progressionType: fatigueAdj < 0 ? 'auto_regulation' : 'same_as_last',
    rationale: fatigueAdj < 0
      ? `Fatigue adjustment (${Math.round(fatigue)}/100) — -1 rep`
      : `Repeat ${weight}kg×${reps}`,
    delta: {
      weightDelta: 0,
      repsDelta: fatigueAdj,
      label: fatigueAdj < 0 ? '-1 rep (fatigue)' : 'Same as previous set',
    },
  };
}

/** Seed result when no history exists. */
function seedResult(style: LoadCalculationInput['workoutStyle']): ProgressiveLoadResult {
  const { low, high } = REP_TARGETS[style];
  const midReps = Math.round((low + high) / 2);

  return {
    targetWeight: 20, // starter weight
    targetReps: midReps,
    progressionType: 'first_set',
    rationale: `No history — starting with a light seed set`,
    delta: { weightDelta: 0, repsDelta: 0, label: 'First time — seed weight' },
  };
}

/** Round to nearest step (e.g. 0.5 kg). */
function roundToNearest(value: number, step: number): number {
  return Math.round(value / step) * step;
}
