// ── FitCoach V2 — Recovery Awareness Engine ───────────────────────────────
// Short, contextual recovery suggestions based on training signals + body metrics.
// No long-form text. No medical advice.

import type {
  UserTrainingContext,
  RecoverySuggestion,
  BodyWeightTrend,
} from './trainingTypes';

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Generate recovery suggestions based on user training context.
 * Returns 0–2 suggestions max. Short and actionable.
 */
export function getRecoverySuggestions(
  context: UserTrainingContext
): RecoverySuggestion[] {
  const out: RecoverySuggestion[] = [];

  // 1. Streak-based
  if (context.currentStreak >= 6) {
    out.push({
      text: `连续 ${context.currentStreak} 天训练，建议安排恢复日`,
      priority: 'recommend',
      reason: '高频连续训练，主动恢复有助于长期进步',
    });
  } else if (context.currentStreak === 5) {
    out.push({
      text: '明天可以考虑安排恢复日',
      priority: 'suggest',
      reason: '即将进入高疲劳区间',
    });
  }

  // 2. Days since last workout
  if (context.daysSinceLastWorkout >= 3 && context.currentStreak === 0) {
    out.push({
      text:
        context.daysSinceLastWorkout >= 5
          ? '休息较久，今日从轻重量开始重新适应'
          : '休息充足，今天适合正常训练',
      priority: 'info',
      reason: '恢复时间评估',
    });
  }

  // 3. Body weight trend
  if (context.bodyWeightTrend) {
    const trend = context.bodyWeightTrend;
    if (trend.changeKg < -1.0) {
      out.push({
        text: '近期体重下降较快，注意摄入与恢复',
        priority: 'suggest',
        reason: `7天平均下降 ${Math.abs(trend.changeKg).toFixed(1)}kg，可能热量缺口过大`,
      });
    } else if (trend.changeKg > 1.0) {
      out.push({
        text: '体重上升较快，确认热量目标是否匹配当前计划',
        priority: 'info',
        reason: `7天平均上升 ${trend.changeKg.toFixed(1)}kg`,
      });
    }
  }

  // Cap at 2 most important
  return out
    .sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority))
    .slice(0, 2);
}

/**
 * Single-sentence recovery status for workout header / completion card.
 */
export function getRecoveryStatusLine(context: UserTrainingContext): string | null {
  if (context.currentStreak >= 6) {
    return `连续 ${context.currentStreak} 天 — 明天休息`;
  }
  if (context.daysSinceLastWorkout >= 4 && context.currentStreak === 0) {
    return `休息 ${context.daysSinceLastWorkout} 天，从轻开始`;
  }
  if (context.daysSinceLastWorkout === 0 && context.currentStreak >= 3) {
    return `第 ${context.currentStreak} 天 — 注意恢复质量`;
  }
  return null;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function priorityRank(p: RecoverySuggestion['priority']): number {
  switch (p) {
    case 'recommend':
      return 3;
    case 'suggest':
      return 2;
    case 'info':
      return 1;
  }
}
