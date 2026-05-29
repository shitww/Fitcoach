import type { V2FatigueState } from './types';

export function createFatigueModel() {
  let byMuscle: Record<string, number> = {};

  function addFatigue(muscleGroup: string, weight: number, reps: number) {
    const added = weight * reps * 0.1;
    byMuscle[muscleGroup] = (byMuscle[muscleGroup] ?? 0) + added;
  }

  function decay(restTimeSec: number) {
    const decayAmount = restTimeSec * 0.05;
    for (const mg of Object.keys(byMuscle)) {
      byMuscle[mg] = Math.max(0, (byMuscle[mg] ?? 0) - decayAmount);
    }
  }

  function getState(): V2FatigueState {
    const total = Object.values(byMuscle).reduce((a, b) => a + b, 0);
    return { score: total, byMuscle: { ...byMuscle } };
  }

  function isHigh(muscleGroup: string): boolean {
    return (byMuscle[muscleGroup] ?? 0) > 50;
  }

  function reset() {
    byMuscle = {};
  }

  return { addFatigue, decay, getState, isHigh, reset };
}
