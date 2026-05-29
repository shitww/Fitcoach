// ── Build Strength Trend ──────────────────────────────────────────────────────
// Derives strength progression trends from recent exercise data.
// ─────────────────────────────────────────────────────────────────────────────

import type { StrengthTrend } from '@/types/emotional-runtime';
import type { RecentExercise } from '@/lib/dashboard-bootstrap';

export interface ExerciseHistory {
  name: string;
  weight: number;
  date: string;
}

/** Build strength trends from exercise history snapshots. */
export function buildStrengthTrends(
  exercises: RecentExercise[],
  historicalMap: Record<string, number> = {}   // exerciseName → weight N weeks ago
): StrengthTrend[] {
  const trends: StrengthTrend[] = [];

  for (const ex of exercises) {
    const historicalWeight = historicalMap[ex.name];
    if (!historicalWeight || historicalWeight <= 0) continue;

    const deltaKg = Math.round((ex.weight - historicalWeight) * 10) / 10;
    const deltaPct = Math.round(((ex.weight - historicalWeight) / historicalWeight) * 100);

    const trend = deltaKg > 0.5 ? 'up' : deltaKg < -0.5 ? 'down' : 'stable';
    const trendLabel = trend === 'up' ? '稳定提升' : trend === 'down' ? '略有下降' : '保持稳定';

    trends.push({
      exerciseName: ex.name,
      periodWeeks: 8, // default window
      startWeight: historicalWeight,
      currentWeight: ex.weight,
      deltaKg,
      deltaPct,
      trend,
      trendLabel,
    });
  }

  // Sort by absolute delta descending — most significant changes first
  return trends.sort((a, b) => Math.abs(b.deltaKg) - Math.abs(a.deltaKg));
}

/** Get a formatted trend label for a single exercise. */
export function getStrengthTrendLabel(trend: StrengthTrend): string {
  if (trend.trend === 'up') {
    return `${trend.exerciseName} +${trend.deltaKg}kg（${trend.trendLabel}）`;
  }
  if (trend.trend === 'down') {
    return `${trend.exerciseName} ${trend.deltaKg}kg（${trend.trendLabel}）`;
  }
  return `${trend.exerciseName}（${trend.trendLabel}）`;
}
