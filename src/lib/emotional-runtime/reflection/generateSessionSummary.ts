// ── Generate Session Summary ──────────────────────────────────────────────────
// Creates a calm, analytical post-workout session summary card.
// ─────────────────────────────────────────────────────────────────────────────

import type { SessionSummary, WorkoutReflection } from '@/types/emotional-runtime';

/** Build a session summary card from a WorkoutReflection. */
export function generateSessionSummary(reflection: WorkoutReflection): SessionSummary {
  const { muscleGroups, intensityVsAvg, intensityLabel, highlightMessage,
          estimatedRecoveryHours, consistencyNote } = reflection;

  const headline = buildHeadline(muscleGroups, intensityVsAvg, intensityLabel);
  const bullets = buildBullets(reflection);
  const recoveryLine = buildRecoveryLine(muscleGroups, estimatedRecoveryHours);
  const progressLine = highlightMessage;

  return { headline, bullets, recoveryLine, progressLine };
}

function buildHeadline(
  muscleGroups: string[],
  delta: number,
  label: string
): string {
  const groups = muscleGroups.slice(0, 2).join('、') || '今日';

  if (label === 'heavier') {
    return `${groups}训练强度高于近期平均 ${Math.abs(delta)}%`;
  }
  if (label === 'lighter') {
    return `${groups}轻量训练，适合积极恢复`;
  }
  return `${groups}训练强度与近期持平`;
}

function buildBullets(r: WorkoutReflection): string[] {
  const lines: string[] = [];

  if (r.highlightMessage) lines.push(r.highlightMessage);
  if (r.consistencyNote) lines.push(r.consistencyNote);

  if (r.muscleGroups.length > 1) {
    lines.push(`训练肌群：${r.muscleGroups.join('、')}`);
  }

  return lines.slice(0, 3);
}

function buildRecoveryLine(
  muscleGroups: string[],
  hours: [number, number]
): string {
  const primary = muscleGroups[0] ?? '肌群';
  if (hours[0] === hours[1]) {
    return `预计 ${primary} 恢复：${hours[0]} 小时`;
  }
  return `预计 ${primary} 恢复：${hours[0]}–${hours[1]} 小时`;
}
