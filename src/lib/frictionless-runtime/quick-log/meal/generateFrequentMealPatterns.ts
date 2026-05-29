// ── Generate Frequent Meal Patterns ──────────────────────────────────────────
// Identifies the user's most habitual meal combinations for quick re-use.
// ─────────────────────────────────────────────────────────────────────────────

import type { QuickMealSuggestion, MealTime } from '@/types/frictionless-runtime';
import type { UserFoodMemory } from '@/types/workout-memory';

/** Generate frequent meal pattern suggestions from Phase 2 food memory. */
export function generateFrequentMealPatterns(
  foodMemory: UserFoodMemory,
  mealTime: MealTime | null,
  limit: number = 3
): QuickMealSuggestion[] {
  // Group logs by day + meal time to find patterns
  const dayGroups = groupByDayAndMealTime(foodMemory.recentLogs);

  // Count pattern frequencies
  const patternCounts = new Map<string, {
    items: string[];
    count: number;
    totalCal: number;
    mealTime: MealTime;
    lastDate: string;
  }>();

  for (const group of dayGroups) {
    if (mealTime && group.mealTime !== mealTime) continue;
    if (group.items.length === 0) continue;

    const key = group.items.sort().join('|');
    const existing = patternCounts.get(key);

    if (existing) {
      existing.count += 1;
      if (new Date(group.date) > new Date(existing.lastDate)) {
        existing.lastDate = group.date;
      }
    } else {
      patternCounts.set(key, {
        items: group.items,
        count: 1,
        totalCal: group.totalCal,
        mealTime: group.mealTime,
        lastDate: group.date,
      });
    }
  }

  // Sort by frequency, filter single-occurrence
  const sorted = Array.from(patternCounts.entries())
    .filter(([, v]) => v.count >= 2)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, limit);

  return sorted.map(([key, pattern]) => {
    const maxCount = Math.max(...Array.from(patternCounts.values()).map((v) => v.count));
    const frequency = pattern.count / maxCount;

    return {
      id: `pattern_${key.slice(0, 20)}`,
      type: 'frequent' as const,
      label: `${formatMealTime(pattern.mealTime)} Habit`,
      subtitle: `${pattern.items.join(' + ')} · ~${pattern.totalCal} kcal · ${pattern.count}×`,
      mealTime: pattern.mealTime,
      items: pattern.items,
      calorieTotal: pattern.totalCal,
      frequency,
      lastUsedDate: pattern.lastDate,
      isOneTap: true,
    };
  });
}

interface DayMealGroup {
  date: string;
  mealTime: MealTime;
  items: string[];
  totalCal: number;
}

function groupByDayAndMealTime(
  logs: UserFoodMemory['recentLogs']
): DayMealGroup[] {
  const groups = new Map<string, DayMealGroup>();

  for (const log of logs) {
    const d = new Date(log.date);
    const dateKey = d.toDateString();
    const mt = mealTypeToMealTime(log.mealType);
    const groupKey = `${dateKey}|${mt}`;

    const existing = groups.get(groupKey);
    if (existing) {
      existing.items.push(log.foodName);
      existing.totalCal += log.calories;
    } else {
      groups.set(groupKey, {
        date: log.date,
        mealTime: mt,
        items: [log.foodName],
        totalCal: log.calories,
      });
    }
  }

  return Array.from(groups.values());
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
