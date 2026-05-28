// ── Food Category Taxonomy ──────────────────────────────────────────────────
// Standardized food classifications for meal composition analysis,
// macro balancing, and quick-log intelligent suggestions.
// ─────────────────────────────────────────────────────────────────────────────

/** Primary food categories for macro group alignment. */
export const FOOD_CATEGORIES = [
  'protein_source',
  'dairy',
  'grain',
  'vegetable',
  'fruit',
  'fat_source',
  'beverage',
  'snack',
  'meal_prep',
  'fast_food',
  'supplement',
  'condiment',
  'nuts_seeds',
  'seafood',
  'egg',
] as const;

export type FoodCategory = (typeof FOOD_CATEGORIES)[number];

/** Macro group alignment — which categories are primary sources. */
export const MACRO_ALIGNMENT: Record<string, readonly FoodCategory[]> = {
  protein: ['protein_source', 'dairy', 'seafood', 'egg', 'supplement'],
  carbs: ['grain', 'fruit', 'snack', 'fast_food'],
  fat: ['fat_source', 'nuts_seeds', 'dairy'],
  fiber: ['vegetable', 'fruit', 'grain', 'nuts_seeds'],
} as const;

/** Human-readable labels (EN + CN). */
export const FOOD_CATEGORY_LABELS: Record<FoodCategory, { en: string; cn: string }> = {
  protein_source: { en: 'Protein Source', cn: '蛋白质来源' },
  dairy: { en: 'Dairy', cn: '乳制品' },
  grain: { en: 'Grain / Starch', cn: '谷物/主食' },
  vegetable: { en: 'Vegetable', cn: '蔬菜' },
  fruit: { en: 'Fruit', cn: '水果' },
  fat_source: { en: 'Fat Source', cn: '脂肪来源' },
  beverage: { en: 'Beverage', cn: '饮品' },
  snack: { en: 'Snack', cn: '零食' },
  meal_prep: { en: 'Meal / Combo', cn: '餐食/组合' },
  fast_food: { en: 'Fast Food', cn: '快餐' },
  supplement: { en: 'Supplement', cn: '补剂' },
  condiment: { en: 'Condiment', cn: '调味品' },
  nuts_seeds: { en: 'Nuts & Seeds', cn: '坚果种子' },
  seafood: { en: 'Seafood', cn: '海鲜' },
  egg: { en: 'Egg', cn: '蛋类' },
};

/** Common restaurant / fast-food brand names for quick-log search.
 *  Stored as lowercase for normalization.
 */
export const COMMON_RESTAURANT_BRANDS = [
  'mcdonalds',
  'kfc',
  'burger king',
  "wendy's",
  'starbucks',
  'subway',
  'chipotle',
  'dominos',
  'pizza hut',
  'taco bell',
  'shake shack',
  'five guys',
  'panda express',
  'chick-fil-a',
  'dunkin',
  ' Tim hortons',
  'in-n-out',
  'chiptole',
  // CN brands
  'kfc_cn',
  'mcdonalds_cn',
  'burger_king_cn',
  'dicos',
  'yonghe_king',
  'hualala',
  'jiajia_tangbao',
  'xibei',
  'haidilao',
  'meizhou_dongpo',
  'south_memory',
  'true Kungfu',
  'country_style_cooking',
  'xiabu_xiabu',
  'hey_tea',
  'luckin_coffee',
  'mixue_bingcheng',
  'cotti_coffee',
  'naixue',
  '7eleven',
  'familymart',
  'lawson',
  '便利蜂',
] as const;

export type RestaurantBrand = (typeof COMMON_RESTAURANT_BRANDS)[number];
