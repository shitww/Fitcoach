'use client';

/**
 * useWorkoutHint — AI Hint Layer (passive suggestion only)
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  HINT-ONLY  ·  This is the ONLY surface AI may reach during a workout. │
 * │                                                                         │
 * │  Rules (enforced by design, not just convention):                      │
 * │    ✔ Returns a single Chinese suggestion string, or null               │
 * │    ✔ Derived deterministically from WorkoutUIState                     │
 * │    ✔ No LLM call, no network request, no async operation               │
 * │    ✔ Never emits events, never calls actions, never mutates state      │
 * │    ✔ UI may display or silently ignore the hint — purely advisory      │
 * │    ✗ Must never control flow, trigger navigation, or modify parameters │
 * └─────────────────────────────────────────────────────────────────────────┘
 *
 * Consumes only: useWorkoutUI (the frozen 5-field contract)
 * Produces only: string | null
 */

import { useWorkoutUI } from './useWorkoutUI';

// ── Exercise-specific form tips ───────────────────────────────────────────────
// Keyed by partial exercise name (case-insensitive substring match).
// Keep entries short (~10 Chinese chars) so they fit inline without layout shift.
const FORM_TIPS: [string, string][] = [
  ['卧推',   '肩胛骨收紧，稳住'],
  ['bench',  '控制离心，慢放'],
  ['深蹲',   '膝盖追脚尖方向'],
  ['squat',  '核心收紧，挺胸'],
  ['硬拉',   '背部保持中立位'],
  ['deadlift', '髋铰链发力'],
  ['引体',   '肩胛骨先下沉'],
  ['pull',   '肘往口袋拉'],
  ['推举',   '不要耸肩'],
  ['press',  '核心收紧，稳住'],
  ['划船',   '顶峰收缩一秒'],
  ['row',    '保持背部水平'],
  ['弯举',   '上臂固定不动'],
  ['curl',   '顶部停留一拍'],
];

function _formTip(exercise: string | null): string | null {
  if (!exercise) return null;
  const lower = exercise.toLowerCase();
  for (const [key, tip] of FORM_TIPS) {
    if (lower.includes(key)) return tip;
  }
  return null;
}

// ── Core hint logic ───────────────────────────────────────────────────────────

/**
 * Pure function — derives a single advisory hint from workout UI state.
 * No side effects. Safe to call on every render.
 */
export function deriveWorkoutHint(
  isTrainingActive: boolean,
  restRemainingSeconds: number,
  totalSets: number,
  currentExercise: string | null,
): string | null {
  if (!isTrainingActive) return null;

  // ── Rest window hints ──────────────────────────────────────────────────────
  if (restRemainingSeconds > 25) return '充分放松，准备下一组';
  if (restRemainingSeconds > 10) return '活动一下手腕和肩膀';
  if (restRemainingSeconds > 0)  return '准备好了，马上开始';

  // ── Milestone hints ────────────────────────────────────────────────────────
  if (totalSets > 0 && totalSets % 5 === 0) return `已完成 ${totalSets} 组，保持节奏`;
  if (totalSets > 0 && totalSets % 3 === 0) return '状态很好，继续！';

  // ── Exercise-specific form tip ─────────────────────────────────────────────
  const tip = _formTip(currentExercise);
  if (tip) return tip;

  return null;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Returns a single advisory hint string derived from the current workout state,
 * or null when no hint is relevant.
 *
 * Mount anywhere inside the workout screen to display a non-intrusive tip.
 * The hint has zero influence on training flow.
 */
export function useWorkoutHint(): string | null {
  const { isTrainingActive, restRemainingSeconds, totalSets, currentExercise } = useWorkoutUI();
  return deriveWorkoutHint(isTrainingActive, restRemainingSeconds, totalSets, currentExercise);
}
