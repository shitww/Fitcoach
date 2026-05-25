// Epley 公式 1RM 估算（所有服务端分析的唯一权威实现）
export function calculate1RM(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
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
