export type { WorkoutDay, FoodLogDay, UserNutritionSettings, HealthSnapshot, FatigueResult, InjuryRiskResult, NutritionAnalysis } from './types';
export { calculateFatigue } from './fatigue';
export { assessInjuryRisk } from './injury-risk';
export { analyzeNutrition } from './nutrition-model';

import { calculateFatigue } from './fatigue';
import { assessInjuryRisk } from './injury-risk';
import { analyzeNutrition } from './nutrition-model';
import type { WorkoutDay, FoodLogDay, UserNutritionSettings, HealthSnapshot } from './types';

/**
 * Compute the full health snapshot in one call.
 * Reuses intermediate results (ACWR, monotony) between fatigue and injury-risk models.
 */
export function getHealthSnapshot(
  workouts: WorkoutDay[],
  foodLogs: FoodLogDay[],
  settings: UserNutritionSettings,
  actualTrainingDaysPerWeek?: number,
): HealthSnapshot {
  const fatigue = calculateFatigue(workouts);
  const injuryRisk = assessInjuryRisk(workouts, fatigue.acwr, fatigue.monotony);
  const nutrition = analyzeNutrition(foodLogs, settings, actualTrainingDaysPerWeek);

  return { fatigue, injuryRisk, nutrition, generatedAt: new Date() };
}
