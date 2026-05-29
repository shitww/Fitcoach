// ── Build Today Focus ─────────────────────────────────────────────────────────
// Standalone helper for the hero "Today Focus" card.
// ─────────────────────────────────────────────────────────────────────────────

import type { TodayFocus, SurfaceAction } from '@/types/adaptive-surface';
import type { PredictedWorkoutSession } from '@/types/predictive-flow';

export interface BuildTodayFocusInput {
  predictedSession: PredictedWorkoutSession | null;
  daysSinceLastWorkout: number;
  currentStreak: number;
  isFirstWorkout: boolean;
}

/** Build the hero "Today Focus" element.
 *  Adapts tone based on recency, streak, and prediction confidence.
 */
export function buildTodayFocus(input: BuildTodayFocusInput): TodayFocus | null {
  const { predictedSession, daysSinceLastWorkout, currentStreak, isFirstWorkout } = input;

  if (isFirstWorkout) {
    return {
      label: 'First Workout',
      subtitle: 'Pick a focus area and start building your routine',
      priority: 'hero',
      action: buildStartAction('Start First Workout'),
      muscleGroups: [],
      estimatedDurationMin: 30,
      reasoning: [
        { type: 'time_spacing', text: 'Welcome to FitCoach', confidence: 1 },
      ],
    };
  }

  if (!predictedSession) {
    return {
      label: daysSinceLastWorkout > 3 ? 'Ready to Train?' : 'Keep the Momentum',
      subtitle: daysSinceLastWorkout > 3
        ? `Last workout was ${daysSinceLastWorkout} days ago`
        : 'You are on a roll',
      priority: 'hero',
      action: buildStartAction('Start Training'),
      muscleGroups: [],
      estimatedDurationMin: 45,
      reasoning: [],
    };
  }

  // Tone adaptation based on context
  const tone =
    daysSinceLastWorkout > 5
      ? { label: 'Time to Get Back', subtitle: `Last workout: ${daysSinceLastWorkout} days ago` }
      : daysSinceLastWorkout === 0
        ? { label: 'Back for More?', subtitle: 'You trained today already' }
        : currentStreak >= 3
          ? { label: `${capitalize(predictedSession.predictedSplit)} Day 🔥`, subtitle: `${currentStreak}-day streak` }
          : { label: `${capitalize(predictedSession.predictedSplit)} Day`, subtitle: predictedSession.reasoning[0]?.text ?? 'Ready when you are' };

  return {
    label: tone.label,
    subtitle: tone.subtitle,
    priority: 'hero',
    action: buildStartAction('Start Training'),
    muscleGroups: predictedSession.targetMuscleGroups,
    estimatedDurationMin: predictedSession.estimatedDurationMin,
    reasoning: predictedSession.reasoning,
  };
}

function buildStartAction(label: string): SurfaceAction {
  return {
    id: 'focus_start',
    label,
    icon: 'play',
    variant: 'filled',
    priority: 'hero',
    enabled: true,
  };
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
