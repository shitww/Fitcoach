// ── Build Adaptive Home Surface ───────────────────────────────────────────────
// Transforms Phase 1-3 intelligence into the complete home screen surface.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  AdaptiveHomeSurface,
  HomeQuickStart,
  HomeRecoveryBadge,
  SurfaceAction,
  TodayFocus,
} from '@/types/adaptive-surface';
import type {
  BehaviorMemorySnapshot,
  BodyRecoverySnapshot,
  WorkoutSessionMemory,
} from '@/types/workout-memory';
import type { PredictedWorkoutSession, QuickStartSuggestion } from '@/types/predictive-flow';

export interface BuildHomeSurfaceInput {
  memory: BehaviorMemorySnapshot;
  predictedSession: PredictedWorkoutSession | null;
  quickStarts: readonly QuickStartSuggestion[];
  today: Date;
}

/** Build the complete adaptive home surface.
 *  Orchestrates Phase 2 memory + Phase 3 predictions into a UI-ready structure.
 */
export function buildAdaptiveHomeSurface(
  input: BuildHomeSurfaceInput
): AdaptiveHomeSurface {
  const { memory, predictedSession, quickStarts, today } = input;
  const wm = memory.workoutMemory;
  const fm = memory.foodMemory;

  // Recent activity summary
  const sortedSessions = [...wm.timeline.sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastWorkout = sortedSessions[0] || null;
  const daysSince = lastWorkout
    ? Math.floor((today.getTime() - new Date(lastWorkout.date).getTime()) / 86_400_000)
    : -1;
  const lastSplit = lastWorkout ? inferSplit(lastWorkout.muscleGroups) : null;

  // Recovery badges
  const recoveryBadges = buildRecoveryBadges(wm.recoverySnapshot);

  // Quick starts mapped to home format
  const homeQuickStarts = quickStarts.slice(0, 4).map((qs, i): HomeQuickStart => ({
    id: qs.id,
    title: qs.label,
    subtitle: qs.subtitle,
    meta: `${qs.estimatedDurationMin} min`,
    action: mapQuickStartToAction(qs, i === 0),
    confidence: qs.confidence,
    muscleGroups: qs.targetMuscleGroups,
    type: qs.type,
  }));

  // Today focus (hero element)
  const todayFocus = buildTodayFocus(predictedSession, recoveryBadges, daysSince);

  return {
    userId: memory.userId,
    generatedAt: today.toISOString(),
    todayFocus,
    quickStarts: homeQuickStarts,
    recoveryBadges,
    todayPrediction: predictedSession
      ? {
          predictedSplit: predictedSession.predictedSplit,
          confidence: predictedSession.confidence,
          reasoning: predictedSession.reasoning,
        }
      : null,
    recentActivity: {
      lastWorkoutDate: lastWorkout?.date ?? '',
      daysSince: daysSince >= 0 ? daysSince : 999,
      streakDays: wm.timeline.currentStreak,
      lastSplit,
    },
    hasUnreadContext: predictedSession !== null && predictedSession.confidence > 0.5,
  };
}

function buildRecoveryBadges(
  snapshot: BodyRecoverySnapshot
): HomeRecoveryBadge[] {
  return snapshot.muscleGroups.map((g) => ({
    muscleGroup: g.muscleGroup,
    label: localizeMuscle(g.muscleGroup),
    recoveryScore: g.recoveryScore,
    status:
      g.recoveryScore >= 85
        ? 'recovered'
        : g.recoveryScore >= 60
          ? 'nearly_recovered'
          : g.recoveryScore >= 30
            ? 'fatigued'
            : 'very_fatigued',
    lastTrainedDaysAgo: g.daysSinceTrained,
  }));
}

function buildTodayFocus(
  predictedSession: PredictedWorkoutSession | null,
  recoveryBadges: readonly HomeRecoveryBadge[],
  daysSinceLast: number
): TodayFocus | null {
  if (!predictedSession) return null;

  const mostRecovered = recoveryBadges
    .filter((b) => predictedSession.targetMuscleGroups.includes(b.muscleGroup))
    .sort((a, b) => b.recoveryScore - a.recoveryScore)[0];

  const label =
    daysSinceLast === 0
      ? 'Back for More?'
      : daysSinceLast > 5
        ? 'Time to Get Back'
        : `${capitalize(predictedSession.predictedSplit)} Day`;

  return {
    label,
    subtitle: predictedSession.reasoning[0]?.text ?? 'Ready when you are',
    priority: 'hero',
    action: {
      id: 'focus_start',
      label: 'Start Training',
      icon: 'play',
      variant: 'filled',
      priority: 'hero',
      enabled: true,
    },
    muscleGroups: predictedSession.targetMuscleGroups,
    estimatedDurationMin: predictedSession.estimatedDurationMin,
    reasoning: predictedSession.reasoning,
  };
}

function mapQuickStartToAction(
  qs: QuickStartSuggestion,
  isPrimary: boolean
): SurfaceAction {
  return {
    id: `qs_${qs.id}`,
    label: qs.primaryAction === 'resume' ? 'Continue' : 'Start',
    icon: qs.primaryAction === 'resume' ? 'repeat' : 'play',
    variant: isPrimary ? 'filled' : 'outline',
    priority: isPrimary ? 'primary' : 'secondary',
    enabled: true,
  };
}

function inferSplit(muscleGroups: string[]): string {
  const set = new Set(muscleGroups);
  if (set.has('chest') && !set.has('back')) return 'push';
  if (set.has('back') && !set.has('chest')) return 'pull';
  if (set.has('legs') && !set.has('chest') && !set.has('back')) return 'legs';
  if (set.has('chest') && set.has('back')) return 'upper';
  return 'fullbody';
}

function localizeMuscle(muscle: string): string {
  const map: Record<string, string> = {
    chest: 'Chest', back: 'Back', legs: 'Legs',
    shoulders: 'Shoulders', arms: 'Arms', abs: 'Core',
    quadriceps: 'Quads', hamstrings: 'Hamstrings',
    glutes: 'Glutes', biceps: 'Biceps', triceps: 'Triceps',
  };
  return map[muscle] || muscle;
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
