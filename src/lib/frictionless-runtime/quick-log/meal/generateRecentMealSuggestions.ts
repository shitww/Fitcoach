// ── Generate Recent Meal Suggestions ─────────────────────────────────────────
// Pulls recent meal patterns from behavior memory for one-tap repeat logging.
// ─────────────────────────────────────────────────────────────────────────────

import type { QuickMealSuggestion, MealTime } from '@/types/frictionless-runtime';
import type { UserFoodMemory } from '@/types/workout-memory';

/** Generate "recent meal" suggestions for one-tap repeat.
 *  Based on Phase 2 food memory — no AI, pure recency ranking.
 */
export function generateRecentMealSuggestions(
  foodMemory: UserFoodMemory,
  targetMealTime: MealTime | null,
  limit: number = 4
): QuickMealSuggestion[] {
  const suggestions: QuickMealSuggestion[] = [];

  // Sort logs by recency
  const sorted = [...foodMemory.recentLogs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const log of sorted) {
    if (suggestions.length >= limit) break;

    // Filter by meal time if specified
    const logMealTime = mealTypeToMealTime(log.mealType);
    if (targetMealTime && logMealTime !== targetMealTime) continue;

    const daysAgo = Math.floor(
      (Date.now() - new Date(log.date).getTime()) / 86_400_000
    );

    const label =
      daysAgo === 0 ? 'Today\'s meal' :
      daysAgo === 1 ? 'Yesterday\'s meal' :
      `${daysAgo} days ago`;

    suggestions.push({
      id: `recent_${log.foodName}_${log.date}`,
      type: 'recent',
      label,
      subtitle: `${log.foodName} · ~${log.calories} kcal`,
      mealTime: logMealTime,
      items: [log.foodName],
      calorieTotal: log.calories,
      frequency: 0,
      lastUsedDate: log.date,
      isOneTap: true,
    });
  }

  return suggestions;
}

/** Generate a "Repeat Yesterday's [meal]" shortcut. */
export function generateRepeatYesterdayOption(
  foodMemory: UserFoodMemory,
  mealTime: MealTime
): QuickMealSuggestion | null {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  const yesterdayLogs = foodMemory.recentLogs.filter((log) => {
    return new Date(log.date).toDateString() === yesterdayStr &&
      mealTypeToMealTime(log.mealType) === mealTime;
  });

  if (yesterdayLogs.length === 0) return null;

  const items = yesterdayLogs.map((l) => l.foodName);
  const totalCal = yesterdayLogs.reduce((sum, l) => sum + l.calories, 0);

  return {
    id: `repeat_yesterday_${mealTime}`,
    type: 'repeat_yesterday',
    label: `Yesterday's ${formatMealTime(mealTime)}`,
    subtitle: `${items.join(' · ')} · ~${totalCal} kcal`,
    mealTime,
    items,
    calorieTotal: totalCal,
    frequency: 0,
    lastUsedDate: yesterday.toISOString().slice(0, 10),
    isOneTap: true,
  };
}

function mealTypeToMealTime(mealType: string): MealTime {
  const map: Record<string, MealTime> = {
    breakfast: 'breakfast',
    lunch: 'lunch',
    dinner: 'dinner',
    snack: 'snack',
    other: 'snack',
  };
  return map[mealType] ?? 'snack';
}

function formatMealTime(mt: MealTime): string {
  const map: Record<MealTime, string> = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    pre_workout: 'Pre-Workout',
    post_workout: 'Post-Workout',
  };
  return map[mt] ?? mt;
}
