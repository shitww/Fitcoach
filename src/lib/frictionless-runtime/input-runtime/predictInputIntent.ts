// ── Predict Input Intent ──────────────────────────────────────────────────────
// Real-time prediction of what the user is trying to input.
// ─────────────────────────────────────────────────────────────────────────────

import type { InputIntentPrediction } from '@/types/frictionless-runtime';
import { detectInputIntent } from './detectLoggingIntent';
import { buildInlineSuggestions } from './buildInlineSuggestions';

export interface PredictIntentInput {
  rawInput: string;
  isInWorkout: boolean;
  context: 'set_logging' | 'food_logging' | 'exercise_search' | 'general';
  recentWeights: number[];
  recentReps: number[];
  recentFoods: string[];
  exerciseNames: string[];
}

/** Auto-fill confidence threshold — above this, apply suggestion immediately. */
const AUTO_FILL_THRESHOLD = 0.9;

/** Predict what the user is trying to input and generate suggestions.
 *  Called on every keystroke — must be synchronous and lightweight.
 */
export function predictInputIntent(
  input: PredictIntentInput
): InputIntentPrediction {
  const { rawInput, isInWorkout, context } = input;
  const trimmed = rawInput.trim();

  if (trimmed.length === 0) {
    return {
      rawInput,
      detectedIntent: 'unknown',
      intentConfidence: 0,
      suggestions: [],
      bestMatch: null,
      context,
      shouldAutoFill: false,
    };
  }

  const { intent, confidence } = detectInputIntent(trimmed, context, isInWorkout);

  const suggestions = buildInlineSuggestions({
    rawInput: trimmed,
    intent,
    recentWeights: input.recentWeights,
    recentReps: input.recentReps,
    recentFoods: input.recentFoods,
    exerciseNames: input.exerciseNames,
    context,
  });

  const bestMatch = suggestions[0] ?? null;
  const shouldAutoFill =
    bestMatch !== null &&
    bestMatch.autofillable &&
    confidence >= AUTO_FILL_THRESHOLD &&
    bestMatch.confidence >= AUTO_FILL_THRESHOLD;

  return {
    rawInput,
    detectedIntent: intent,
    intentConfidence: confidence,
    suggestions,
    bestMatch,
    context,
    shouldAutoFill,
  };
}
