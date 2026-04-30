// Brzycki 公式计算 1RM
export function calculate1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  if (reps > 12) return weight; // 次数太多不准确
  return Math.round(weight * (36 / (37 - reps)) * 10) / 10;
}

// 计算单组训练量
export function calculateSetVolume(weight: number, reps: number): number {
  return weight * reps;
}

// 计算总训练量
export function calculateTotalVolume(sets: { weight: number; reps: number }[]): number {
  return sets.reduce((total, set) => total + calculateSetVolume(set.weight, set.reps), 0);
}

// RIR 转次数（估算力竭前的剩余次数）
export function rirToReps(rir: number | null, maxReps: number): number {
  if (rir === null) {
    return maxReps;
  }
  return Math.max(1, maxReps - rir);
}
