// ── Detect Logging Intent ─────────────────────────────────────────────────────
// Determines whether the user is about to log a set, food, or other data.
// ─────────────────────────────────────────────────────────────────────────────

import type { InputIntentPrediction } from '@/types/frictionless-runtime';

export type LoggingContext = 'set_logging' | 'food_logging' | 'exercise_search' | 'general';

export interface IntentDetectionInput {
  rawInput: string;
  context: LoggingContext;
  isInWorkout: boolean;
  recentWeights: number[];   // last weights used in session
  recentReps: number[];      // last reps used in session
}

/** Numeric patterns for weight and rep detection. */
const WEIGHT_PATTERN = /^\d{1,3}(?:\.\d{1,2})?(?:kg|lbs?)?$/i;
const REPS_PATTERN = /^\d{1,2}(?:reps?|次)?$/i;
const RPE_PATTERN = /^@\d(?:\.\d)?$|^rpe\s?\d(?:\.\d)?$/i;
const RIR_PATTERN = /^\d\s?rir$|^rir\s?\d$/i;
const CHINESE_FOOD_PATTERN = /[\u4e00-\u9fff]/;
const FOOD_KEYWORD_PATTERN = /ate|had|drank|breakfast|lunch|dinner|snack|food|吃|喝|早|午|晚|饮食/i;

/** Detect what type of data the user is likely logging.
 *  Context-sensitive: in-workout context biases toward set data.
 */
export function detectLoggingIntent(
  input: IntentDetectionInput
): LoggingContext {
  const { rawInput, context, isInWorkout } = input;
  const trimmed = rawInput.trim();

  // Food signals
  if (CHINESE_FOOD_PATTERN.test(trimmed)) return 'food_logging';
  if (FOOD_KEYWORD_PATTERN.test(trimmed)) return 'food_logging';

  // In workout — bias to set logging for numeric input
  if (isInWorkout) {
    if (WEIGHT_PATTERN.test(trimmed)) return 'set_logging';
    if (REPS_PATTERN.test(trimmed)) return 'set_logging';
    if (RPE_PATTERN.test(trimmed)) return 'set_logging';
    if (RIR_PATTERN.test(trimmed)) return 'set_logging';
  }

  // Exercise search
  if (trimmed.length >= 3 && /[a-zA-Z]/.test(trimmed) && !isInWorkout) {
    return 'exercise_search';
  }

  return context;
}

/** Determine input intent with confidence score. */
export function detectInputIntent(
  raw: string,
  context: LoggingContext,
  isInWorkout: boolean
): { intent: InputIntentPrediction['detectedIntent']; confidence: number } {
  const trimmed = raw.trim();
  const num = parseFloat(trimmed);

  if (!isNaN(num)) {
    if (isInWorkout) {
      // Heuristic: weight > 20 usually, reps < 30 always
      if (num > 20 && num <= 300) {
        return { intent: 'weight_kg', confidence: 0.8 };
      }
      if (num >= 1 && num <= 30) {
        return { intent: 'reps', confidence: 0.75 };
      }
    }
    if (context === 'food_logging') {
      return { intent: 'serving_size', confidence: 0.6 };
    }
  }

  if (/kg$/i.test(trimmed)) return { intent: 'weight_kg', confidence: 0.95 };
  if (/lbs?$/i.test(trimmed)) return { intent: 'weight_lb', confidence: 0.95 };
  if (/reps?$/i.test(trimmed) || /次$/.test(trimmed)) return { intent: 'reps', confidence: 0.9 };
  if (RPE_PATTERN.test(trimmed)) return { intent: 'rpe', confidence: 0.9 };
  if (RIR_PATTERN.test(trimmed)) return { intent: 'rir', confidence: 0.9 };
  if (CHINESE_FOOD_PATTERN.test(trimmed)) return { intent: 'food_name', confidence: 0.85 };
  if (FOOD_KEYWORD_PATTERN.test(trimmed)) return { intent: 'food_name', confidence: 0.7 };
  if (/min$/i.test(trimmed)) return { intent: 'duration_min', confidence: 0.9 };

  if (trimmed.length >= 3 && /[a-zA-Z]/.test(trimmed)) {
    return { intent: context === 'food_logging' ? 'food_name' : 'exercise_name', confidence: 0.6 };
  }

  return { intent: 'unknown', confidence: 0.1 };
}
