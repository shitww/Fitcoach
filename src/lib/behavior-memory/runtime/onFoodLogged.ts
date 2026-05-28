// ── On Food Logged ──────────────────────────────────────────────────────────
// Incrementally updates food memory when a food log is added.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  MemoryFoodLog,
  BehaviorMemorySnapshot,
  UserFoodMemory,
  FoodUsageSnapshot,
  MealPattern,
} from '@/types/workout-memory';

/** Incrementally update food memory with a newly logged food item. */
export function onFoodLogged(
  snapshot: BehaviorMemorySnapshot,
  log: MemoryFoodLog
): BehaviorMemorySnapshot {
  const fm = snapshot.foodMemory;

  // 1. Update recent logs (keep last 30 days, max 200 entries)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);
  const updatedRecent = [log, ...fm.recentLogs]
    .filter((l) => new Date(l.date) >= cutoff)
    .slice(0, 200);

  // 2. Update food snapshot incrementally
  const updatedSnapshots = { ...fm.foodSnapshots };
  const key = log.foodId;
  const existing = updatedSnapshots[key];

  if (existing) {
    const now = new Date().toISOString().split('T')[0];
    const freq30d = existing.frequency30d + 1;
    const freq7d =
      new Date(log.date) >= new Date(Date.now() - 7 * 86_400_000)
        ? existing.frequency7d + 1
        : existing.frequency7d;

    // Recalculate typical serving (approximate: blend with existing)
    const typicalServing = Math.round(
      (existing.typicalServingG * existing.totalLogs + log.servingG) /
        (existing.totalLogs + 1)
    );

    // Update common meal type
    const mealTypeCounts = new Map<string, number>();
    // We don't have full history here, so use heuristic:
    // if new mealType matches existing common, increment confidence
    let commonMealType = existing.commonMealType;
    if (log.mealType === existing.commonMealType) {
      // stays the same
    } else if (existing.totalLogs < 5) {
      // Early phase: allow switching
      commonMealType = log.mealType as FoodUsageSnapshot['commonMealType'];
    }

    updatedSnapshots[key] = {
      ...existing,
      totalLogs: existing.totalLogs + 1,
      lastLoggedAt: log.date > existing.lastLoggedAt ? log.date : existing.lastLoggedAt,
      frequency30d: freq30d,
      frequency7d: freq7d,
      commonMealType,
      typicalServingG: typicalServing,
    };
  } else {
    // New food
    updatedSnapshots[key] = {
      foodId: log.foodId,
      foodName: log.foodName,
      totalLogs: 1,
      lastLoggedAt: log.date,
      frequency30d: 1,
      frequency7d: 1,
      commonMealType: log.mealType as FoodUsageSnapshot['commonMealType'],
      typicalServingG: Math.round(log.servingG),
    };
  }

  // 3. Update meal patterns (lightweight: only check if this log completes a known pattern)
  const updatedPatterns = [...fm.mealPatterns];
  const sameMealLogs = updatedRecent.filter(
    (l) => l.date === log.date && l.mealType === log.mealType
  );
  const sameMealIds = [...new Set(sameMealLogs.map((l) => l.foodId))].sort();

  if (sameMealIds.length >= 2) {
    const patternKey = `${log.mealType}::${sameMealIds.join(',')}`;
    const existingPattern = updatedPatterns.find((p) => p.patternId === patternKey);
    if (existingPattern) {
      existingPattern.occurrenceCount++;
      existingPattern.lastSeen = log.date;
    } else {
      updatedPatterns.push({
        patternId: patternKey,
        foodIds: sameMealIds,
        foodNames: [...new Set(sameMealLogs.map((l) => l.foodName))],
        mealType: log.mealType as MealPattern['mealType'],
        occurrenceCount: 1,
        firstSeen: log.date,
        lastSeen: log.date,
      });
    }
  }

  const updatedFoodMemory: UserFoodMemory = {
    ...fm,
    version: 1,
    lastUpdatedAt: new Date().toISOString(),
    foodSnapshots: updatedSnapshots,
    mealPatterns: updatedPatterns,
    recentLogs: updatedRecent,
  };

  return {
    ...snapshot,
    updatedAt: new Date().toISOString(),
    foodMemory: updatedFoodMemory,
  };
}
