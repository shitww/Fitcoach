// ── Build Inline Suggestions ──────────────────────────────────────────────────
// Generates real-time autocomplete options as the user types.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  InlineInputSuggestion,
  InputIntent,
} from '@/types/frictionless-runtime';

export interface InlineSuggestionInput {
  rawInput: string;
  intent: InputIntent;
  recentWeights: number[];
  recentReps: number[];
  recentFoods: string[];
  exerciseNames: string[];
  context: 'set_logging' | 'food_logging' | 'exercise_search' | 'general';
}

/** Build inline suggestions based on detected intent + user history.
 *  All suggestions come from local data — no network calls.
 */
export function buildInlineSuggestions(
  input: InlineSuggestionInput
): InlineInputSuggestion[] {
  const { rawInput, intent, context } = input;
  const trimmed = rawInput.trim();

  switch (intent) {
    case 'weight_kg':
      return buildWeightSuggestions(trimmed, input.recentWeights);
    case 'reps':
      return buildRepSuggestions(trimmed, input.recentReps);
    case 'food_name':
      return buildFoodSuggestions(trimmed, input.recentFoods);
    case 'exercise_name':
      return buildExerciseSuggestions(trimmed, input.exerciseNames);
    case 'weight_lb':
      return buildWeightLbSuggestions(trimmed);
    default:
      return buildContextualSuggestions(context, input);
  }
}

function buildWeightSuggestions(
  raw: string,
  recentWeights: number[]
): InlineInputSuggestion[] {
  const num = parseFloat(raw);
  const suggestions: InlineInputSuggestion[] = [];

  // Exact input as kg
  if (!isNaN(num) && num > 0) {
    suggestions.push({
      value: `${num}`,
      display: `${num} kg`,
      type: 'weight_kg',
      confidence: 0.95,
      autofillable: true,
      secondary: 'Set weight',
    });

    // Common increments
    for (const delta of [2.5, 5, -2.5]) {
      const candidate = roundHalf(num + delta);
      if (candidate > 0) {
        suggestions.push({
          value: `${candidate}`,
          display: `${candidate} kg ${delta > 0 ? '(heavier)' : '(lighter)'}`,
          type: 'weight_kg',
          confidence: 0.7,
          autofillable: true,
        });
      }
    }
  }

  // Recent weights that start with input
  const matchingRecent = recentWeights
    .filter((w) => w.toString().startsWith(raw))
    .slice(0, 2);

  for (const w of matchingRecent) {
    if (!suggestions.find((s) => s.value === `${w}`)) {
      suggestions.push({
        value: `${w}`,
        display: `${w} kg`,
        type: 'weight_kg',
        confidence: 0.85,
        autofillable: true,
        secondary: 'Recently used',
      });
    }
  }

  return suggestions.slice(0, 4);
}

function buildRepSuggestions(
  raw: string,
  recentReps: number[]
): InlineInputSuggestion[] {
  const num = parseInt(raw, 10);
  const suggestions: InlineInputSuggestion[] = [];

  if (!isNaN(num) && num > 0) {
    suggestions.push({
      value: `${num}`,
      display: `${num} reps`,
      type: 'reps',
      confidence: 0.95,
      autofillable: true,
      secondary: 'Set reps',
    });
  }

  // Common rep targets
  const commonReps = [5, 6, 8, 10, 12, 15];
  const matching = commonReps.filter((r) => r.toString().startsWith(raw)).slice(0, 3);

  for (const r of matching) {
    if (!suggestions.find((s) => s.value === `${r}`)) {
      suggestions.push({
        value: `${r}`,
        display: `${r} reps`,
        type: 'reps',
        confidence: 0.7,
        autofillable: true,
      });
    }
  }

  // Recent reps
  const matchingRecent = recentReps
    .filter((r) => r.toString().startsWith(raw))
    .slice(0, 2);

  for (const r of matchingRecent) {
    if (!suggestions.find((s) => s.value === `${r}`)) {
      suggestions.push({
        value: `${r}`,
        display: `${r} reps`,
        type: 'reps',
        confidence: 0.85,
        autofillable: true,
        secondary: 'Recently used',
      });
    }
  }

  return suggestions.slice(0, 4);
}

function buildFoodSuggestions(
  raw: string,
  recentFoods: string[]
): InlineInputSuggestion[] {
  const lower = raw.toLowerCase();
  return recentFoods
    .filter((f) => f.toLowerCase().includes(lower))
    .slice(0, 4)
    .map((f) => ({
      value: f,
      display: f,
      type: 'food_name' as InputIntent,
      confidence: 0.8,
      autofillable: true,
      secondary: 'Recently logged',
    }));
}

function buildExerciseSuggestions(
  raw: string,
  exerciseNames: string[]
): InlineInputSuggestion[] {
  const lower = raw.toLowerCase();
  return exerciseNames
    .filter((e) => e.toLowerCase().includes(lower))
    .slice(0, 4)
    .map((e) => ({
      value: e,
      display: e,
      type: 'exercise_name' as InputIntent,
      confidence: 0.75,
      autofillable: true,
    }));
}

function buildWeightLbSuggestions(raw: string): InlineInputSuggestion[] {
  const num = parseFloat(raw);
  if (isNaN(num)) return [];

  const kg = roundHalf(num * 0.453592);
  return [
    {
      value: `${num}`,
      display: `${num} lbs (≈ ${kg} kg)`,
      type: 'weight_lb',
      confidence: 0.9,
      autofillable: true,
    },
  ];
}

function buildContextualSuggestions(
  context: string,
  input: InlineSuggestionInput
): InlineInputSuggestion[] {
  if (context === 'set_logging' && input.recentWeights.length > 0) {
    return buildWeightSuggestions(input.rawInput, input.recentWeights);
  }
  if (context === 'food_logging' && input.recentFoods.length > 0) {
    return buildFoodSuggestions(input.rawInput, input.recentFoods);
  }
  return [];
}

function roundHalf(value: number): number {
  return Math.round(value * 2) / 2;
}
