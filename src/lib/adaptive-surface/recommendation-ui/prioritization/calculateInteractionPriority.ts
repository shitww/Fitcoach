// ── Calculate Interaction Priority ────────────────────────────────────────────
// Determines which UI element should demand the user's attention right now.
// ─────────────────────────────────────────────────────────────────────────────

import type { SmartActionSuggestion, SurfaceProminence } from '@/types/adaptive-surface';

export interface InteractionContext {
  isFirstVisit: boolean;
  hasActiveSession: boolean;
  daysSinceLastWorkout: number;
  unreadRecommendations: number;
  currentStreak: number;
  isInWorkout: boolean;
}

export interface PrioritizedInteraction {
  elementId: string;
  prominence: SurfaceProminence;
  reason: string;
  urgencyScore: number; // 0-1
}

/** Calculate which UI element should be most prominent right now.
 *  Prevents every element from screaming for attention simultaneously.
 */
export function calculateInteractionPriority(
  context: InteractionContext,
  smartActions: readonly SmartActionSuggestion[]
): PrioritizedInteraction[] {
  const interactions: PrioritizedInteraction[] = [];

  // 1. In-workout actions are always highest priority
  if (context.isInWorkout && smartActions.length > 0) {
    const topAction = smartActions[0];
    interactions.push({
      elementId: topAction.id,
      prominence: 'hero',
      reason: 'Active workout — user is in flow',
      urgencyScore: 0.95,
    });
  }

  // 2. Streak continuation is highly urgent
  if (context.currentStreak >= 3 && context.daysSinceLastWorkout <= 1) {
    interactions.push({
      elementId: 'streak_hero',
      prominence: 'hero',
      reason: `${context.currentStreak}-day streak — keep it going`,
      urgencyScore: 0.9,
    });
  }

  // 3. Long gap since last workout
  if (context.daysSinceLastWorkout >= 3 && !context.isInWorkout) {
    interactions.push({
      elementId: 'return_prompt',
      prominence: 'primary',
      reason: `${context.daysSinceLastWorkout} days since last workout`,
      urgencyScore: 0.85,
    });
  }

  // 4. Unread recommendations for returning users
  if (context.unreadRecommendations > 0 && !context.isFirstVisit) {
    interactions.push({
      elementId: 'recommendation_badge',
      prominence: 'secondary',
      reason: `${context.unreadRecommendations} new suggestions`,
      urgencyScore: 0.5,
    });
  }

  // 5. First visit onboarding
  if (context.isFirstVisit) {
    interactions.push({
      elementId: 'onboarding_hero',
      prominence: 'hero',
      reason: 'First visit — guide to first workout',
      urgencyScore: 1.0,
    });
  }

  // Sort by urgency, cap to avoid overload
  return interactions
    .sort((a, b) => b.urgencyScore - a.urgencyScore)
    .slice(0, 3);
}
