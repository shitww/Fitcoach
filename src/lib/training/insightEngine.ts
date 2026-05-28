// ── FitCoach V2 — Training Insight Engine ─────────────────────────────────
// Generates short, Apple-Fitness-style one-liner insights from history.
// Periodic (not real-time). Pure functions. No dashboard bloat.

import type {
  ExerciseHistory,
  TrainingInsight,
  UserTrainingContext,
  RecentWorkout,
} from './trainingTypes';

// ── Configuration ──────────────────────────────────────────────────────────

const VOLUME_TREND_WINDOW = 8; // sessions
const INSIGHT_MAX = 3; // max insights per run

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Generate training insights from a collection of exercise histories.
 * Call periodically (e.g. weekly, or after workout save) — not every render.
 */
export function generateInsights(
  histories: ExerciseHistory[],
  context: UserTrainingContext
): TrainingInsight[] {
  const insights: TrainingInsight[] = [];

  // 1. Volume trends per exercise
  for (const h of histories) {
    const trend = volumeTrendPct(h, VOLUME_TREND_WINDOW);
    if (trend !== null && Math.abs(trend) >= 10) {
      insights.push({
        type: 'volume_trend',
        text:
          trend > 0
            ? `过去 ${VOLUME_TREND_WINDOW} 次 ${h.exerciseName} 容量提升 ${Math.round(trend)}%`
            : `过去 ${VOLUME_TREND_WINDOW} 次 ${h.exerciseName} 容量下降 ${Math.round(Math.abs(trend))}%`,
        severity: trend > 0 ? 'positive' : 'attention',
      });
    }
  }

  // 2. PR milestones (simplified: any exercise with recent best 1RM)
  for (const h of histories) {
    const recentPR = findRecentPR(h, 30);
    if (recentPR) {
      insights.push({
        type: 'pr_milestone',
        text: `${h.exerciseName} 力量新高 ${recentPR.display}`,
        detail: `预估 1RM 达到 ${recentPR.estimated1RM.toFixed(1)}kg`,
        severity: 'positive',
      });
    }
  }

  // 3. Frequency gaps
  const gap = findFrequencyGap(histories, 14);
  if (gap) {
    insights.push({
      type: 'frequency_gap',
      text: `${gap.muscleGroup} 训练间隔 ${gap.daysSince} 天，建议安排一次`,
      severity: 'neutral',
    });
  }

  // 4. Recovery quality (streak-based)
  if (context.currentStreak >= 5) {
    insights.push({
      type: 'recovery_quality',
      text: `连续训练 ${context.currentStreak} 天，恢复质量可能下降`,
      severity: 'attention',
    });
  } else if (context.currentStreak >= 3 && context.daysSinceLastWorkout === 0) {
    insights.push({
      type: 'consistency',
      text: `连续 ${context.currentStreak} 天完成训练，状态稳定`,
      severity: 'positive',
    });
  }

  // Deduplicate by text, then sort by severity, then cap
  const seen = new Set<string>();
  const unique = insights.filter((i) => {
    if (seen.has(i.text)) return false;
    seen.add(i.text);
    return true;
  });

  return unique
    .sort((a, b) => severityRank(b.severity) - severityRank(a.severity))
    .slice(0, INSIGHT_MAX);
}

// ── Trend Helpers ──────────────────────────────────────────────────────────

function volumeTrendPct(
  history: ExerciseHistory,
  windowSize: number
): number | null {
  const sessions = history.sessions.slice(-windowSize);
  if (sessions.length < 4) return null;
  const mid = Math.floor(sessions.length / 2);
  const first = sessions.slice(0, mid);
  const second = sessions.slice(mid);
  const firstAvg =
    first.reduce((s, sess) => s + sess.totalVolume, 0) /
    Math.max(first.length, 1);
  const secondAvg =
    second.reduce((s, sess) => s + sess.totalVolume, 0) /
    Math.max(second.length, 1);
  if (firstAvg === 0) return null;
  return ((secondAvg - firstAvg) / firstAvg) * 100;
}

interface RecentPR {
  display: string;
  estimated1RM: number;
  date: string;
}

function findRecentPR(
  history: ExerciseHistory,
  daysWindow: number
): RecentPR | null {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - daysWindow);
  let best: { weight: number; reps: number; e1rm: number; date: string } | null =
    null;
  for (const sess of history.sessions) {
    const d = new Date(sess.date);
    if (d < cutoff) continue;
    for (const set of sess.sets) {
      const e1rm = set.weight * (1 + set.reps / 30);
      if (!best || e1rm > best.e1rm) {
        best = { weight: set.weight, reps: set.reps, e1rm, date: sess.date };
      }
    }
  }
  if (!best) return null;

  // Check if this is actually a PR vs all history
  let allTimeBest = 0;
  for (const sess of history.sessions) {
    for (const set of sess.sets) {
      const e1rm = set.weight * (1 + set.reps / 30);
      if (e1rm > allTimeBest) allTimeBest = e1rm;
    }
  }
  if (best.e1rm < allTimeBest * 0.98) return null; // not actually a PR

  return {
    display: `${best.weight}kg × ${best.reps}`,
    estimated1RM: best.e1rm,
    date: best.date,
  };
}

interface FreqGap {
  muscleGroup: string;
  daysSince: number;
}

function findFrequencyGap(
  histories: ExerciseHistory[],
  daysThreshold: number
): FreqGap | null {
  const mgLastDate = new Map<string, string>();
  for (const h of histories) {
    if (!h.muscleGroup || h.sessions.length === 0) continue;
    const last = h.sessions[h.sessions.length - 1].date;
    const existing = mgLastDate.get(h.muscleGroup);
    if (!existing || last > existing) {
      mgLastDate.set(h.muscleGroup, last);
    }
  }

  let biggestGap: FreqGap | null = null;
  for (const [mg, dateStr] of mgLastDate.entries()) {
    const days = daysSince(dateStr);
    if (days >= daysThreshold) {
      if (!biggestGap || days > biggestGap.daysSince) {
        biggestGap = { muscleGroup: mg, daysSince: days };
      }
    }
  }
  return biggestGap;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function daysSince(dateStr: string): number {
  const then = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.floor((now - then) / (1000 * 60 * 60 * 24));
}

function severityRank(s: TrainingInsight['severity']): number {
  switch (s) {
    case 'positive':
      return 3;
    case 'attention':
      return 2;
    case 'neutral':
      return 1;
  }
}
