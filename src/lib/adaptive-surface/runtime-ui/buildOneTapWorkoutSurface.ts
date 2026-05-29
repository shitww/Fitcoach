// ── Build One-Tap Workout Surface ────────────────────────────────────────────
// The primary UX layer: 3 seconds from app open to active workout.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  OneTapWorkoutSurface,
  OneTapHero,
  OneTapOption,
  SurfaceAction,
} from '@/types/adaptive-surface';
import type { ResumeWorkoutCandidate, PredictedWorkoutSession, QuickStartSuggestion } from '@/types/predictive-flow';

export interface BuildOneTapInput {
  resumeCandidates: readonly ResumeWorkoutCandidate[];
  predictedSession: PredictedWorkoutSession | null;
  quickStarts: readonly QuickStartSuggestion[];
  hasActiveSession: boolean;
  activeSessionId: string | null;
  recentSplits: readonly string[];
  today: Date;
}

/** Build the complete one-tap workout surface.
 *  Designed for thumb-reachable, instant-start UX.
 */
export function buildOneTapWorkoutSurface(
  input: BuildOneTapInput
): OneTapWorkoutSurface {
  const { resumeCandidates, predictedSession, quickStarts, hasActiveSession, activeSessionId } = input;

  // Hero: highest-confidence action
  const heroSuggestion = buildHero(resumeCandidates, predictedSession, quickStarts, hasActiveSession);

  // Quick options: 3-4 secondary starts
  const quickOptions = buildQuickOptions(quickStarts, predictedSession, input.recentSplits);

  // Recent: last few unique splits
  const recentOptions = buildRecentOptions(input.recentSplits);

  return {
    heroSuggestion,
    quickOptions,
    recentOptions,
    hasActiveSession,
    activeSessionId,
  };
}

function buildHero(
  resumeCandidates: readonly ResumeWorkoutCandidate[],
  predictedSession: PredictedWorkoutSession | null,
  quickStarts: readonly QuickStartSuggestion[],
  hasActiveSession: boolean
): OneTapHero | null {
  if (hasActiveSession && resumeCandidates.length > 0) {
    const rc = resumeCandidates[0];
    return {
      title: rc.label,
      subtitle: rc.description,
      meta: `${rc.estimatedDurationMin} min · ${rc.lastExercises.length} exercises`,
      action: {
        id: 'hero_resume',
        label: 'Continue',
        icon: 'repeat',
        variant: 'filled',
        priority: 'hero',
        enabled: true,
      },
      muscleGroups: [],
      estimatedDurationMin: rc.estimatedDurationMin,
      confidence: rc.confidence,
      reasoning: [
        { type: 'recent_history', text: 'Continue where you left off', confidence: rc.confidence },
      ],
    };
  }

  if (predictedSession && predictedSession.confidence >= 0.5) {
    return {
      title: `${capitalize(predictedSession.predictedSplit)} Day`,
      subtitle: predictedSession.reasoning[0]?.text ?? 'Ready when you are',
      meta: `${predictedSession.estimatedDurationMin} min · ${predictedSession.suggestedExercises.length} exercises`,
      action: {
        id: 'hero_predicted',
        label: 'Start',
        icon: 'play',
        variant: 'filled',
        priority: 'hero',
        enabled: true,
      },
      muscleGroups: predictedSession.targetMuscleGroups,
      estimatedDurationMin: predictedSession.estimatedDurationMin,
      confidence: predictedSession.confidence,
      reasoning: predictedSession.reasoning,
    };
  }

  const topQuick = quickStarts[0];
  if (topQuick) {
    return {
      title: topQuick.label,
      subtitle: topQuick.subtitle,
      meta: `${topQuick.estimatedDurationMin} min`,
      action: {
        id: 'hero_quick',
        label: 'Start',
        icon: 'play',
        variant: 'filled',
        priority: 'hero',
        enabled: true,
      },
      muscleGroups: topQuick.targetMuscleGroups,
      estimatedDurationMin: topQuick.estimatedDurationMin,
      confidence: topQuick.confidence,
      reasoning: [],
    };
  }

  return null;
}

function buildQuickOptions(
  quickStarts: readonly QuickStartSuggestion[],
  predictedSession: PredictedWorkoutSession | null,
  recentSplits: readonly string[]
): OneTapOption[] {
  const options: OneTapOption[] = [];

  for (const qs of quickStarts.slice(0, 2)) {
    options.push({
      id: qs.id,
      title: qs.label,
      subtitle: qs.subtitle,
      icon: qs.icon === 'repeat' ? 'repeat' : qs.icon === 'clock' ? 'clock' : qs.icon === 'zap' ? 'zap' : 'play',
      action: {
        id: `quick_${qs.id}`,
        label: qs.primaryAction === 'resume' ? 'Continue' : 'Start',
        icon: qs.primaryAction === 'resume' ? 'repeat' : 'play',
        variant: 'outline',
        priority: 'secondary',
        enabled: true,
      },
      type: qs.type === 'resume' ? 'resume' : qs.type === 'predicted_split' ? 'split' : 'frequent',
    });
  }

  if (predictedSession) {
    options.push({
      id: `split_${predictedSession.predictedSplit}`,
      title: `${capitalize(predictedSession.predictedSplit)} Day`,
      subtitle: 'Predicted for today',
      icon: 'target',
      action: {
        id: 'quick_split',
        label: 'Start',
        icon: 'play',
        variant: 'outline',
        priority: 'secondary',
        enabled: true,
      },
      type: 'split',
    });
  }

  return options.slice(0, 4);
}

function buildRecentOptions(recentSplits: readonly string[]): OneTapOption[] {
  const seen = new Set<string>();
  const options: OneTapOption[] = [];

  for (const split of recentSlices(recentSplits, 5)) {
    if (seen.has(split) || !split) continue;
    seen.add(split);

    options.push({
      id: `recent_${split}`,
      title: `${capitalize(split)} Day`,
      subtitle: 'Recent',
      icon: 'dumbbell',
      action: {
        id: `recent_${split}_action`,
        label: 'Start',
        icon: 'play',
        variant: 'ghost',
        priority: 'subtle',
        enabled: true,
      },
      type: 'split',
    });

    if (options.length >= 3) break;
  }

  return options;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function recentSlices<T>(arr: readonly T[], n: number): T[] {
  return arr.slice(0, n);
}
