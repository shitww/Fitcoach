// ── Food Schema ───────────────────────────────────────────────────────────────
// Universal food definition for FitCoach Knowledge Layer.
// Optimized for fast mobile logging, not medical-grade precision.
// ─────────────────────────────────────────────────────────────────────────────

import type { FoodCategory, RestaurantBrand } from '@/lib/fitness-taxonomy';

export type { FoodCategory, RestaurantBrand };

// ── Serving & Nutrition ─────────────────────────────────────────────────────

/** A single serving size option for a food item. */
export interface ServingSize {
  /** Display label shown in the UI, e.g. "1 medium", "1 cup", "100g". */
  readonly label: string;

  /** Estimated weight in grams for this serving. */
  readonly weightGrams: number;
}

/** Nutrition values per 100g of the edible portion. */
export interface NutritionPer100g {
  readonly calories: number;
  readonly protein: number;
  readonly carbs: number;
  readonly fat: number;

  /** Optional: dietary fiber in grams. */
  readonly fiber?: number;

  /** Optional: sugar in grams. */
  readonly sugar?: number;

  /** Optional: sodium in milligrams. */
  readonly sodiumMg?: number;
}

// ── Core Food Type ────────────────────────────────────────────────────────────

/** Complete food definition — the atomic unit of the nutrition knowledge layer. */
export interface Food {
  /** Stable unique identifier. Kebeb-case, English. */
  readonly id: string;

  /** Primary display name (English, title case). */
  readonly name: string;

  /** Alternative names, slang, abbreviations, brand names, and Chinese names.
   *  All lowercase for search normalization.
   */
  readonly aliases: readonly string[];

  /** Primary food category for macro group alignment. */
  readonly category: FoodCategory;

  /** Available serving size presets. At least one required. */
  readonly servingSizes: readonly ServingSize[];

  /** Nutrition per 100g — the canonical reference point.
   *  Front-end can scale by (servingGrams / 100).
   */
  readonly nutritionPer100g: NutritionPer100g;

  /** Free-form tags for search and filtering.
   *  Examples: 'high_protein', 'low_carb', 'meal_prep_friendly', 'on_the_go'
   */
  readonly tags: readonly string[];

  /** Known restaurant / fast-food brands that serve this item.
   *  Enables brand-specific quick-log shortcuts.
   */
  readonly restaurantBrands?: readonly RestaurantBrand[];

  /** Is this a commonly logged item? Used for suggestion ranking. */
  readonly isCommon: boolean;

  /** Approximate glycemic index category (optional, for future use). */
  readonly giCategory?: 'low' | 'medium' | 'high';
}

/** Derived food summary for lightweight list views and search results. */
export interface FoodSummary {
  readonly id: string;
  readonly name: string;
  readonly aliases: readonly string[];
  readonly category: FoodCategory;
  readonly tags: readonly string[];
  readonly isCommon: boolean;
}

/** Helper: create a summary from a full food item. */
export function toFoodSummary(food: Food): FoodSummary {
  return {
    id: food.id,
    name: food.name,
    aliases: food.aliases,
    category: food.category,
    tags: food.tags,
    isCommon: food.isCommon,
  };
}
