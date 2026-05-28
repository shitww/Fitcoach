// ── Food Memory Builder ──────────────────────────────────────────────────────
// Aggregates food log history into UserFoodMemory.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  MemoryFoodLog,
  UserFoodMemory,
  FoodUsageSnapshot,
  MealPattern,
} from '@/types/workout-memory';

function median(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/** Build food usage snapshots from raw logs. */
function buildFoodSnapshots(
  logs: readonly MemoryFoodLog[]
): Record<string, FoodUsageSnapshot> {
  const grouped = new Map<
    string,
    {
      name: string;
      dates: string[];
      mealTypes: string[];
      servings: number[];
    }
  >();

  for (const log of logs) {
    const existing = grouped.get(log.foodId);
    if (existing) {
      existing.dates.push(log.date);
      existing.mealTypes.push(log.mealType);
      existing.servings.push(log.servingG);
    } else {
      grouped.set(log.foodId, {
        name: log.foodName,
        dates: [log.date],
        mealTypes: [log.mealType],
        servings: [log.servingG],
      });
    }
  }

  const snapshots: Record<string, FoodUsageSnapshot> = {};
  const now = new Date();
  const cutoff30d = new Date();
  cutoff30d.setDate(cutoff30d.getDate() - 30);
  const cutoff7d = new Date();
  cutoff7d.setDate(cutoff7d.getDate() - 7);

  for (const [foodId, data] of grouped) {
    const sortedDates = [...data.dates].sort();
    const freq30d = data.dates.filter((d) => new Date(d) >= cutoff30d).length;
    const freq7d = data.dates.filter((d) => new Date(d) >= cutoff7d).length;

    // Most common meal type
    const typeCounts = new Map<string, number>();
    for (const t of data.mealTypes) {
      typeCounts.set(t, (typeCounts.get(t) || 0) + 1);
    }
    let commonMealType: FoodUsageSnapshot['commonMealType'] = null;
    let maxCount = 0;
    for (const [t, c] of typeCounts) {
      if (c > maxCount) {
        maxCount = c;
        commonMealType = t as FoodUsageSnapshot['commonMealType'];
      }
    }

    snapshots[foodId] = {
      foodId,
      foodName: data.name,
      totalLogs: data.dates.length,
      lastLoggedAt: sortedDates[sortedDates.length - 1],
      frequency30d: freq30d,
      frequency7d: freq7d,
      commonMealType,
      typicalServingG: Math.round(median(data.servings)),
    };
  }

  return snapshots;
}

/** Detect meal patterns: foods that commonly appear together on the same day
 *  under the same meal type.
 */
function detectMealPatterns(logs: readonly MemoryFoodLog[]): MealPattern[] {
  // Group by (date + mealType)
  const meals = new Map<string, { foodIds: string[]; foodNames: string[]; date: string }>();

  for (const log of logs) {
    const key = `${log.date}::${log.mealType}`;
    const existing = meals.get(key);
    if (existing) {
      existing.foodIds.push(log.foodId);
      existing.foodNames.push(log.foodName);
    } else {
      meals.set(key, {
        foodIds: [log.foodId],
        foodNames: [log.foodName],
        date: log.date,
      });
    }
  }

  // Find food pairs that co-occur frequently
  const pairCounts = new Map<
    string,
    {
      foodIds: string[];
      foodNames: string[];
      mealType: string;
      count: number;
      first: string;
      last: string;
    }
  >();

  for (const [key, meal] of meals) {
    const mealType = key.split('::')[1];
    const ids = [...new Set(meal.foodIds)].sort();

    // Only consider meals with 2-6 items (breakfast combos, not feasts)
    if (ids.length < 2 || ids.length > 6) continue;

    const patternKey = `${mealType}::${ids.join(',')}`;
    const existing = pairCounts.get(patternKey);
    if (existing) {
      existing.count++;
      if (meal.date < existing.first) existing.first = meal.date;
      if (meal.date > existing.last) existing.last = meal.date;
    } else {
      pairCounts.set(patternKey, {
        foodIds: ids,
        foodNames: [...new Set(meal.foodNames)],
        mealType,
        count: 1,
        first: meal.date,
        last: meal.date,
      });
    }
  }

  const patterns: MealPattern[] = [];
  for (const [patternId, data] of pairCounts) {
    if (data.count >= 2) {
      patterns.push({
        patternId,
        foodIds: data.foodIds,
        foodNames: data.foodNames,
        mealType: data.mealType as MealPattern['mealType'],
        occurrenceCount: data.count,
        firstSeen: data.first,
        lastSeen: data.last,
      });
    }
  }

  return patterns.sort((a, b) => b.occurrenceCount - a.occurrenceCount);
}

/** Build the complete UserFoodMemory from raw food logs. */
export function buildFoodMemory(
  userId: string,
  logs: readonly MemoryFoodLog[]
): UserFoodMemory {
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Keep last 30 days for recent logs
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const recentLogs = sortedLogs.filter((l) => new Date(l.date) >= cutoff);

  return {
    userId,
    version: 1,
    lastUpdatedAt: new Date().toISOString(),
    foodSnapshots: buildFoodSnapshots(sortedLogs),
    mealPatterns: detectMealPatterns(sortedLogs),
    recentLogs,
  };
}
