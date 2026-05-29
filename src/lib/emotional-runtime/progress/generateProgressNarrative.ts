// ── Generate Progress Narrative ───────────────────────────────────────────────
// Turns training data into a human-readable growth story.
// Trend + narrative, not raw data tables.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProgressNarrative, StrengthTrend, VolumeTrend } from '@/types/emotional-runtime';
import type { ProgressData, RecoveryData } from '@/lib/dashboard-bootstrap';
import { estimateWeeklyVolume } from './buildVolumeTrend';

export interface NarrativeInput {
  progress: ProgressData;
  recovery: RecoveryData;
  strengthTrends: StrengthTrend[];
  volumeTrends: VolumeTrend[];
  periodWeeks?: number;
}

/** Generate a progress narrative from training data. */
export function generateProgressNarrative(input: NarrativeInput): ProgressNarrative {
  const { progress, recovery, strengthTrends, volumeTrends, periodWeeks = 8 } = input;

  const weeklyVolume = estimateWeeklyVolume(progress);
  const volumeDeltaPct = weeklyVolume.priorWeek > 0
    ? Math.round(((weeklyVolume.lastWeek - weeklyVolume.priorWeek) / weeklyVolume.priorWeek) * 100)
    : 0;

  // Stability: how consistent has training been
  const completed = progress.last14Days.filter((d) => d.done).length;
  const stabilityPct = Math.round((completed / 14) * 100);
  const stabilityDelta = stabilityPct - 50; // vs 50% baseline

  const headline = buildHeadline(weeklyVolume.trend, stabilityPct, strengthTrends);
  const storyLines = buildStoryLines({
    completed,
    periodWeeks,
    strengthTrends,
    volumeDeltaPct,
    weeklyVolume,
    progress,
  });

  const recoveryImprovement = buildRecoveryNote(recovery);
  const tone = determineTone(weeklyVolume.trend, stabilityPct, strengthTrends);

  return {
    periodWeeks,
    headline,
    strengthTrends: strengthTrends.slice(0, 3),
    volumeTrends: volumeTrends.slice(0, 3),
    stabilityDelta,
    recoveryImprovement,
    storyLines,
    tone,
  };
}

function buildHeadline(
  trend: 'up' | 'stable' | 'down',
  stabilityPct: number,
  strengths: StrengthTrend[]
): string {
  const upCount = strengths.filter((s) => s.trend === 'up').length;

  if (trend === 'up' && stabilityPct >= 60) {
    return `过去几周训练频率和强度持续上升`;
  }
  if (stabilityPct >= 65) return `整体训练节奏稳定`;
  if (upCount >= 2) return `多个动作力量稳步提升`;
  if (trend === 'down') return `近期训练频率有所下降`;
  return `训练数据稳定积累中`;
}

function buildStoryLines(ctx: {
  completed: number;
  periodWeeks: number;
  strengthTrends: StrengthTrend[];
  volumeDeltaPct: number;
  weeklyVolume: { lastWeek: number; priorWeek: number; trend: string };
  progress: ProgressData;
}): string[] {
  const lines: string[] = [];

  // Frequency line
  lines.push(`过去 14 天完成了 ${ctx.completed} 次训练`);

  // Volume change
  if (Math.abs(ctx.volumeDeltaPct) >= 5) {
    const dir = ctx.volumeDeltaPct > 0 ? '增加' : '减少';
    lines.push(`与上周相比，训练频率${dir} ${Math.abs(ctx.volumeDeltaPct)}%`);
  }

  // Strength callout
  const upTrends = ctx.strengthTrends.filter((s) => s.trend === 'up').slice(0, 2);
  if (upTrends.length > 0) {
    const names = upTrends.map((s) => s.exerciseName).join('、');
    lines.push(`${names}力量稳定提升中`);
  }

  return lines.slice(0, 3);
}

function buildRecoveryNote(recovery: RecoveryData): string | null {
  if (recovery.fatigueLevel === 'high') return '注意疲劳积累，增加恢复时间';
  if (recovery.daysSinceLastWorkout >= 3) return '近期恢复安排合理';
  return null;
}

function determineTone(
  trend: string,
  stability: number,
  strengths: StrengthTrend[]
): ProgressNarrative['tone'] {
  if (trend === 'up' && stability >= 60) return 'positive';
  if (strengths.some((s) => s.trend === 'down')) return 'analytical';
  return 'neutral';
}
