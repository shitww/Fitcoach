import type { V2ScoreResult, V2FatigueState, V2SetResult, V2DecisionResult } from './types';

export function generateDecision(
  score: V2ScoreResult,
  fatigue: V2FatigueState,
  currentSet: V2SetResult,
  muscleGroup: string,
): V2DecisionResult {
  const fatigueScore = fatigue.byMuscle[muscleGroup] ?? 0;
  const isHighFatigue = fatigueScore > 50;

  let action: V2DecisionResult['action'];
  let nextWeight = currentSet.weight;
  let nextReps = currentSet.reps;
  let message = '';

  if (isHighFatigue) {
    action = 'decrease';
    if (!currentSet.isBodyweight && currentSet.weight > 0) {
      nextWeight = Math.round(currentSet.weight * 0.92 * 10) / 10;
    }
    nextReps = Math.max(1, currentSet.reps - 1);
    message = `疲劳累积 (${fatigueScore.toFixed(0)})，建议降重恢复`;
  } else if (score.score > 85) {
    action = 'increase';
    if (currentSet.isBodyweight) {
      nextReps = currentSet.reps + 2;
      message = '表现出色！增加次数';
    } else {
      nextWeight = Math.round((currentSet.weight + 2.5) * 10) / 10;
      message = `状态很好，建议加重至 ${nextWeight}kg`;
    }
  } else if (score.score >= 60) {
    action = 'maintain';
    message = '维持当前强度，专注动作质量';
  } else {
    action = 'decrease';
    if (!currentSet.isBodyweight && currentSet.weight > 0) {
      nextWeight = Math.round(currentSet.weight * 0.92 * 10) / 10;
    }
    nextReps = Math.max(1, currentSet.reps - 1);
    message = '完成质量偏低，适当降重调整';
  }

  return { action, nextWeight, nextReps, message };
}
