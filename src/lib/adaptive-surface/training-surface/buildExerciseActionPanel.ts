// ── Build Exercise Action Panel ──────────────────────────────────────────────
// Generates the set of actions available for the current exercise.
// ─────────────────────────────────────────────────────────────────────────────

import type { SurfaceAction } from '@/types/adaptive-surface';
import type { ExercisePerformanceSnapshot } from '@/types/workout-memory';

export interface ExerciseActionPanel {
  primaryAction: SurfaceAction;
  secondaryActions: SurfaceAction[];
  weightSuggestions: {
    label: string;
    weight: number;
    reason: string;
  }[];
}

/** Build the action panel for the current exercise.
 *  Returns weight suggestions and tap-able actions.
 */
export function buildExerciseActionPanel(
  exerciseId: string,
  snapshot: ExercisePerformanceSnapshot | undefined,
  setNumber: number,
  totalSets: number
): ExerciseActionPanel {
  const snap = snapshot ?? {
    exerciseId,
    exerciseName: exerciseId,
    lastWeight: 0,
    lastReps: 0,
    lastPerformedAt: '',
    bestWeight: 0,
    bestVolume: 0,
    best1RMEstimate: 0,
    averageVolume: 0,
    averageReps: 0,
    averageWeight: 0,
    recentFrequency: 0,
    totalSessions: 0,
    volumeTrend: 'insufficient_data',
  };

  const isLastSet = setNumber >= totalSets;

  const primaryAction: SurfaceAction = {
    id: isLastSet ? 'complete_exercise' : 'complete_set',
    label: isLastSet ? 'Finish Exercise' : `Complete Set ${setNumber}`,
    icon: 'arrow-right',
    variant: 'filled',
    priority: 'primary',
    enabled: true,
  };

  const secondaryActions: SurfaceAction[] = [
    {
      id: 'add_set',
      label: 'Extra Set',
      icon: 'plus',
      variant: 'outline',
      priority: 'secondary',
      enabled: true,
    },
    {
      id: 'swap_exercise',
      label: 'Swap',
      icon: 'dumbbell',
      variant: 'ghost',
      priority: 'subtle',
      enabled: true,
    },
  ];

  // Weight suggestions
  const weightSuggestions: ExerciseActionPanel['weightSuggestions'] = [];

  if (snap.lastWeight > 0) {
    weightSuggestions.push({
      label: 'Same',
      weight: snap.lastWeight,
      reason: 'Last used weight',
    });

    const increment = snap.lastWeight > 20 ? 2.5 : 2;
    const heavier = Math.round((snap.lastWeight + increment) * 10) / 10;
    weightSuggestions.push({
      label: 'Heavy',
      weight: heavier,
      reason: snap.volumeTrend === 'up' ? 'Volume trending up' : 'Progressive overload',
    });

    if (setNumber === 1) {
      const lighter = Math.max(0, Math.round((snap.lastWeight - increment) * 10) / 10);
      weightSuggestions.push({
        label: 'Light',
        weight: lighter,
        reason: 'Warm-up set',
      });
    }
  }

  return { primaryAction, secondaryActions, weightSuggestions };
}
