// ── Extract Food Candidates ───────────────────────────────────────────────────
// Tokenizes natural language food input and matches to food database.
// Deterministic, no AI. Supports Chinese + English mixed input.
// ─────────────────────────────────────────────────────────────────────────────

import type { ParsedFoodCandidate } from '@/types/frictionless-runtime';

export interface FoodEntry {
  id: string;
  name: string;            // canonical name (display)
  nameEn: string;          // English canonical
  nameZh: string;          // Chinese canonical
  aliases: string[];       // all recognized aliases
  caloriePerServing: number;
  servingLabel: string;    // e.g. "1 bowl", "1 cup", "100g"
  servingGrams: number | null;
  macros: { proteinG: number; carbsG: number; fatG: number } | null;
  category: string;
}

/** Canonical food database — deterministic, no external API.
 *  Covers common Chinese and English foods.
 */
export const FOOD_DATABASE: FoodEntry[] = [
  // ── Chinese Dishes ───────────────────────────────────────────────────
  {
    id: 'beef_noodle_zh', name: '牛肉面', nameEn: 'Beef Noodle Soup', nameZh: '牛肉面',
    aliases: ['beef noodles', '牛肉汤面', '红烧牛肉面', '台湾牛肉面'],
    caloriePerServing: 550, servingLabel: '1 bowl', servingGrams: 450,
    macros: { proteinG: 28, carbsG: 75, fatG: 12 }, category: 'noodles',
  },
  {
    id: 'bubble_tea', name: '珍珠奶茶', nameEn: 'Bubble Tea', nameZh: '珍珠奶茶',
    aliases: ['boba', 'boba tea', '奶茶', '珍珠茶', 'milk tea', '全糖奶茶', '半糖奶茶'],
    caloriePerServing: 350, servingLabel: '1 cup (700ml)', servingGrams: 700,
    macros: { proteinG: 4, carbsG: 65, fatG: 8 }, category: 'beverage',
  },
  {
    id: 'rice_white', name: '白饭', nameEn: 'White Rice', nameZh: '白饭',
    aliases: ['米饭', '白米饭', '蒸饭', 'white rice', 'steamed rice', '饭'],
    caloriePerServing: 206, servingLabel: '1 bowl (180g)', servingGrams: 180,
    macros: { proteinG: 4, carbsG: 45, fatG: 0 }, category: 'grains',
  },
  {
    id: 'egg_fried_rice', name: '蛋炒饭', nameEn: 'Egg Fried Rice', nameZh: '蛋炒饭',
    aliases: ['fried rice', '炒饭', '扬州炒饭'],
    caloriePerServing: 420, servingLabel: '1 plate', servingGrams: 300,
    macros: { proteinG: 12, carbsG: 58, fatG: 16 }, category: 'rice',
  },
  {
    id: 'dumplings', name: '饺子', nameEn: 'Dumplings', nameZh: '饺子',
    aliases: ['jiaozi', '水饺', '锅贴', 'potstickers', 'gyoza', '煎饺'],
    caloriePerServing: 350, servingLabel: '10 pieces', servingGrams: 200,
    macros: { proteinG: 16, carbsG: 42, fatG: 12 }, category: 'dumplings',
  },
  {
    id: 'hotpot', name: '火锅', nameEn: 'Hot Pot', nameZh: '火锅',
    aliases: ['hot pot', '麻辣火锅', '清汤火锅', '涮锅'],
    caloriePerServing: 700, servingLabel: '1 session', servingGrams: 600,
    macros: { proteinG: 40, carbsG: 60, fatG: 28 }, category: 'chinese',
  },
  {
    id: 'congee', name: '粥', nameEn: 'Congee', nameZh: '粥',
    aliases: ['porridge', '白粥', '皮蛋粥', '瘦肉粥', '稀饭'],
    caloriePerServing: 150, servingLabel: '1 bowl', servingGrams: 350,
    macros: { proteinG: 5, carbsG: 30, fatG: 2 }, category: 'chinese',
  },
  {
    id: 'steamed_bun', name: '包子', nameEn: 'Steamed Bun', nameZh: '包子',
    aliases: ['bao', '馒头', '肉包', '叉烧包', 'baozi'],
    caloriePerServing: 220, servingLabel: '1 piece (80g)', servingGrams: 80,
    macros: { proteinG: 8, carbsG: 35, fatG: 6 }, category: 'chinese',
  },
  // ── Western / International ──────────────────────────────────────────
  {
    id: 'chicken_breast', name: 'Chicken Breast', nameEn: 'Chicken Breast', nameZh: '鸡胸肉',
    aliases: ['chicken', '鸡肉', '鸡胸', 'grilled chicken', 'cooked chicken'],
    caloriePerServing: 165, servingLabel: '100g', servingGrams: 100,
    macros: { proteinG: 31, carbsG: 0, fatG: 4 }, category: 'protein',
  },
  {
    id: 'egg', name: 'Egg', nameEn: 'Egg', nameZh: '鸡蛋',
    aliases: ['eggs', '蛋', '水煮蛋', '荷包蛋', '煎蛋', 'boiled egg', 'fried egg'],
    caloriePerServing: 78, servingLabel: '1 large egg', servingGrams: 50,
    macros: { proteinG: 6, carbsG: 1, fatG: 5 }, category: 'protein',
  },
  {
    id: 'banana', name: 'Banana', nameEn: 'Banana', nameZh: '香蕉',
    aliases: ['bananas', '香蕉'],
    caloriePerServing: 105, servingLabel: '1 medium', servingGrams: 120,
    macros: { proteinG: 1, carbsG: 27, fatG: 0 }, category: 'fruit',
  },
  {
    id: 'oatmeal', name: 'Oatmeal', nameEn: 'Oatmeal', nameZh: '燕麦粥',
    aliases: ['oats', '燕麦', '麦片', 'porridge oats', '隔夜燕麦'],
    caloriePerServing: 158, servingLabel: '1 bowl (40g dry)', servingGrams: 40,
    macros: { proteinG: 6, carbsG: 27, fatG: 3 }, category: 'grains',
  },
  {
    id: 'protein_shake', name: 'Protein Shake', nameEn: 'Protein Shake', nameZh: '蛋白粉',
    aliases: ['whey', 'whey protein', '乳清蛋白', '蛋白', '增肌粉'],
    caloriePerServing: 130, servingLabel: '1 scoop (30g)', servingGrams: 30,
    macros: { proteinG: 25, carbsG: 4, fatG: 2 }, category: 'supplement',
  },
  {
    id: 'salad', name: 'Salad', nameEn: 'Salad', nameZh: '沙拉',
    aliases: ['green salad', '蔬菜沙拉', '沙律', 'vegetable salad'],
    caloriePerServing: 120, servingLabel: '1 bowl', servingGrams: 200,
    macros: { proteinG: 3, carbsG: 12, fatG: 6 }, category: 'vegetables',
  },
  {
    id: 'pizza', name: 'Pizza', nameEn: 'Pizza', nameZh: '披萨',
    aliases: ['pizza', '比萨', '批萨'],
    caloriePerServing: 285, servingLabel: '1 slice', servingGrams: 107,
    macros: { proteinG: 12, carbsG: 36, fatG: 10 }, category: 'western',
  },
  {
    id: 'coffee', name: 'Coffee', nameEn: 'Coffee', nameZh: '咖啡',
    aliases: ['latte', 'americano', '拿铁', '美式', '咖啡', 'cappuccino', '卡布奇诺'],
    caloriePerServing: 20, servingLabel: '1 cup', servingGrams: 240,
    macros: { proteinG: 1, carbsG: 3, fatG: 0 }, category: 'beverage',
  },
  {
    id: 'rice_noodle', name: '米粉', nameEn: 'Rice Noodles', nameZh: '米粉',
    aliases: ['rice noodle', '河粉', '粿条', 'pho', '越南粉', 'flat rice noodle'],
    caloriePerServing: 320, servingLabel: '1 bowl', servingGrams: 300,
    macros: { proteinG: 10, carbsG: 60, fatG: 5 }, category: 'noodles',
  },
  {
    id: 'bread', name: 'Bread', nameEn: 'Bread', nameZh: '面包',
    aliases: ['toast', 'whole wheat bread', '吐司', '全麦面包', '白面包', 'slice of bread'],
    caloriePerServing: 80, servingLabel: '1 slice', servingGrams: 30,
    macros: { proteinG: 3, carbsG: 15, fatG: 1 }, category: 'grains',
  },
];

/** Build a lookup index for O(1) matching. */
function buildAliasIndex(db: FoodEntry[]): Map<string, FoodEntry> {
  const index = new Map<string, FoodEntry>();
  for (const entry of db) {
    index.set(normalize(entry.name), entry);
    index.set(normalize(entry.nameEn), entry);
    index.set(normalize(entry.nameZh), entry);
    for (const alias of entry.aliases) {
      index.set(normalize(alias), entry);
    }
  }
  return index;
}

const ALIAS_INDEX = buildAliasIndex(FOOD_DATABASE);

/** Normalize text for matching: lowercase, trim, remove punctuation. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[，,。.！!？?、\s]+/g, ' ')
    .trim();
}

/** Extract food candidates from a tokenized list of strings. */
export function extractFoodCandidates(
  tokens: string[]
): ParsedFoodCandidate[] {
  const results: ParsedFoodCandidate[] = [];
  const matchedIds = new Set<string>();

  for (const token of tokens) {
    const norm = normalize(token);

    // Exact match
    const exactMatch = ALIAS_INDEX.get(norm);
    if (exactMatch && !matchedIds.has(exactMatch.id)) {
      matchedIds.add(exactMatch.id);
      results.push(buildCandidate(exactMatch, token, 'exact', exactMatch.name));
      continue;
    }

    // Partial / substring match
    for (const [key, entry] of ALIAS_INDEX) {
      if (matchedIds.has(entry.id)) continue;
      if (key.includes(norm) || norm.includes(key)) {
        if (key.length >= 2 && norm.length >= 2) {
          matchedIds.add(entry.id);
          results.push(buildCandidate(entry, token, 'partial', key));
          break;
        }
      }
    }
  }

  return results;
}

function buildCandidate(
  entry: FoodEntry,
  originalToken: string,
  matchType: ParsedFoodCandidate['matchType'],
  matchedAlias: string
): ParsedFoodCandidate {
  const lang: ParsedFoodCandidate['language'] = /[\u4e00-\u9fff]/.test(originalToken)
    ? /[a-zA-Z]/.test(originalToken) ? 'mixed' : 'zh'
    : 'en';

  return {
    id: entry.id,
    name: entry.nameEn,
    nameOriginal: originalToken,
    nameDisplay: entry.name,
    language: lang,
    servingSize: entry.servingLabel,
    servingGrams: entry.servingGrams,
    calorieEstimate: entry.caloriePerServing,
    macros: entry.macros,
    confidence: matchType === 'exact' ? 0.95 : matchType === 'alias' ? 0.85 : 0.65,
    matchedAlias,
    matchType,
  };
}
