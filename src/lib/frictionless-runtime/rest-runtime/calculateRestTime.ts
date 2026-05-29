// ── Calculate Rest Time ──────────────────────────────────────────────────────
// Smart rest time recommendation based on exercise + set context.
// ─────────────────────────────────────────────────────────────────────────────

import type { RestRecommendation, RestRecommendationBasis } from '@/types/frictionless-runtime';

export interface RestTimeInput {
  exerciseId: string;
  setNumber: number;
  weight: number;
  reps: number;
  rir: number | null;
  isFailure: boolean;
  isPR: boolean;
  workoutStyle: 'strength' | 'hypertrophy' | 'endurance' | 'mixed';
  fatigueEstimate: number; // 0-100
  muscleGroup: string;
  category: 'compound' | 'isolation' | 'cardio' | 'bodyweight';
}

/** Base rest times by training style (seconds). */
const BASE_REST: Record<string, { min: number; rec: number; max: number }> = {
  strength:    { min: 120, rec: 180, max: 300 }, // 2-5 min
  hypertrophy: { min: 60,  rec: 90,  max: 180 }, // 1-3 min
  endurance:   { min: 30,  rec: 45,  max: 90  }, // 30-90s
  mixed:       { min: 60,  rec: 120, max: 180 }, // 1-3 min
};

/** Calculate recommended rest time for the upcoming rest period.
 *  Returns explainable recommendation, not just a number.
 */
export function calculateRestTime(input: RestTimeInput): RestRecommendation {
  const {
    exerciseId,
    setNumber,
    weight,
    reps,
    rir,
    isFailure,
    isPR,
    workoutStyle,
    fatigueEstimate,
    muscleGroup,
    category,
  } = input;

  let { min, rec, max } = BASE_REST[workoutStyle] ?? BASE_REST.mixed;
  let basis: RestRecommendationBasis = workoutStyle as RestRecommendationBasis;

  // Compound movements need more rest
  if (category === 'compound') {
    rec = Math.round(rec * 1.2);
    max = Math.round(max * 1.2);
  }

  // Near failure or actual failure = more rest
  if (isFailure) {
    rec = Math.round(rec * 1.5);
    max = Math.round(max * 1.5);
    basis = 'near_failure';
  } else if (rir !== null && rir <= 1) {
    rec = Math.round(rec * 1.25);
    basis = 'near_failure';
  }

  // PR attempt — maximum rest for full recovery
  if (isPR) {
    rec = max;
    basis = 'pr_attempt';
  }

  // High fatigue — increase rest
  if (fatigueEstimate > 70) {
    rec = Math.round(rec * 1.2);
    basis = 'high_fatigue';
  }

  // Later sets in session may need slightly longer
  if (setNumber >= 4) {
    rec = Math.round(rec * 1.1);
  }

  // Clamp to range
  rec = Math.min(max, Math.max(min, rec));

  return {
    exerciseId,
    setNumber,
    recommendedSec: rec,
    minSec: min,
    maxSec: max,
    basis,
    label: formatRestLabel(rec),
    reasoning: buildReasoning(basis, rec, isFailure, category, fatigueEstimate),
  };
}

function formatRestLabel(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m} min` : `${m}:${s.toString().padStart(2, '0')}`;
}

function buildReasoning(
  basis: RestRecommendationBasis,
  rec: number,
  isFailure: boolean,
  category: string,
  fatigue: number
): string {
  const parts: string[] = [];

  if (basis === 'strength_training') parts.push('Strength training — full CNS recovery');
  if (basis === 'hypertrophy_training') parts.push('Hypertrophy — metabolic recovery');
  if (basis === 'near_failure') parts.push(isFailure ? 'Hit failure — extra recovery needed' : 'Near failure (low RIR)');
  if (basis === 'pr_attempt') parts.push('PR attempt — maximum recovery');
  if (basis === 'high_fatigue') parts.push(`High fatigue (${Math.round(fatigue)}/100)`);
  if (category === 'compound') parts.push('Compound lift');

  return parts.join(' · ') || `${formatRestLabel(rec)} rest recommended`;
}
