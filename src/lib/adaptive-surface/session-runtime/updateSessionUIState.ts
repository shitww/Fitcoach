// ── Update Session UI State ──────────────────────────────────────────────────
// Lightweight incremental update for in-session UI elements.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  AdaptiveTrainingSurface,
  CurrentExerciseContext,
  NextExercisePrediction,
  SessionProgress,
  SmartActionSuggestion,
  SurfaceAction,
} from '@/types/adaptive-surface';
import type { PredictedExerciseCandidate } from '@/types/predictive-flow';

export interface SessionUIUpdate {
  type: 'exercise_changed' | 'set_completed' | 'prediction_refresh' | 'fatigue_update';
  payload: unknown;
}

/** Apply an incremental update to the training surface.
 *  Does NOT rebuild the entire surface — only the affected parts.
 */
export function updateSessionUIState(
  surface: AdaptiveTrainingSurface,
  update: SessionUIUpdate
): AdaptiveTrainingSurface {
  switch (update.type) {
    case 'exercise_changed': {
      const { currentExercise, queue } = update.payload as {
        currentExercise: CurrentExerciseContext;
        queue: AdaptiveTrainingSurface['queue'];
      };
      return {
        ...surface,
        currentExercise,
        queue,
        nextPredictions: surface.nextPredictions, // will refresh separately
      };
    }

    case 'set_completed': {
      const { setNumber, totalSets } = update.payload as {
        setNumber: number;
        totalSets: number;
      };
      if (!surface.currentExercise) return surface;

      const progress: SessionProgress = {
        ...surface.sessionProgress,
        completedSets: surface.sessionProgress.completedSets + 1,
      };

      const isLastSet = setNumber >= totalSets;
      const smartActions = isLastSet
        ? buildFinishSmartActions(surface.currentExercise.exerciseName)
        : surface.smartActions;

      return {
        ...surface,
        sessionProgress: progress,
        smartActions,
      };
    }

    case 'prediction_refresh': {
      const predictions = update.payload as PredictedExerciseCandidate[];
      return {
        ...surface,
        nextPredictions: predictions.map((p, i) => ({
          exerciseId: p.exerciseId,
          exerciseName: p.exerciseName,
          score: p.score,
          confidence: p.score,
          reasoning: p.reasoning,
          basedOn: p.basedOn,
          oneTapAction: {
            id: `next_${p.exerciseId}`,
            label: i === 0 ? 'Do This Next' : 'Add',
            icon: 'plus',
            variant: i === 0 ? 'filled' : 'ghost',
            priority: i === 0 ? 'primary' : 'secondary',
            enabled: true,
          } as SurfaceAction,
        })),
      };
    }

    case 'fatigue_update': {
      // Fatigue changes smart action availability
      return {
        ...surface,
        smartActions: surface.smartActions.map((a) =>
          a.type === 'increase_weight'
            ? { ...a, enabled: false, disabledReason: 'Fatigue elevated — consider maintaining weight' }
            : a
        ),
      };
    }

    default:
      return surface;
  }
}

function buildFinishSmartActions(exerciseName: string): SmartActionSuggestion[] {
  return [
    {
      id: 'finish_exercise',
      type: 'finish_session',
      label: `Finish ${exerciseName}`,
      description: 'All sets completed',
      action: {
        id: 'finish_action',
        label: 'Done',
        icon: 'arrow-right',
        variant: 'filled',
        priority: 'primary',
        enabled: true,
      },
      priority: 'primary',
      context: 'Exercise complete',
      confidence: 1.0,
    },
  ];
}
