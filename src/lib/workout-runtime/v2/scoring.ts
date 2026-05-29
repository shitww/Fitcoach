import type { V2SetResult, V2ScoreResult } from './types';

export function computeScore(
  set: V2SetResult,
  previousSet: V2SetResult | null,
  targetReps: number,
): V2ScoreResult {
  const repsEfficiency = targetReps > 0 ? set.reps / targetReps : 1;

  let weightProgression = 1;
  if (previousSet && previousSet.weight > 0 && set.weight > 0) {
    weightProgression = set.weight / previousSet.weight;
  }

  const cappedReps = Math.min(repsEfficiency, 1.2);
  const cappedWeight = Math.min(weightProgression, 1.2);

  const rawScore = (cappedReps * 0.5 + cappedWeight * 0.5) * 100;
  const score = Math.min(100, Math.max(0, Math.round(rawScore)));

  return { score, repsEfficiency, weightProgression };
}
