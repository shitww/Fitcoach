// ── Meal Pattern Scoring ────────────────────────────────────────────────────
// Scores how "pattern-like" a user's meal logging is for each meal type.
// ─────────────────────────────────────────────────────────────────────────────

import type { MemoryFoodLog } from '@/types/workout-memory';

export interface MealPatternScore {
  mealType: string;
  patternScore: number; // 0-1, higher = more repetitive/predictable
  topFoods: { foodId: string; foodName: string; frequency: number }[];
  explanation: string;
}

/** Calculate a "pattern score" for each meal type indicating how
 *  repetitive the user's eating is (high = predictable, low = varied).
 */
export function calculateMealPatternScores(
  logs: readonly MemoryFoodLog[]
): MealPatternScore[] {
  const byMealType = new Map<string, MemoryFoodLog[]>();

  for (const log of logs) {
    const arr = byMealType.get(log.mealType) || [];
    arr.push(log);
    byMealType.set(log.mealType, arr);
  }

  const results: MealPatternScore[] = [];

  for (const [mealType, mealLogs] of byMealType) {
    // Count food frequencies for this meal type
    const foodCounts = new Map<string, { name: string; count: number }>();
    for (const log of mealLogs) {
      const existing = foodCounts.get(log.foodId);
      if (existing) {
        existing.count++;
      } else {
        foodCounts.set(log.foodId, { name: log.foodName, count: 1 });
      }
    }

    const sortedFoods = Array.from(foodCounts.entries())
      .map(([id, data]) => ({ foodId: id, foodName: data.name, frequency: data.count }))
      .sort((a, b) => b.frequency - a.frequency);

    // Pattern score = concentration (Herfindahl-like index)
    // Higher = more concentrated on few foods = more predictable
    const total = mealLogs.length;
    let hhi = 0;
    for (const [, data] of foodCounts) {
      const share = data.count / total;
      hhi += share * share;
    }
    // Normalize: random uniform = low score, all same food = 1
    const patternScore = Math.round(hhi * 1000) / 1000;

    const topFoods = sortedFoods.slice(0, 5);
    const explanation =
      patternScore > 0.7
        ? `Very repetitive ${mealType} — top foods dominate`
        : patternScore > 0.4
          ? `Moderate variety in ${mealType}`
          : `High variety in ${mealType}`;

    results.push({ mealType, patternScore, topFoods, explanation });
  }

  return results.sort((a, b) => b.patternScore - a.patternScore);
}

/** Detect the user's "usual" foods for a specific meal type. */
export function getUsualFoodsForMealType(
  logs: readonly MemoryFoodLog[],
  mealType: string,
  thresholdDays: number = 14
): { foodId: string; foodName: string; confidence: number }[] {
  const filtered = logs.filter((l) => l.mealType === mealType);
  if (filtered.length === 0) return [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - thresholdDays);

  const counts = new Map<string, { name: string; total: number; recent: number }>();
  for (const log of filtered) {
    const existing = counts.get(log.foodId);
    if (existing) {
      existing.total++;
      if (new Date(log.date) >= cutoff) existing.recent++;
    } else {
      counts.set(log.foodId, {
        name: log.foodName,
        total: 1,
        recent: new Date(log.date) >= cutoff ? 1 : 0,
      });
    }
  }

  const totalLogs = filtered.length;
  return Array.from(counts.entries())
    .map(([id, data]) => ({
      foodId: id,
      foodName: data.name,
      confidence: Math.round((data.total / totalLogs) * 1000) / 1000,
    }))
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 10);
}
