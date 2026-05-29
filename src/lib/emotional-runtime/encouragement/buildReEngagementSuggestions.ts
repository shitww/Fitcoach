// ── Build Re-Engagement Suggestions ──────────────────────────────────────────
// Low-friction re-engagement options when user has been away.
// ─────────────────────────────────────────────────────────────────────────────

import type { ReEngagementSuggestion } from '@/types/emotional-runtime';

/** Build re-engagement options based on absence duration.
 *  Keeps suggestions calm and low-friction — no pressure.
 */
export function buildReEngagementSuggestions(
  daysSinceLastWorkout: number
): ReEngagementSuggestion[] {
  if (daysSinceLastWorkout < 5) return [];

  const suggestions: ReEngagementSuggestion[] = [];

  // Short session: always the lowest barrier
  suggestions.push({
    type: 'short_session',
    headline: '20 分钟轻量训练',
    description: '短时训练同样有效，重新建立节奏最重要',
    lowFriction: true,
  });

  // Familiar exercise: something the user knows well
  suggestions.push({
    type: 'familiar_exercise',
    headline: '从熟悉动作开始',
    description: '选择你最熟练的训练，降低重返阻力',
    lowFriction: true,
  });

  if (daysSinceLastWorkout >= 14) {
    // Long absence: explicit low expectation
    suggestions.push({
      type: 'light_session',
      headline: '轻量全身训练',
      description: '长时间未训练后，轻量全身激活是最佳起点',
      lowFriction: true,
    });
  }

  return suggestions;
}

/** Get the single best suggestion for the current absence context. */
export function getBestReEngagementSuggestion(
  daysSinceLastWorkout: number
): ReEngagementSuggestion | null {
  const all = buildReEngagementSuggestions(daysSinceLastWorkout);
  return all.find((s) => s.lowFriction) ?? all[0] ?? null;
}
