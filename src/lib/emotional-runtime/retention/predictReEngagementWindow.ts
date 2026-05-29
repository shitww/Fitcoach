// ── Predict Re-Engagement Window ──────────────────────────────────────────────
// Predicts which days the user is most likely to return to training.
// Based on historical day-of-week patterns.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReEngagementWindow } from '@/types/emotional-runtime';
import type { ProgressData } from '@/lib/dashboard-bootstrap';

const DAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

/** Predict the user's optimal re-engagement window from day-of-week patterns. */
export function predictReEngagementWindow(
  progress: ProgressData
): ReEngagementWindow {
  const dayFrequency = computeDayOfWeekFrequency(progress.last14Days);
  const topDays = getTopDays(dayFrequency, 2);

  if (topDays.length === 0) {
    return {
      predictedReturnDay: null,
      confidence: 'low',
      basisDays: [],
      note: '尚无足够数据预测训练节奏',
    };
  }

  const topDay = DAY_LABELS[topDays[0]];
  const confidence: ReEngagementWindow['confidence'] =
    dayFrequency[topDays[0]] >= 4 ? 'high' :
    dayFrequency[topDays[0]] >= 2 ? 'medium' : 'low';

  return {
    predictedReturnDay: topDay,
    confidence,
    basisDays: topDays.map((d) => DAY_LABELS[d]),
    note: `你通常在${topDay}恢复训练节奏`,
  };
}

function computeDayOfWeekFrequency(days: { date: string; done: boolean }[]): number[] {
  const freq = new Array(7).fill(0);
  for (const d of days) {
    if (d.done) {
      const dow = new Date(d.date).getDay();
      freq[dow]++;
    }
  }
  return freq;
}

function getTopDays(freq: number[], n: number): number[] {
  return freq
    .map((count, dow) => ({ dow, count }))
    .filter((d) => d.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, n)
    .map((d) => d.dow);
}
