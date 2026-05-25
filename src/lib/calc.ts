/** Shared calculation utilities */

interface SetLike {
  weight: number;
  reps: number;
}

/**
 * Epley formula: estimated 1-Rep Max
 * 1RM = weight × (1 + reps / 30)
 * Returns weight directly when reps === 1.
 */
export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (1 + reps / 30) * 10) / 10;
}

/**
 * Total volume for an array of sets: Σ(weight × reps)
 */
export function calculateTotalVolume(sets: SetLike[]): number {
  return sets.reduce((sum, s) => sum + s.weight * s.reps, 0);
}
