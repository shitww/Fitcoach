// ── Build Adaptive Empty State ────────────────────────────────────────────────
// Never show a blank page. Always provide a meaningful next step.
// ─────────────────────────────────────────────────────────────────────────────

import type { AdaptiveEmptyState, SurfaceAction } from '@/types/adaptive-surface';

export interface EmptyStateContext {
  hasWorkoutHistory: boolean;
  hasFoodHistory: boolean;
  daysSinceSignup: number;
  daysSinceLastWorkout: number;
  currentStreak: number;
  isFirstSession: boolean;
  pageType: 'home' | 'training' | 'history' | 'profile';
}

/** Build an adaptive empty state that always provides a path forward.
 *  The system never renders a true "empty" screen.
 */
export function buildAdaptiveEmptyState(
  context: EmptyStateContext
): AdaptiveEmptyState {
  if (context.isFirstSession || context.daysSinceSignup <= 1) {
    return buildFirstWorkoutState();
  }

  if (!context.hasWorkoutHistory) {
    return buildNoHistoryState(context.pageType);
  }

  if (context.daysSinceLastWorkout > 7) {
    return buildReturnState(context.daysSinceLastWorkout, context.currentStreak);
  }

  // All recovered — encourage variety
  return buildAllRecoveredState();
}

function buildFirstWorkoutState(): AdaptiveEmptyState {
  return {
    type: 'first_workout',
    headline: 'Welcome to FitCoach',
    body: 'Start your first workout and the app will learn your style. No setup needed.',
    illustration: 'welcome',
    primaryAction: {
      id: 'first_workout',
      label: 'Start First Workout',
      icon: 'play',
      variant: 'filled',
      priority: 'hero',
      enabled: true,
    },
    secondaryActions: [
      {
        id: 'explore_exercises',
        label: 'Explore Exercises',
        icon: 'dumbbell',
        variant: 'outline',
        priority: 'secondary',
        enabled: true,
      },
    ],
    suggestions: ['Push Day', 'Pull Day', 'Leg Day', 'Full Body'],
    showOnboardingHint: true,
  };
}

function buildNoHistoryState(pageType: string): AdaptiveEmptyState {
  const actions: SurfaceAction[] =
    pageType === 'training'
      ? [
          {
            id: 'start_now',
            label: 'Start Training',
            icon: 'play',
            variant: 'filled',
            priority: 'primary',
            enabled: true,
          },
        ]
      : [
          {
            id: 'go_training',
            label: 'Go to Training',
            icon: 'arrow-right',
            variant: 'filled',
            priority: 'primary',
            enabled: true,
          },
        ];

  return {
    type: 'no_history',
    headline: 'No workouts yet',
    body: 'Your training history will appear here. Start your first session and FitCoach will begin learning your patterns.',
    illustration: 'explore',
    primaryAction: actions[0],
    secondaryActions: actions.slice(1),
    suggestions: ['Push Day', 'Pull Day', 'Leg Day'],
    showOnboardingHint: true,
  };
}

function buildReturnState(
  daysSince: number,
  streak: number
): AdaptiveEmptyState {
  const streakText = streak > 0 ? `You had a ${streak}-day streak.` : '';

  return {
    type: 'no_active_session',
    headline: 'Welcome Back',
    body: `It's been ${daysSince} days since your last workout. ${streakText} Pick up where you left off.`,
    illustration: 'ready',
    primaryAction: {
      id: 'resume_training',
      label: 'Resume Training',
      icon: 'repeat',
      variant: 'filled',
      priority: 'primary',
      enabled: true,
    },
    secondaryActions: [
      {
        id: 'quick_session',
        label: 'Quick 20 Min',
        icon: 'zap',
        variant: 'outline',
        priority: 'secondary',
        enabled: true,
      },
    ],
    suggestions: ['Continue Last Split', 'Try Something New', 'Full Body Reset'],
    showOnboardingHint: false,
  };
}

function buildAllRecoveredState(): AdaptiveEmptyState {
  return {
    type: 'all_recovered',
    headline: 'Fully Recovered',
    body: 'All muscle groups are ready. You are free to train anything today.',
    illustration: 'celebrate',
    primaryAction: {
      id: 'pick_split',
      label: 'Pick a Split',
      icon: 'target',
      variant: 'filled',
      priority: 'primary',
      enabled: true,
    },
    secondaryActions: [
      {
        id: 'full_body_quick',
        label: 'Full Body Quick',
        icon: 'zap',
        variant: 'outline',
        priority: 'secondary',
        enabled: true,
      },
    ],
    suggestions: ['Push Day', 'Pull Day', 'Leg Day', 'Full Body'],
    showOnboardingHint: false,
  };
}
