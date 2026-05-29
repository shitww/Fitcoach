// ── Build Exercise Recommendation Card ──────────────────────────────────────
// Transforms a Phase 3 candidate into a rich, explainable UI card.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ExerciseRecommendationCard,
  SurfaceAction,
  ConfidenceBadge,
} from '@/types/adaptive-surface';
import type { PredictedExerciseCandidate } from '@/types/predictive-flow';
import type { ExercisePerformanceSnapshot, MuscleRecoveryState } from '@/types/workout-memory';

export interface BuildCardInput {
  candidate: PredictedExerciseCandidate;
  snapshot: ExercisePerformanceSnapshot | undefined;
  recoveryState: MuscleRecoveryState | undefined;
  index: number;
}

/** Build a rich recommendation card from a predicted candidate.
 *  Score, confidence, and reasoning are all exposed for UI rendering.
 */
export function buildExerciseRecommendationCard(
  input: BuildCardInput
): ExerciseRecommendationCard {
  const { candidate, snapshot, recoveryState, index } = input;

  const { cardScore, scoreLabel, prominence } = deriveScorePresentation(
    candidate.score,
    index
  );

  const confidenceBadge = buildConfidenceBadge(candidate.score);

  const metadata: ExerciseRecommendationCard['metadata'] = {
    lastWeight: snapshot?.lastWeight ?? null,
    lastDate: snapshot?.lastPerformedAt ?? null,
    frequency30d: snapshot?.recentFrequency ?? 0,
    recoveryScore: recoveryState?.recoveryScore ?? 100,
    transitionProbability:
      candidate.basedOn.includes('transition') ? candidate.score : null,
  };

  const primaryAction: SurfaceAction = {
    id: `card_primary_${candidate.exerciseId}`,
    label: 'Start',
    icon: 'play',
    variant: 'filled',
    priority: prominence,
    enabled: true,
  };

  const secondaryActions: SurfaceAction[] = [
    {
      id: `card_secondary_${candidate.exerciseId}`,
      label: 'Preview',
      icon: 'chevron-right',
      variant: 'ghost',
      priority: 'subtle',
      enabled: true,
    },
  ];

  return {
    cardId: `rec_${candidate.exerciseId}_${Date.now()}`,
    exerciseId: candidate.exerciseId,
    exerciseName: candidate.exerciseName,
    muscleGroup: '', // caller should enrich from exercise metadata
    score: cardScore,
    confidence: confidenceBadge.score,
    prominence,
    scoreLabel,
    reasoning: candidate.reasoning,
    metadata,
    primaryAction,
    secondaryActions,
  };
}

function deriveScorePresentation(
  score: number,
  index: number
): { cardScore: number; scoreLabel: string; prominence: 'hero' | 'primary' | 'secondary' } {
  if (index === 0 && score >= 0.75) {
    return { cardScore: score, scoreLabel: 'Top Pick', prominence: 'hero' };
  }
  if (score >= 0.7) {
    return { cardScore: score, scoreLabel: 'Great Match', prominence: 'primary' };
  }
  if (score >= 0.5) {
    return { cardScore: score, scoreLabel: 'Good Fit', prominence: 'secondary' };
  }
  return { cardScore: score, scoreLabel: 'Try This', prominence: 'secondary' };
}

function buildConfidenceBadge(score: number): ConfidenceBadge {
  if (score >= 0.8) {
    return { score, label: 'High Confidence', color: 'green', tooltip: 'Strong prediction basis' };
  }
  if (score >= 0.6) {
    return { score, label: 'Medium Confidence', color: 'yellow', tooltip: 'Reasonable prediction basis' };
  }
  if (score >= 0.4) {
    return { score, label: 'Exploratory', color: 'orange', tooltip: 'Limited data; suggestion' };
  }
  return { score, label: 'Low Confidence', color: 'red', tooltip: 'Weak signal; try if curious' };
}
