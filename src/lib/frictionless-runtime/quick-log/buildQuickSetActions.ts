// ── Build Quick Set Actions ──────────────────────────────────────────────────
// Generates a one-tap action panel for the current set.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  QuickSetActionPanel,
  QuickSetAction,
  PredictedSetSuggestion,
} from '@/types/frictionless-runtime';

/** Build the complete quick action panel for a set.
 *  Returns a primary action + 2-3 alternatives. Zero keyboard required.
 */
export function buildQuickSetActions(
  prediction: PredictedSetSuggestion,
  hasPreviousSet: boolean
): QuickSetActionPanel {
  const primary = buildPrimaryAction(prediction);
  const secondaryActions = buildSecondaryActions(prediction, hasPreviousSet);

  return {
    exerciseId: prediction.exerciseId,
    setNumber: prediction.setNumber,
    primaryAction: primary,
    secondaryActions,
    prediction,
    showWeightInput: false,
    showRepsInput: false,
  };
}

function buildPrimaryAction(p: PredictedSetSuggestion): QuickSetAction {
  const label = formatSetLabel(p.suggestedWeight, p.suggestedReps, p.delta.label);

  return {
    id: `primary_${p.exerciseId}_${p.setNumber}`,
    type: p.progressionType === 'same_as_last' ? 'repeat_last'
      : p.progressionType === 'progressive_overload' ? 'increase_weight'
        : p.progressionType === 'drop_set' ? 'drop_set'
          : p.progressionType === 'warmup' ? 'warmup_set'
            : 'repeat_last',
    label,
    displayWeight: `${p.suggestedWeight} kg`,
    displayReps: `${p.suggestedReps}`,
    weight: p.suggestedWeight,
    reps: p.suggestedReps,
    rir: p.suggestedRir,
    isOneTap: true,
    confidence: p.confidence,
    reasoning: p.delta.label,
  };
}

function buildSecondaryActions(
  p: PredictedSetSuggestion,
  hasPreviousSet: boolean
): QuickSetAction[] {
  const actions: QuickSetAction[] = [];
  const increment = getIncrement(p.suggestedWeight);

  // +weight option
  actions.push({
    id: `heavy_${p.exerciseId}_${p.setNumber}`,
    type: 'increase_weight',
    label: `+${increment}kg  ×${p.suggestedReps}`,
    displayWeight: `${roundHalf(p.suggestedWeight + increment)} kg`,
    displayReps: `${p.suggestedReps}`,
    weight: roundHalf(p.suggestedWeight + increment),
    reps: p.suggestedReps,
    rir: p.suggestedRir,
    isOneTap: true,
    confidence: Math.max(0.3, p.confidence - 0.15),
    reasoning: `+${increment}kg — push harder`,
  });

  // -weight option
  actions.push({
    id: `light_${p.exerciseId}_${p.setNumber}`,
    type: 'decrease_weight',
    label: `-${increment}kg  ×${p.suggestedReps}`,
    displayWeight: `${Math.max(0, roundHalf(p.suggestedWeight - increment))} kg`,
    displayReps: `${p.suggestedReps}`,
    weight: Math.max(0, roundHalf(p.suggestedWeight - increment)),
    reps: p.suggestedReps,
    rir: p.suggestedRir,
    isOneTap: true,
    confidence: Math.max(0.3, p.confidence - 0.1),
    reasoning: `-${increment}kg — easier`,
  });

  // Custom (keyboard) option
  actions.push({
    id: `custom_${p.exerciseId}_${p.setNumber}`,
    type: 'custom',
    label: 'Custom',
    displayWeight: '—',
    displayReps: '—',
    weight: p.suggestedWeight,
    reps: p.suggestedReps,
    rir: null,
    isOneTap: false,
    confidence: 1,
    reasoning: 'Enter custom weight and reps',
  });

  return actions;
}

function formatSetLabel(weight: number, reps: number, deltaLabel: string): string {
  return `${weight}kg × ${reps}  (${deltaLabel})`;
}

function getIncrement(weight: number): number {
  if (weight >= 100) return 5;
  if (weight >= 50) return 2.5;
  return 2;
}

function roundHalf(value: number): number {
  return Math.round(value * 2) / 2;
}
