// ── Food Schema Validation ────────────────────────────────────────────────────
// Runtime validators for food data integrity.
// Catches missing fields, invalid taxonomy values, and malformed nutrition.
// ─────────────────────────────────────────────────────────────────────────────

import { FOOD_CATEGORIES } from '@/lib/fitness-taxonomy';
import { ALL_FOODS } from '@/data/foods';
import type { Food } from '@/types/food';

const VALID_CATEGORIES = new Set<string>(FOOD_CATEGORIES);

export interface FoodValidationError {
  field: string;
  message: string;
  foodId?: string;
}

export interface FoodValidationResult {
  valid: boolean;
  errors: FoodValidationError[];
}

/** Validate a single food object against the schema and taxonomy. */
export function validateFood(food: Food): FoodValidationResult {
  const errors: FoodValidationError[] = [];
  const id = food.id;

  // Required string fields
  if (!food.id || typeof food.id !== 'string') {
    errors.push({ field: 'id', message: 'Missing or invalid id', foodId: id });
  }
  if (!food.name || typeof food.name !== 'string') {
    errors.push({ field: 'name', message: 'Missing or invalid name', foodId: id });
  }

  // Arrays
  if (!Array.isArray(food.aliases) || food.aliases.length === 0) {
    errors.push({ field: 'aliases', message: 'Must be a non-empty array', foodId: id });
  }
  if (!Array.isArray(food.servingSizes) || food.servingSizes.length === 0) {
    errors.push({ field: 'servingSizes', message: 'Must be a non-empty array', foodId: id });
  }
  if (!Array.isArray(food.tags) || food.tags.length === 0) {
    errors.push({ field: 'tags', message: 'Must be a non-empty array', foodId: id });
  }

  // Category
  if (!VALID_CATEGORIES.has(food.category)) {
    errors.push({ field: 'category', message: `Invalid value: ${food.category}`, foodId: id });
  }

  // Nutrition per 100g
  const n = food.nutritionPer100g;
  if (!n || typeof n !== 'object') {
    errors.push({ field: 'nutritionPer100g', message: 'Missing nutrition object', foodId: id });
  } else {
    if (typeof n.calories !== 'number' || n.calories < 0) {
      errors.push({ field: 'nutritionPer100g.calories', message: 'Must be a non-negative number', foodId: id });
    }
    if (typeof n.protein !== 'number' || n.protein < 0) {
      errors.push({ field: 'nutritionPer100g.protein', message: 'Must be a non-negative number', foodId: id });
    }
    if (typeof n.carbs !== 'number' || n.carbs < 0) {
      errors.push({ field: 'nutritionPer100g.carbs', message: 'Must be a non-negative number', foodId: id });
    }
    if (typeof n.fat !== 'number' || n.fat < 0) {
      errors.push({ field: 'nutritionPer100g.fat', message: 'Must be a non-negative number', foodId: id });
    }
    // Optional fields: if present, must be non-negative numbers
    if (n.fiber !== undefined && (typeof n.fiber !== 'number' || n.fiber < 0)) {
      errors.push({ field: 'nutritionPer100g.fiber', message: 'Must be a non-negative number', foodId: id });
    }
    if (n.sugar !== undefined && (typeof n.sugar !== 'number' || n.sugar < 0)) {
      errors.push({ field: 'nutritionPer100g.sugar', message: 'Must be a non-negative number', foodId: id });
    }
    if (n.sodiumMg !== undefined && (typeof n.sodiumMg !== 'number' || n.sodiumMg < 0)) {
      errors.push({ field: 'nutritionPer100g.sodiumMg', message: 'Must be a non-negative number', foodId: id });
    }
  }

  // Serving sizes validation
  for (let i = 0; i < food.servingSizes.length; i++) {
    const s = food.servingSizes[i];
    if (!s.label || typeof s.label !== 'string') {
      errors.push({ field: `servingSizes[${i}].label`, message: 'Missing label', foodId: id });
    }
    if (typeof s.weightGrams !== 'number' || s.weightGrams <= 0) {
      errors.push({ field: `servingSizes[${i}].weightGrams`, message: 'Must be a positive number', foodId: id });
    }
  }

  // Boolean
  if (typeof food.isCommon !== 'boolean') {
    errors.push({ field: 'isCommon', message: 'Must be a boolean', foodId: id });
  }

  // Restaurant brands (optional) — validate type if present
  if (food.restaurantBrands !== undefined && !Array.isArray(food.restaurantBrands)) {
    errors.push({ field: 'restaurantBrands', message: 'Must be an array if provided', foodId: id });
  }

  // giCategory optional enum
  if (food.giCategory !== undefined && !['low', 'medium', 'high'].includes(food.giCategory)) {
    errors.push({ field: 'giCategory', message: `Invalid value: ${food.giCategory}`, foodId: id });
  }

  return { valid: errors.length === 0, errors };
}

/** Validate the entire food database. */
export function validateAllFoods(): FoodValidationResult {
  const allErrors: FoodValidationError[] = [];

  for (const food of ALL_FOODS) {
    const result = validateFood(food);
    allErrors.push(...result.errors);
  }

  return { valid: allErrors.length === 0, errors: allErrors };
}
