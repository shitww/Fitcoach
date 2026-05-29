// ── Parse Food Text ───────────────────────────────────────────────────────────
// Top-level entry: converts natural language to structured food candidates.
// Deterministic. No AI. Supports Chinese + English.
// ─────────────────────────────────────────────────────────────────────────────

import type { FoodParseResult, ParsedFoodCandidate } from '@/types/frictionless-runtime';
import { extractFoodCandidates } from './extractFoodCandidates';
import { estimateFoodServing } from './estimateFoodServing';

/** Common separators in natural language food descriptions. */
const SEPARATORS = /[，,、和and与with;；\s]+/;

/** Noise words that should not be matched as foods. */
const STOP_WORDS = new Set([
  '吃了', '吃', '喝了', '喝', '今天', '昨天', '早上', '中午', '下午', '晚上',
  '早餐', '午餐', '晚餐', '加餐', '餐后', '运动后', '训练前', '训练后',
  'ate', 'had', 'drank', 'drink', 'ate', 'breakfast', 'lunch', 'dinner',
  'today', 'yesterday', 'morning', 'afternoon', 'evening', 'after workout',
  'before workout', 'post', 'pre',
]);

/** Parse free-form food input into structured candidates.
 *
 * Example:
 *   "中午吃了牛肉面和奶茶"
 *   → [{ name: '牛肉面', cal: 550 }, { name: '珍珠奶茶', cal: 350 }]
 */
export function parseFoodText(rawInput: string): FoodParseResult {
  const normalized = rawInput.trim();
  const hasMixedLanguage = /[\u4e00-\u9fff]/.test(normalized) && /[a-zA-Z]/.test(normalized);

  // 1. Tokenize
  const rawTokens = normalized.split(SEPARATORS).map((t) => t.trim()).filter(Boolean);

  // 2. Remove stop words
  const meaningfulTokens = rawTokens.filter((t) => !STOP_WORDS.has(t.toLowerCase()));

  // 3. Extract food candidates
  const rawCandidates = extractFoodCandidates(meaningfulTokens);

  // 4. Enrich with serving estimates
  const enriched: ParsedFoodCandidate[] = rawCandidates.map((c) => {
    const matchingToken = findMatchingToken(meaningfulTokens, c.nameOriginal);
    const { adjustedCalories } = estimateFoodServing(matchingToken, c.calorieEstimate);
    return { ...c, calorieEstimate: adjustedCalories };
  });

  // 5. Identify unparsed tokens
  const matchedOriginals = new Set(rawCandidates.map((c) => c.nameOriginal));
  const unparsedTokens = meaningfulTokens.filter(
    (t) => !matchedOriginals.has(t) && t.length >= 2
  );

  const totalCalories = enriched.reduce((sum, c) => sum + c.calorieEstimate, 0);
  const parseConfidence = enriched.length > 0
    ? enriched.reduce((sum, c) => sum + c.confidence, 0) / enriched.length
    : 0;

  return {
    rawInput: normalized,
    candidates: enriched,
    totalCalorieEstimate: totalCalories,
    parseConfidence,
    unparsedTokens,
    hasMixedLanguage,
  };
}

function findMatchingToken(tokens: string[], original: string): string {
  return tokens.find((t) => t.includes(original) || original.includes(t)) ?? original;
}
