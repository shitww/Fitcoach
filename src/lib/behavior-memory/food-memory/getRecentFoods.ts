// ── Recent Food Context ──────────────────────────────────────────────────────
// Get recently logged foods for quick-access suggestions.
// ─────────────────────────────────────────────────────────────────────────────

import type { MemoryFoodLog, FoodUsageSnapshot } from '@/types/workout-memory';

export interface RecentFoodContext {
  foodId: string;
  foodName: string;
  mealType: string;
  lastLoggedDate: string;
  timesLogged7d: number;
  typicalServingG: number;
}

/** Get foods logged within the last N days, with usage context. */
export function getRecentFoods(
  logs: readonly MemoryFoodLog[],
  days: number = 7
): RecentFoodContext[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  const recent = logs.filter((l) => new Date(l.date) >= cutoff);

  const map = new Map<string, RecentFoodContext>();
  for (const log of recent) {
    const existing = map.get(log.foodId);
    if (existing) {
      existing.timesLogged7d++;
      if (log.date > existing.lastLoggedDate) {
        existing.lastLoggedDate = log.date;
        existing.mealType = log.mealType;
      }
    } else {
      map.set(log.foodId, {
        foodId: log.foodId,
        foodName: log.foodName,
        mealType: log.mealType,
        lastLoggedDate: log.date,
        timesLogged7d: 1,
        typicalServingG: log.servingG,
      });
    }
  }

  return Array.from(map.values()).sort(
    (a, b) => b.timesLogged7d - a.timesLogged7d
  );
}

/** Get foods most commonly logged for a specific meal type. */
export function getFoodsByMealType(
  logs: readonly MemoryFoodLog[],
  mealType: string,
  limit: number = 10
): { foodId: string; foodName: string; count: number }[] {
  const counts = new Map<string, { name: string; count: number }>();

  for (const log of logs) {
    if (log.mealType !== mealType) continue;
    const existing = counts.get(log.foodId);
    if (existing) {
      existing.count++;
    } else {
      counts.set(log.foodId, { name: log.foodName, count: 1 });
    }
  }

  return Array.from(counts.entries())
    .map(([id, data]) => ({ foodId: id, foodName: data.name, count: data.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
