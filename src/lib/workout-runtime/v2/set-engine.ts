import type { V2SetResult } from './types';

export function computeSetResult(params: {
  weight: number;
  reps: number;
  rir: number | null;
  isBodyweight: boolean;
}): V2SetResult {
  const volume = params.isBodyweight ? 0 : params.weight * params.reps;
  return {
    reps: params.reps,
    weight: params.weight,
    volume,
    rir: params.rir,
    isBodyweight: params.isBodyweight,
    timestamp: Date.now(),
  };
}
