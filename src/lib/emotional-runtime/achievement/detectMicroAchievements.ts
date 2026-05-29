// ── Detect Micro Achievements ─────────────────────────────────────────────────
// Identifies quiet, meaningful achievements from training history.
// No badges spam. No trophy walls. Subtle recognition only.
// ─────────────────────────────────────────────────────────────────────────────

import type { MicroAchievement, MicroAchievementType } from '@/types/emotional-runtime';
import type { ProgressData, RecoveryData } from '@/lib/dashboard-bootstrap';

const ACHIEVEMENT_STORAGE_KEY = 'fitcoach_earned_achievements';

export interface AchievementInput {
  progress: ProgressData;
  recovery: RecoveryData;
  lastSessionMuscleGroups?: string[];
}

/** Detect all currently-earned micro achievements. */
export function detectMicroAchievements(input: AchievementInput): MicroAchievement[] {
  const { progress } = input;
  const seen = loadEarnedAchievements();
  const results: MicroAchievement[] = [];

  // ── Consistency: maintained 4-week frequency ─────────────────────────────
  const twoWeekCount = progress.last14Days.filter((d) => d.done).length;
  if (twoWeekCount >= 8) {
    const id = 'consistency_4wk_freq';
    const isNew = !seen.has(id);
    results.push({
      id,
      type: 'consistency',
      title: '训练节奏稳定',
      description: `过去 2 周完成 ${twoWeekCount} 次训练，节奏非常稳定`,
      earnedAt: new Date().toISOString(),
      isNew,
      displayStyle: 'inline',
    });
  }

  // ── Consistency: current streak milestone ────────────────────────────────
  if (progress.currentStreak >= 7) {
    const id = `streak_7`;
    const isNew = !seen.has(id);
    results.push({
      id,
      type: 'consistency',
      title: `${progress.currentStreak} 天连续训练`,
      description: `你已连续 ${progress.currentStreak} 天保持训练`,
      earnedAt: new Date().toISOString(),
      isNew,
      displayStyle: 'inline',
    });
  }

  // ── Volume Milestone: total workouts ─────────────────────────────────────
  const volumeMilestones = [10, 25, 50, 100, 200];
  for (const n of volumeMilestones) {
    if (progress.totalWorkouts >= n) {
      const id = `total_workouts_${n}`;
      const isNew = !seen.has(id);
      results.push({
        id,
        type: 'volume_milestone',
        title: `完成 ${n} 次训练`,
        description: `你已累计完成 ${n} 次训练记录`,
        earnedAt: new Date().toISOString(),
        isNew,
        displayStyle: n <= 25 ? 'inline' : 'card',
      });
    }
  }

  // ── Re-Entry achievement ──────────────────────────────────────────────────
  if (input.recovery.daysSinceLastWorkout >= 10) {
    // They're back — will be awarded next session
  } else if (input.recovery.daysSinceLastWorkout <= 2 && twoWeekCount <= 2) {
    const id = 're_entry_start';
    const isNew = !seen.has(id);
    results.push({
      id,
      type: 're_entry',
      title: '重新开始',
      description: '重新建立训练节奏需要勇气，值得肯定',
      earnedAt: new Date().toISOString(),
      isNew,
      displayStyle: 'inline',
    });
  }

  // ── Frequency personal best ───────────────────────────────────────────────
  if (progress.weeklyWorkouts >= 5) {
    const id = 'freq_pb_5';
    const isNew = !seen.has(id);
    results.push({
      id,
      type: 'frequency_pb',
      title: '本周训练频率极高',
      description: `本周已完成 ${progress.weeklyWorkouts} 次训练`,
      earnedAt: new Date().toISOString(),
      isNew,
      displayStyle: 'inline',
    });
  }

  // Persist newly earned
  const newIds = results.filter((r) => r.isNew).map((r) => r.id);
  if (newIds.length > 0) {
    persistEarnedAchievements([...seen, ...newIds]);
  }

  return results;
}

// ── Persistence ───────────────────────────────────────────────────────────────

function loadEarnedAchievements(): Set<string> {
  try {
    const raw = localStorage.getItem(ACHIEVEMENT_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

function persistEarnedAchievements(ids: string[]): void {
  try {
    const unique = [...new Set(ids)];
    localStorage.setItem(ACHIEVEMENT_STORAGE_KEY, JSON.stringify(unique));
  } catch { /* non-critical */ }
}
