// ── Build Volume Trend ────────────────────────────────────────────────────────
// Tracks training volume changes per muscle group over time.
// ─────────────────────────────────────────────────────────────────────────────

import type { VolumeTrend } from '@/types/emotional-runtime';
import type { ProgressData } from '@/lib/dashboard-bootstrap';

export interface VolumeInput {
  muscleGroup: string;
  currentWeekSets: number;
  priorWeekSets: number;
  periodWeeks?: number;
}

/** Build volume trends from set count comparison. */
export function buildVolumeTrends(inputs: VolumeInput[]): VolumeTrend[] {
  return inputs.map((input) => {
    const { muscleGroup, currentWeekSets, priorWeekSets, periodWeeks = 4 } = input;

    const deltaPct = priorWeekSets > 0
      ? Math.round(((currentWeekSets - priorWeekSets) / priorWeekSets) * 100)
      : 0;

    const trend = deltaPct > 5 ? 'up' : deltaPct < -5 ? 'down' : 'stable';
    const arrow = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';
    const label = `${muscleGroup}训练容量 ${arrow} ${Math.abs(deltaPct)}%`;

    return {
      muscleGroup,
      periodWeeks,
      startVolume: priorWeekSets,
      currentVolume: currentWeekSets,
      deltaPct,
      trend,
      label,
    };
  });
}

/** Build a simple weekly volume estimate from last14Days training frequency. */
export function estimateWeeklyVolume(progress: ProgressData): {
  lastWeek: number;
  priorWeek: number;
  trend: 'up' | 'stable' | 'down';
} {
  const lastWeek = progress.last14Days.slice(7).filter((d) => d.done).length;
  const priorWeek = progress.last14Days.slice(0, 7).filter((d) => d.done).length;

  const trend = lastWeek > priorWeek + 1 ? 'up' :
                lastWeek < priorWeek - 1 ? 'down' : 'stable';

  return { lastWeek, priorWeek, trend };
}
