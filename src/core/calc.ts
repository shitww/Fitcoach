// 1RM 计算
export function calculate1RM(weight: number, reps: number): number {
  return weight * (1 + reps / 30);
}

// Volume 计算
export function calculateVolume(weight: number, reps: number, sets: number): number {
  return weight * reps * sets;
}

// 判断是否 PR
export function isPersonalRecord(current1RM: number, previousBest: number): boolean {
  return current1RM > previousBest;
}
