/**
 * PlanningEngine — Public API for pre-workout plan generation.
 *
 * Phase 1 rules:
 *   beginner / intermediate / advanced → template only
 *   AI strategy = placeholder (not implemented)
 *
 * This module is the ONLY entry point for plan creation.
 * Execution UI must never import templateStrategy directly.
 */

import type { WorkoutPlan, WorkoutMode, MuscleGroup, CardioType, RecoveryFocus, FitnessLevel } from '@/types/workout-plan';
import {
  generateStrengthTemplate,
  generateCardioTemplate,
  generateRecoveryTemplate,
} from '@/lib/planning/templateStrategy';

// ── Intent contract ───────────────────────────────────────────────────────────

export interface PlanIntent {
  mode: WorkoutMode;
  level: FitnessLevel;
  durationMin: number;
  /** Required when mode === 'strength' */
  muscleGroup?: MuscleGroup;
  /** Required when mode === 'cardio' */
  cardioType?: CardioType;
  /** Required when mode === 'recovery' */
  recoveryFocus?: RecoveryFocus;
}

// ── Strategy selector (Phase 1: template-only) ─────────────────────────────

type Strategy = 'template';

function _selectStrategy(intent: PlanIntent): Strategy {
  void intent; // Phase 2: inspect level/mode to choose 'ai' strategy
  return 'template';
}

// ── Public API ────────────────────────────────────────────────────────────────

export function generatePlan(intent: PlanIntent): WorkoutPlan {
  const strategy = _selectStrategy(intent);

  if (strategy === 'template') {
    switch (intent.mode) {
      case 'strength': {
        if (!intent.muscleGroup) throw new Error('[PlanningEngine] muscleGroup required for strength mode');
        return generateStrengthTemplate({
          muscleGroup: intent.muscleGroup,
          durationMin: intent.durationMin,
          level: intent.level,
        });
      }
      case 'cardio': {
        if (!intent.cardioType) throw new Error('[PlanningEngine] cardioType required for cardio mode');
        return generateCardioTemplate({
          cardioType: intent.cardioType,
          durationMin: intent.durationMin,
          level: intent.level,
        });
      }
      case 'recovery': {
        const focus = intent.recoveryFocus ?? 'full_body';
        return generateRecoveryTemplate({
          focus,
          durationMin: intent.durationMin,
          level: intent.level,
        });
      }
    }
  }

  throw new Error(`[PlanningEngine] Unhandled strategy: ${strategy}`);
}
