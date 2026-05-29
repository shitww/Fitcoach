// ── Optimize Keyboard Flow ────────────────────────────────────────────────────
// Mobile keyboard configuration and field transition optimization.
// ─────────────────────────────────────────────────────────────────────────────

import type { InputIntent } from '@/types/frictionless-runtime';

/** Keyboard type for each input intent (maps to HTML inputmode). */
export type KeyboardType = 'numeric' | 'decimal' | 'text' | 'search';

/** Return type config for HTML input field optimization. */
export interface KeyboardConfig {
  inputMode: KeyboardType;
  pattern: string | null;
  autocomplete: string;
  enterKeyHint: 'done' | 'next' | 'go' | 'search' | 'send';
  selectAllOnFocus: boolean;
  clearOnSubmit: boolean;
}

/** Get optimal keyboard configuration for a given input intent.
 *  Minimizes taps needed to enter a value on mobile.
 */
export function getKeyboardConfig(intent: InputIntent): KeyboardConfig {
  switch (intent) {
    case 'weight_kg':
    case 'weight_lb':
      return {
        inputMode: 'decimal',
        pattern: '[0-9]*\\.?[0-9]*',
        autocomplete: 'off',
        enterKeyHint: 'next',
        selectAllOnFocus: true, // select existing value to replace
        clearOnSubmit: false,
      };

    case 'reps':
      return {
        inputMode: 'numeric',
        pattern: '[0-9]*',
        autocomplete: 'off',
        enterKeyHint: 'done',
        selectAllOnFocus: true,
        clearOnSubmit: false,
      };

    case 'rpe':
    case 'rir':
      return {
        inputMode: 'decimal',
        pattern: '[0-9]*\\.?[0-9]?',
        autocomplete: 'off',
        enterKeyHint: 'done',
        selectAllOnFocus: true,
        clearOnSubmit: false,
      };

    case 'exercise_name':
      return {
        inputMode: 'text',
        pattern: null,
        autocomplete: 'off',
        enterKeyHint: 'search',
        selectAllOnFocus: false,
        clearOnSubmit: true,
      };

    case 'food_name':
      return {
        inputMode: 'text',
        pattern: null,
        autocomplete: 'off',
        enterKeyHint: 'done',
        selectAllOnFocus: false,
        clearOnSubmit: true,
      };

    case 'serving_size':
      return {
        inputMode: 'decimal',
        pattern: '[0-9]*\\.?[0-9]*',
        autocomplete: 'off',
        enterKeyHint: 'done',
        selectAllOnFocus: true,
        clearOnSubmit: false,
      };

    case 'duration_min':
      return {
        inputMode: 'numeric',
        pattern: '[0-9]*',
        autocomplete: 'off',
        enterKeyHint: 'done',
        selectAllOnFocus: true,
        clearOnSubmit: false,
      };

    default:
      return {
        inputMode: 'text',
        pattern: null,
        autocomplete: 'off',
        enterKeyHint: 'next',
        selectAllOnFocus: false,
        clearOnSubmit: false,
      };
  }
}

/** Determine what happens after submitting the current field.
 *  Returns the ID of the next field to focus.
 */
export function getNextFieldFocus(
  currentField: 'weight' | 'reps' | 'rir' | 'notes',
  hasRirField: boolean
): 'weight' | 'reps' | 'rir' | 'done' {
  switch (currentField) {
    case 'weight':
      return 'reps';
    case 'reps':
      return hasRirField ? 'rir' : 'done';
    case 'rir':
      return 'done';
    default:
      return 'done';
  }
}
