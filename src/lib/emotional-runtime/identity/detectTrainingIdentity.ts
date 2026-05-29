// ── Detect Training Identity ──────────────────────────────────────────────────
// Observes patterns to describe how the user trains — not who they are.
// Observational only. Never labels personality.
// ─────────────────────────────────────────────────────────────────────────────

import type { TrainingIdentity, TrainingTrait } from '@/types/emotional-runtime';
import type { ProgressData, RecoveryData, RecentExercise } from '@/lib/dashboard-bootstrap';

export interface IdentityInput {
  progress: ProgressData;
  recovery: RecoveryData;
  recentExercises: RecentExercise[];
  avgSessionDurationMin?: number;
}

/** Detect training identity from observable patterns. */
export function detectTrainingIdentity(input: IdentityInput): TrainingIdentity | null {
  const { progress, recovery, recentExercises, avgSessionDurationMin = 60 } = input;

  // Need at least some history to detect patterns
  if (progress.totalWorkouts < 5) return null;

  const twoWeekCount = progress.last14Days.filter((d) => d.done).length;
  const traits: TrainingTrait[] = [];

  // Consistency trait
  if (twoWeekCount >= 8) traits.push('high_consistency');

  // High frequency
  if (twoWeekCount >= 10) traits.push('high_frequency');

  // Session length profile
  const sessionLength: TrainingIdentity['sessionLengthProfile'] =
    avgSessionDurationMin < 40 ? 'short' :
    avgSessionDurationMin > 75 ? 'long' : 'medium';

  if (sessionLength === 'short' && twoWeekCount >= 6) traits.push('minimalist');

  // Recovery awareness
  const lastWeek = progress.last14Days.slice(7);
  const hasRestDays = lastWeek.filter((d) => !d.done).length >= 2;
  if (hasRestDays && recovery.fatigueScore < 60) traits.push('recovery_aware');

  // Strength-focused: presence of heavy compound lifts
  const exerciseNames = recentExercises.map((e) => e.name.toLowerCase());
  const hasCompounds = exerciseNames.some((n) =>
    n.includes('squat') || n.includes('deadlift') || n.includes('bench') ||
    n.includes('深蹲') || n.includes('硬拉') || n.includes('卧推') || n.includes('引体')
  );
  if (hasCompounds) {
    traits.push('compound_heavy');
    traits.push('strength_focused');
  }

  // Progressive overload signal: has weights
  const hasWeights = recentExercises.some((e) => e.weight > 0);
  if (hasWeights && progress.totalWorkouts >= 15) traits.push('progressive_overload');

  const primaryTraits = traits.slice(0, 3);
  const secondaryTraits = traits.slice(3, 6);

  const intensityProfile: TrainingIdentity['intensityProfile'] =
    recovery.fatigueScore >= 70 ? 'high' :
    recovery.fatigueScore >= 40 ? 'moderate' : 'low';

  const observationNote = buildObservationNote(primaryTraits, sessionLength);
  const traitLabels = primaryTraits.map(getTraitLabel);

  return {
    primaryTraits,
    secondaryTraits,
    dominantSplit: null, // requires more data
    sessionLengthProfile: sessionLength,
    intensityProfile,
    observationNote,
    traitLabels,
  };
}

function buildObservationNote(
  traits: TrainingTrait[],
  sessionLength: TrainingIdentity['sessionLengthProfile']
): string {
  const parts: string[] = [];

  if (traits.includes('high_consistency')) {
    parts.push('训练稳定性高');
  }
  if (traits.includes('compound_heavy')) {
    parts.push('偏向复合动作训练');
  }
  if (traits.includes('minimalist') && sessionLength === 'short') {
    parts.push('高效短时训练风格');
  }
  if (traits.includes('recovery_aware')) {
    parts.push('注重恢复节奏');
  }
  if (traits.includes('progressive_overload')) {
    parts.push('渐进超负荷型训练');
  }

  return parts.length > 0
    ? `你的训练风格：${parts.join('，')}`
    : '持续积累数据中';
}

function getTraitLabel(trait: TrainingTrait): string {
  const map: Record<TrainingTrait, string> = {
    high_consistency:    '高稳定性',
    progressive_overload:'渐进超负荷',
    push_pull_discipline:'推拉分化',
    volume_focused:      '容量导向',
    strength_focused:    '力量导向',
    recovery_aware:      '注重恢复',
    compound_heavy:      '复合动作为主',
    minimalist:          '高效简练',
    high_frequency:      '高频训练',
    long_session:        '长时训练',
  };
  return map[trait] ?? trait;
}
