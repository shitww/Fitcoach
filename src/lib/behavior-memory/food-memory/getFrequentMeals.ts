// ── Frequent Meals ────────────────────────────────────────────────────────────
// Detects the user's most commonly logged meal combinations.
// ─────────────────────────────────────────────────────────────────────────────

import type { MemoryFoodLog } from '@/types/workout-memory';

export interface FrequentMeal {
  mealType: string;
  date: string;
  foodIds: string[];
  foodNames: string[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

/** Aggregate all meals (grouped by date + mealType) and return them sorted by frequency. */
export function getFrequentMeals(
  logs: readonly MemoryFoodLog[]
): { meals: FrequentMeal[]; patterns: Map<string, number> } {
  const meals = new Map<string, FrequentMeal>();

  for (const log of logs) {
    const key = `${log.date}::${log.mealType}`;
    const existing = meals.get(key);
    if (existing) {
      existing.foodIds.push(log.foodId);
      existing.foodNames.push(log.foodName);
      existing.totalCalories += log.calories;
      existing.totalProtein += log.protein;
      existing.totalCarbs += log.carbs;
      existing.totalFat += log.fat;
    } else {
      meals.set(key, {
        mealType: log.mealType,
        date: log.date,
        foodIds: [log.foodId],
        foodNames: [log.foodName],
        totalCalories: log.calories,
        totalProtein: log.protein,
        totalCarbs: log.carbs,
        totalFat: log.fat,
      });
    }
  }

  // Count pattern frequencies (sorted food IDs)
  const patterns = new Map<string, number>();
  for (const meal of meals.values()) {
    const sortedIds = [...new Set(meal.foodIds)].sort().join(',');
    patterns.set(sortedIds, (patterns.get(sortedIds) || 0) + 1);
  }

  const sortedMeals = Array.from(meals.values()).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return { meals: sortedMeals, patterns };
}

/** Get the user's most common meal patterns (same foods, any day). */
export function getTopMealPatterns(
  logs: readonly MemoryFoodLog[],
  limit: number = 5
): { foodNames: string[]; count: number; avgCalories: number }[] {
  const { meals, patterns } = getFrequentMeals(logs);

  const patternDetails = new Map<
    string,
    { foodNames: string[]; count: number; calories: number[] }
  >();

  for (const meal of meals) {
    const sortedIds = [...new Set(meal.foodIds)].sort().join(',');
    const existing = patternDetails.get(sortedIds);
    if (existing) {
      existing.count++;
      existing.calories.push(meal.totalCalories);
    } else {
      patternDetails.set(sortedIds, {
        foodNames: [...new Set(meal.foodNames)],
        count: 1,
        calories: [meal.totalCalories],
      });
    }
  }

  return Array.from(patternDetails.values())
    .filter((p) => p.count >= 2)
    .map((p) => ({
      foodNames: p.foodNames,
      count: p.count,
      avgCalories: Math.round(
        p.calories.reduce((s, c) => s + c, 0) / p.calories.length
      ),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
