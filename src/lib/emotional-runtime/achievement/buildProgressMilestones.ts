// ── Build Progress Milestones ─────────────────────────────────────────────────
// Tracks progress toward cumulative training goals.
// ─────────────────────────────────────────────────────────────────────────────

import type { ProgressMilestone } from '@/types/emotional-runtime';
import type { ProgressData } from '@/lib/dashboard-bootstrap';

interface MilestoneDefinition {
  id: string;
  label: string;
  target: number;
  unit: string;
  getValue: (p: ProgressData) => number;
}

const MILESTONE_DEFINITIONS: MilestoneDefinition[] = [
  {
    id: 'total_10',
    label: '完成 10 次训练',
    target: 10,
    unit: '次',
    getValue: (p) => p.totalWorkouts,
  },
  {
    id: 'total_25',
    label: '完成 25 次训练',
    target: 25,
    unit: '次',
    getValue: (p) => p.totalWorkouts,
  },
  {
    id: 'total_50',
    label: '完成 50 次训练',
    target: 50,
    unit: '次',
    getValue: (p) => p.totalWorkouts,
  },
  {
    id: 'total_100',
    label: '完成 100 次训练',
    target: 100,
    unit: '次',
    getValue: (p) => p.totalWorkouts,
  },
  {
    id: 'streak_7',
    label: '连续 7 天训练',
    target: 7,
    unit: '天',
    getValue: (p) => p.currentStreak,
  },
  {
    id: 'streak_14',
    label: '连续 14 天训练',
    target: 14,
    unit: '天',
    getValue: (p) => p.currentStreak,
  },
];

/** Build current milestone progress from progress data.
 *  Only returns milestones that are either near-complete (>60%) or completed.
 */
export function buildProgressMilestones(
  progress: ProgressData,
  showAll = false
): ProgressMilestone[] {
  const now = new Date().toISOString();
  const milestones: ProgressMilestone[] = [];

  for (const def of MILESTONE_DEFINITIONS) {
    const current = def.getValue(progress);
    const pct = Math.min(100, Math.round((current / def.target) * 100));
    const completed = current >= def.target;

    // Show: completed, close (>60%), or showAll
    if (!showAll && !completed && pct < 60) continue;

    milestones.push({
      milestoneId: def.id,
      label: def.label,
      currentValue: current,
      targetValue: def.target,
      unit: def.unit,
      completedAt: completed ? now : null,
      progressPct: pct,
    });
  }

  // Sort: incomplete first (nearest completion), then completed
  return milestones.sort((a, b) => {
    if (a.completedAt && !b.completedAt) return 1;
    if (!a.completedAt && b.completedAt) return -1;
    return b.progressPct - a.progressPct;
  });
}

/** Get the single most prominent upcoming milestone. */
export function getNextMilestone(progress: ProgressData): ProgressMilestone | null {
  const all = buildProgressMilestones(progress, true);
  return all.find((m) => !m.completedAt) ?? null;
}
