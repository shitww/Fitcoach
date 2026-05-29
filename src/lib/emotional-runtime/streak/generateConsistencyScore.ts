// ── Generate Consistency Score ────────────────────────────────────────────────
// Scores training consistency with a grade and trend.
// ─────────────────────────────────────────────────────────────────────────────

import type { ConsistencyScore } from '@/types/emotional-runtime';
import type { ProgressData } from '@/lib/dashboard-bootstrap';

/** Compute a consistency score from recent training data. */
export function generateConsistencyScore(progress: ProgressData): ConsistencyScore {
  const { last14Days, currentStreak } = progress;

  const completed = last14Days.filter((d) => d.done).length;
  const total = last14Days.length;
  const rawScore = Math.round((completed / total) * 100);

  // Check if score is improving vs prior week
  const lastWeek = last14Days.slice(7).filter((d) => d.done).length;
  const priorWeek = last14Days.slice(0, 7).filter((d) => d.done).length;

  const trend: ConsistencyScore['trend'] =
    lastWeek > priorWeek + 1 ? 'improving' :
    lastWeek < priorWeek - 1 ? 'declining' :
    'stable';

  // Streak bonus: sustained consecutive training adds grade
  const streakBonus = Math.min(10, currentStreak);
  const score = Math.min(100, rawScore + streakBonus);

  const grade = getGrade(score, completed);
  const label = getLabel(grade, trend, completed);

  return { score, grade, label, trend, windowDays: total };
}

function getGrade(
  score: number,
  completed: number
): ConsistencyScore['grade'] {
  if (score >= 70 && completed >= 6) return 'excellent';
  if (score >= 50 && completed >= 4) return 'good';
  if (completed <= 1) return 'returning';
  return 'building';
}

function getLabel(
  grade: ConsistencyScore['grade'],
  trend: ConsistencyScore['trend'],
  completed: number
): string {
  switch (grade) {
    case 'excellent':
      return trend === 'improving' ? '训练节奏持续提升' : '训练节奏稳定';
    case 'good':
      return '训练频率良好';
    case 'returning':
      return '重新建立节奏中';
    case 'building':
    default:
      return completed > 0 ? '正在建立训练习惯' : '开始你的训练旅程';
  }
}
