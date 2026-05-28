// ── FitCoach V2 — Contextual Training Suggestions Engine ──────────────────
// Generates short, non-intrusive inline tips during an active workout.
// No chat. No loading. Deterministic.

import type {
  ExerciseHistory,
  LiveExerciseContext,
  ContextualTip,
  UserTrainingContext,
} from './trainingTypes';
import {
  liveVolume,
  liveMaxWeight,
  liveRepsDeclining,
  liveHasFailure,
  estimate1RM,
  bestEstimated1RM,
} from './trainingSignals';

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Generate contextual tips for the current exercise in the active workout.
 * Returns 0–2 tips max. Designed for inline display (small card / pill).
 */
export function getContextualTips(
  ctx: LiveExerciseContext,
  history: ExerciseHistory | null,
  userContext: UserTrainingContext
): ContextualTip[] {
  const tips: ContextualTip[] = [];

  if (ctx.completedSets.length === 0) return tips;

  // 1. Approaching PR
  if (history) {
    const prTip = checkApproachingPR(ctx, history);
    if (prTip) tips.push(prTip);
  }

  // 2. Reps declining within today's session
  if (liveRepsDeclining(ctx)) {
    tips.push({
      text: '本组次数下降，注意控制离心节奏',
      trigger: 'reps_declining',
      urgency: 'notice',
    });
  }

  // 3. High volume already logged
  if (history) {
    const volTip = checkVolumeHigh(ctx, history);
    if (volTip) tips.push(volTip);
  }

  // 4. Failure on last set
  if (liveHasFailure(ctx)) {
    const lastSet = ctx.completedSets[ctx.completedSets.length - 1];
    tips.push({
      text: `上组力竭 (${lastSet.weight}kg × ${lastSet.reps})，充分休息后再开始`,
      trigger: 'failure_logged',
      urgency: 'subtle',
    });
  }

  // 5. Short rest suspicion (if rest times provided)
  if (ctx.restTimesSec && ctx.restTimesSec.length > 0) {
    const avgRest =
      ctx.restTimesSec.reduce((a, b) => a + b, 0) / ctx.restTimesSec.length;
    if (avgRest < 45 && liveMaxWeight(ctx) >= 40) {
      tips.push({
        text: '组间休息偏短，大重量建议延长至 90–120 秒',
        trigger: 'rest_time_short',
        urgency: 'subtle',
      });
    }
  }

  // 6. Systemic fatigue warning
  if (userContext.currentStreak >= 5) {
    tips.push({
      text: `连续 ${userContext.currentStreak} 天训练 — 降低预期，注重动作质量`,
      trigger: 'high_streak',
      urgency: 'notice',
    });
  }

  // Deduplicate and cap
  const seen = new Set<string>();
  return tips
    .filter((t) => {
      if (seen.has(t.trigger)) return false;
      seen.add(t.trigger);
      return true;
    })
    .sort((a, b) => urgencyRank(b.urgency) - urgencyRank(a.urgency))
    .slice(0, 2);
}

// ── Internal Checks ────────────────────────────────────────────────────────

function checkApproachingPR(
  ctx: LiveExerciseContext,
  history: ExerciseHistory
): ContextualTip | null {
  const best1RM = bestEstimated1RM(history);
  if (best1RM <= 0) return null;

  const lastSet = ctx.completedSets[ctx.completedSets.length - 1];
  const current1RM = estimate1RM(lastSet.weight, lastSet.reps);
  const ratio = current1RM / best1RM;

  if (ratio >= 0.97 && ratio < 1.0) {
    return {
      text: '接近个人最佳，下一组可以尝试挑战',
      trigger: 'approaching_pr',
      urgency: 'notice',
    };
  }
  if (ratio >= 1.0) {
    return {
      text: '新纪录！保持控制完成剩余组',
      trigger: 'new_pr_alert',
      urgency: 'notice',
    };
  }
  return null;
}

function checkVolumeHigh(
  ctx: LiveExerciseContext,
  history: ExerciseHistory
): ContextualTip | null {
  if (history.sessions.length < 2) return null;
  const todayVol = liveVolume(ctx);
  const avgSessionVol =
    history.sessions.slice(-4).reduce((s, sess) => s + sess.totalVolume, 0) /
    Math.min(history.sessions.length, 4);
  if (avgSessionVol > 0 && todayVol > avgSessionVol * 1.2) {
    return {
      text: '今日容量已超近期平均，注意疲劳累积',
      trigger: 'volume_high',
      urgency: 'subtle',
    };
  }
  return null;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function urgencyRank(u: ContextualTip['urgency']): number {
  switch (u) {
    case 'alert':
      return 3;
    case 'notice':
      return 2;
    case 'subtle':
      return 1;
  }
}
