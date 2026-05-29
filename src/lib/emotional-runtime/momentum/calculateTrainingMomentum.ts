// ── Calculate Training Momentum ───────────────────────────────────────────────
// Computes a composite momentum score from training frequency + trend data.
// Pure function — no side effects. Deterministic.
// ─────────────────────────────────────────────────────────────────────────────

import type { TrainingMomentumState, MomentumPhase } from '@/types/emotional-runtime';

export interface MomentumInput {
  last14Days: { date: string; done: boolean }[];
  daysSinceLastWorkout: number;
  currentStreak: number;
  totalWorkouts: number;
  weeklyWorkouts: number;
}

/** Compute full training momentum state from recent activity data. */
export function calculateTrainingMomentum(input: MomentumInput): TrainingMomentumState {
  const { last14Days, daysSinceLastWorkout, currentStreak, weeklyWorkouts } = input;

  const twoWeekFrequency = last14Days.filter((d) => d.done).length;
  const lastWeekDays = last14Days.slice(7);
  const priorWeekDays = last14Days.slice(0, 7);
  const lastWeekFrequency = lastWeekDays.filter((d) => d.done).length;
  const priorWeekFrequency = priorWeekDays.filter((d) => d.done).length;

  const consistencyScore = computeConsistencyScore(last14Days);
  const momentumScore = computeMomentumScore({
    twoWeekFrequency,
    lastWeekFrequency,
    priorWeekFrequency,
    daysSinceLastWorkout,
    consistencyScore,
    currentStreak,
  });

  const trend = deriveTrend(lastWeekFrequency, priorWeekFrequency);
  const phase = detectPhase({
    daysSinceLastWorkout,
    twoWeekFrequency,
    lastWeekFrequency,
    priorWeekFrequency,
    momentumScore,
    consistencyScore,
  });

  const { headline, subheadline, insightLine } = buildCopy(phase, {
    twoWeekFrequency,
    consistencyScore,
    daysSinceLastWorkout,
    weeklyWorkouts,
  });

  return {
    phase,
    score: momentumScore,
    trend,
    weeklyFrequency: lastWeekFrequency,
    twoWeekFrequency,
    consistencyScore,
    daysSinceLastWorkout,
    headline,
    subheadline,
    insightLine,
  };
}

// ── Scoring ───────────────────────────────────────────────────────────────────

function computeMomentumScore(args: {
  twoWeekFrequency: number;
  lastWeekFrequency: number;
  priorWeekFrequency: number;
  daysSinceLastWorkout: number;
  consistencyScore: number;
  currentStreak: number;
}): number {
  const { twoWeekFrequency, lastWeekFrequency, daysSinceLastWorkout, consistencyScore } = args;

  // Frequency component (max 40pts): 4 sessions/week ideal
  const idealSessions = 8; // over 14 days
  const freqScore = Math.min(1, twoWeekFrequency / idealSessions) * 40;

  // Recency component (max 30pts): penalize days since last
  const recencyScore = Math.max(0, 1 - daysSinceLastWorkout / 7) * 30;

  // Consistency component (max 20pts): stability of rhythm
  const consistScore = consistencyScore * 20;

  // Recent activity bonus (max 10pts): active last week
  const recentBonus = lastWeekFrequency >= 2 ? 10 : lastWeekFrequency >= 1 ? 5 : 0;

  return Math.round(freqScore + recencyScore + consistScore + recentBonus);
}

function computeConsistencyScore(days: { done: boolean }[]): number {
  if (days.length < 2) return 0;

  // Measure regularity: avoid long gaps
  let longestGap = 0;
  let currentGap = 0;
  let trainingCount = 0;

  for (const d of days) {
    if (d.done) {
      trainingCount++;
      longestGap = Math.max(longestGap, currentGap);
      currentGap = 0;
    } else {
      currentGap++;
    }
  }
  longestGap = Math.max(longestGap, currentGap);

  if (trainingCount === 0) return 0;

  // Gap penalty: 3+ consecutive days off is a pattern break
  const gapPenalty = Math.min(1, longestGap / 7);
  const baseScore = Math.min(1, trainingCount / 8);

  return Math.round((baseScore * (1 - gapPenalty * 0.4)) * 100) / 100;
}

function deriveTrend(
  last: number,
  prior: number
): TrainingMomentumState['trend'] {
  if (last > prior + 1) return 'up';
  if (last < prior - 1) return 'down';
  return 'stable';
}

function detectPhase(args: {
  daysSinceLastWorkout: number;
  twoWeekFrequency: number;
  lastWeekFrequency: number;
  priorWeekFrequency: number;
  momentumScore: number;
  consistencyScore: number;
}): MomentumPhase {
  const { daysSinceLastWorkout, twoWeekFrequency, lastWeekFrequency, priorWeekFrequency, momentumScore, consistencyScore } = args;

  if (daysSinceLastWorkout >= 14) return 're_entry';
  if (twoWeekFrequency === 0) return 're_entry';

  // Very high frequency with recency gap = fatigue risk
  if (twoWeekFrequency >= 12 && daysSinceLastWorkout >= 2) return 'fatigue_risk';
  if (momentumScore >= 70 && lastWeekFrequency > priorWeekFrequency) return 'rising';
  if (consistencyScore >= 0.6 && twoWeekFrequency >= 5) return 'consistent_flow';
  if (daysSinceLastWorkout >= 5 && twoWeekFrequency >= 2) return 'recovery_phase';
  if (twoWeekFrequency <= 2) return 'building';

  return 'consistent_flow';
}

// ── Copy Builder ──────────────────────────────────────────────────────────────

function buildCopy(
  phase: MomentumPhase,
  ctx: { twoWeekFrequency: number; consistencyScore: number; daysSinceLastWorkout: number; weeklyWorkouts: number }
): Pick<TrainingMomentumState, 'headline' | 'subheadline' | 'insightLine'> {
  const { twoWeekFrequency, consistencyScore, daysSinceLastWorkout } = ctx;
  const consistPct = Math.round(consistencyScore * 100);

  switch (phase) {
    case 'rising':
      return {
        headline: `过去 2 周训练频率持续上升`,
        subheadline: `节奏很好，保持当前强度`,
        insightLine: twoWeekFrequency >= 8 ? `14天内完成 ${twoWeekFrequency} 次训练` : null,
      };

    case 'consistent_flow':
      return {
        headline: consistPct >= 70
          ? `过去 3 周训练稳定性非常高`
          : `训练节奏保持稳定`,
        subheadline: `稳定是长期进步的核心`,
        insightLine: `过去 2 周完成 ${twoWeekFrequency} 次训练`,
      };

    case 'fatigue_risk':
      return {
        headline: `最近训练密度较高`,
        subheadline: `今天适合轻量训练或恢复`,
        insightLine: `注意疲劳积累，恢复也是进步`,
      };

    case 'recovery_phase':
      return {
        headline: daysSinceLastWorkout >= 7 ? `恢复节奏` : `短暂休整中`,
        subheadline: `恢复节奏很好，今天适合轻量训练`,
        insightLine: `${daysSinceLastWorkout} 天未训练`,
      };

    case 're_entry':
      return {
        headline: `欢迎回来`,
        subheadline: `重新开始，从轻量训练起步`,
        insightLine: daysSinceLastWorkout > 0 ? `距上次训练 ${daysSinceLastWorkout} 天` : null,
      };

    case 'building':
    default:
      return {
        headline: `正在建立训练节奏`,
        subheadline: `每次训练都在积累动能`,
        insightLine: `过去 2 周完成 ${twoWeekFrequency} 次训练`,
      };
  }
}
