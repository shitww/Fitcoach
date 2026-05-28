// ── Food Knowledge Pack Index ────────────────────────────────────────────────
// Aggregates all food definitions into a single searchable registry.
// ─────────────────────────────────────────────────────────────────────────────

import { proteinFoods } from './protein';
import { carbFoods } from './carbs';
import { fatFoods } from './fats';
import { drinkFoods } from './drinks';
import { mealFoods } from './meals';
import { snackFoods } from './snacks';
import type { Food } from '@/types/food';

export const ALL_FOODS: readonly Food[] = [
  ...proteinFoods,
  ...carbFoods,
  ...fatFoods,
  ...drinkFoods,
  ...mealFoods,
  ...snackFoods,
] as const;

/** Food count by category. */
export const FOOD_COUNT_BY_CATEGORY: Record<string, number> = {
  protein_source: proteinFoods.length,
  grain: carbFoods.filter((f) => f.category === 'grain').length,
  vegetable: carbFoods.filter((f) => f.category === 'vegetable').length,
  fruit: carbFoods.filter((f) => f.category === 'fruit').length,
  fat_source: fatFoods.filter((f) => f.category === 'fat_source').length,
  nuts_seeds: fatFoods.filter((f) => f.category === 'nuts_seeds').length,
  dairy: [...proteinFoods, ...fatFoods, ...drinkFoods].filter((f) => f.category === 'dairy').length,
  beverage: drinkFoods.filter((f) => f.category === 'beverage').length,
  supplement: [...proteinFoods, ...drinkFoods].filter((f) => f.category === 'supplement').length,
  meal_prep: mealFoods.filter((f) => f.category === 'meal_prep').length,
  fast_food: mealFoods.filter((f) => f.category === 'fast_food').length,
  snack: snackFoods.filter((f) => f.category === 'snack').length,
};

/** Total food count. */
export const TOTAL_FOOD_COUNT = ALL_FOODS.length;

/** Fast lookup map by food ID. */
export const FOOD_BY_ID: Readonly<Record<string, Food>> = Object.fromEntries(
  ALL_FOODS.map((f) => [f.id, f])
);

/** All unique food IDs. */
export const ALL_FOOD_IDS: readonly string[] = ALL_FOODS.map((f) => f.id);

/** Get a food by its stable ID. */
export function getFoodById(id: string): Food | undefined {
  return FOOD_BY_ID[id];
}

/** Get foods by category. */
export function getFoodsByCategory(category: string): Food[] {
  return ALL_FOODS.filter((f) => f.category === category);
}

/** Get foods by tag. */
export function getFoodsByTag(tag: string): Food[] {
  return ALL_FOODS.filter((f) => f.tags.includes(tag));
}

/** Get foods commonly served by a restaurant brand. */
export function getFoodsByBrand(brand: string): Food[] {
  return ALL_FOODS.filter(
    (f) => f.restaurantBrands?.includes(brand as never) ?? false
  );
}

/** Get all unique tags across the food database. */
export function getAllFoodTags(): string[] {
  const tagSet = new Set<string>();
  for (const food of ALL_FOODS) {
    for (const tag of food.tags) {
      tagSet.add(tag);
    }
  }
  return Array.from(tagSet).sort();
}

/** Re-export individual files for tree-shaking consumers. */
export {
  proteinFoods,
  carbFoods,
  fatFoods,
  drinkFoods,
  mealFoods,
  snackFoods,
};
