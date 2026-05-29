// ── Generate Achievement Surface ──────────────────────────────────────────────
// Assembles the final achievement surface: new + recent + milestones.
// Subtle, premium display — no badge walls.
// ─────────────────────────────────────────────────────────────────────────────

import type { AchievementSurface } from '@/types/emotional-runtime';
import type { ProgressData, RecoveryData } from '@/lib/dashboard-bootstrap';
import { detectMicroAchievements } from './detectMicroAchievements';
import { buildProgressMilestones } from './buildProgressMilestones';

/** Generate the full achievement surface for the current session. */
export function generateAchievementSurface(
  progress: ProgressData,
  recovery: RecoveryData
): AchievementSurface {
  const all = detectMicroAchievements({ progress, recovery });
  const milestones = buildProgressMilestones(progress);

  const newAchievements = all.filter((a) => a.isNew);
  const recentAchievements = all.filter((a) => !a.isNew).slice(0, 5);

  return {
    newAchievements,
    recentAchievements,
    milestones,
    hasNewAchievement: newAchievements.length > 0,
  };
}

/** Check if there's anything new worth surfacing on the hero. */
export function hasNewHighlight(surface: AchievementSurface): boolean {
  return surface.hasNewAchievement ||
    surface.milestones.some((m) => m.completedAt && m.progressPct === 100);
}
