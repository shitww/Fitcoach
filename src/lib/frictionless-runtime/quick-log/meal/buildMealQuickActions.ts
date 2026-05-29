// ── Build Meal Quick Actions ──────────────────────────────────────────────────
// Assembles the complete quick meal panel for a given meal time.
// ─────────────────────────────────────────────────────────────────────────────

import type { QuickMealPanel, MealTime } from '@/types/frictionless-runtime';
import type { UserFoodMemory } from '@/types/workout-memory';
import { generateRecentMealSuggestions, generateRepeatYesterdayOption } from './generateRecentMealSuggestions';
import { generateFrequentMealPatterns } from './generateFrequentMealPatterns';

/** Build the complete quick meal panel for a given meal time context.
 *  Combines recent, frequent, and repeat-yesterday options.
 */
export function buildMealQuickActions(
  foodMemory: UserFoodMemory,
  mealTime: MealTime
): QuickMealPanel {
  const recentSuggestions = generateRecentMealSuggestions(foodMemory, mealTime, 3);
  const frequentPatterns = generateFrequentMealPatterns(foodMemory, mealTime, 3);
  const repeatYesterdayOption = generateRepeatYesterdayOption(foodMemory, mealTime);

  const hasHistory = recentSuggestions.length > 0 || frequentPatterns.length > 0;

  return {
    mealTime,
    recentSuggestions,
    frequentPatterns,
    repeatYesterdayOption,
    showFoodInput: true,
    inputPlaceholder: buildPlaceholder(mealTime, hasHistory),
  };
}

function buildPlaceholder(mealTime: MealTime, hasHistory: boolean): string {
  if (!hasHistory) {
    const examples: Record<MealTime, string> = {
      breakfast: '早餐吃了什么？ e.g. 燕麦 鸡蛋',
      lunch: '午餐吃了什么？ e.g. 牛肉面 奶茶',
      dinner: '晚餐吃了什么？ e.g. 米饭 鸡胸肉',
      snack: '加餐？ e.g. 香蕉 蛋白粉',
      pre_workout: '训练前吃了？ e.g. 香蕉 蛋白粉',
      post_workout: '训练后吃了？ e.g. 蛋白粉 米饭',
    };
    return examples[mealTime] ?? '今天吃了什么？';
  }

  return '或输入其他食物...';
}
