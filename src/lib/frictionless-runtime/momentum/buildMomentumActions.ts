// ── Build Momentum Actions ────────────────────────────────────────────────────
// Generates context-aware prompts to restore training flow.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  WorkoutMomentumState,
  MomentumAction,
  MomentumStatus,
} from '@/types/frictionless-runtime';

export interface MomentumActionInput {
  status: MomentumStatus;
  dropoffRisk: number;
  setsCompleted: number;
  exercisesRemaining: number;
  restTimeElapsedSec: number;
  recommendedRestSec: number;
  isNearSessionEnd: boolean;
}

/** Build momentum-recovery actions based on current session state.
 *  Maps session signals to concrete, one-tap UI prompts.
 */
export function buildMomentumActions(
  input: MomentumActionInput
): MomentumAction[] {
  const { status, dropoffRisk, exercisesRemaining, isNearSessionEnd, restTimeElapsedSec, recommendedRestSec } = input;

  const actions: MomentumAction[] = [];
  const restComplete = restTimeElapsedSec >= recommendedRestSec;

  if (status === 'dropped') {
    // Possible session end
    if (isNearSessionEnd) {
      actions.push({
        type: 'end_session',
        label: 'Finish Workout',
        sublabel: 'You\'ve done a great session',
        urgency: 'gentle',
        enabled: true,
      });
    }
    actions.push({
      type: 'continue_set',
      label: 'I\'m Back',
      sublabel: 'Continue from where you left off',
      urgency: 'immediate',
      enabled: true,
    });
    actions.push({
      type: 'take_extended_rest',
      label: 'Extend Rest',
      sublabel: 'Take more time, resume when ready',
      urgency: 'gentle',
      enabled: true,
    });
    return actions;
  }

  if (status === 'stalled') {
    actions.push({
      type: 'continue_set',
      label: 'Ready',
      sublabel: 'Start next set when you are',
      urgency: 'immediate',
      enabled: true,
    });
    if (exercisesRemaining > 0) {
      actions.push({
        type: 'start_next_exercise',
        label: 'Skip to Next Exercise',
        sublabel: 'Keep the session moving',
        urgency: 'gentle',
        enabled: true,
      });
    }
    return actions;
  }

  if (status === 'slowing') {
    if (restComplete) {
      actions.push({
        type: 'continue_set',
        label: 'Start Set',
        sublabel: 'Rest complete — go when ready',
        urgency: 'immediate',
        enabled: true,
      });
    } else {
      actions.push({
        type: 'continue_set',
        label: 'Ready Early',
        sublabel: 'Start before timer if feeling good',
        urgency: 'gentle',
        enabled: true,
      });
    }
    return actions;
  }

  // Flowing — only show action if rest is complete
  if (status === 'flowing' && restComplete) {
    actions.push({
      type: 'quick_set',
      label: 'Start Set',
      sublabel: 'Rest complete',
      urgency: 'immediate',
      enabled: true,
    });
  }

  return actions;
}
