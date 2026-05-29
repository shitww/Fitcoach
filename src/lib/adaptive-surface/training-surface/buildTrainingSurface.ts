// ── Build Training Surface ────────────────────────────────────────────────────
// Assembles the complete adaptive training page surface from live session state.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  AdaptiveTrainingSurface,
  CurrentExerciseContext,
  NextExercisePrediction,
  SessionProgress,
  SmartActionSuggestion,
  ExerciseQueueItem,
  SurfaceAction,
} from '@/types/adaptive-surface';
import type {
  ExercisePerformanceSnapshot,
  MuscleRecoveryState,
  WorkoutSessionMemory,
} from '@/types/workout-memory';
import type { PredictedExerciseCandidate } from '@/types/predictive-flow';

export interface BuildTrainingSurfaceInput {
  activeSessionId: string | null;
  currentExerciseId: string | null;
  completedExerciseIds: readonly string[];
  exerciseSnapshots: Record<string, ExercisePerformanceSnapshot>;
  recoveryStates: readonly MuscleRecoveryState[];
  nextPredictions: readonly PredictedExerciseCandidate[];
  queue: readonly { exerciseId: string; exerciseName: string; orderIndex: number; status: 'pending' | 'current' | 'completed' | 'skipped'; estimatedSets: number; targetMuscle: string }[];
  elapsedMin: number;
  currentSetIndex: number;
}

/** Build the adaptive training surface.
 *  Returns a surface object that drives all UI on the training page.
 */
export function buildTrainingSurface(
  input: BuildTrainingSurfaceInput
): AdaptiveTrainingSurface {
  const {
    activeSessionId,
    currentExerciseId,
    completedExerciseIds,
    exerciseSnapshots,
    recoveryStates,
    nextPredictions,
    queue,
    elapsedMin,
    currentSetIndex,
  } = input;

  const hasActiveSession = activeSessionId !== null;
  const hasCurrentExercise = currentExerciseId !== null;

  if (!hasActiveSession) {
    return {
      sessionId: null,
      mode: 'empty',
      currentExercise: null,
      nextPredictions: [],
      sessionProgress: emptyProgress(),
      smartActions: buildEmptyStateActions(),
      queue: [],
    };
  }

  const currentExercise = hasCurrentExercise
    ? buildCurrentExerciseContext(
        currentExerciseId,
        exerciseSnapshots[currentExerciseId],
        recoveryStates,
        currentSetIndex
      )
    : null;

  const mappedQueue: ExerciseQueueItem[] = queue.map((item) => ({
    ...item,
    status: item.exerciseId === currentExerciseId ? 'current' : item.status,
  }));

  const progress = buildSessionProgress(queue, elapsedMin, currentSetIndex);

  const mappedNext = nextPredictions.slice(0, 3).map((p, i) => ({
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
  }));

  const smartActions = currentExercise
    ? buildSmartActions(currentExercise, progress)
    : buildEmptyStateActions();

  return {
    sessionId: activeSessionId,
    mode: hasCurrentExercise ? 'active' : 'planning',
    currentExercise,
    nextPredictions: mappedNext,
    sessionProgress: progress,
    smartActions,
    queue: mappedQueue,
  };
}

function buildCurrentExerciseContext(
  exerciseId: string,
  snapshot: ExercisePerformanceSnapshot | undefined,
  recoveryStates: readonly MuscleRecoveryState[],
  currentSetIndex: number
): CurrentExerciseContext {
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

  const recovery = recoveryStates.find(
    (r) => r.muscleGroup === (snapshot?.exerciseId ?? '')
  );
  const recoveryContext = recovery
    ? `${recovery.muscleGroup} ${recovery.status} (${recovery.recoveryScore})`
    : 'No recovery data';

  const isPotentialPR =
    snap.bestWeight > 0 && snap.lastWeight >= snap.bestWeight * 0.95;

  return {
    exerciseId: snap.exerciseId ?? exerciseId,
    exerciseName: snap.exerciseName,
    muscleGroup: '', // caller should enrich with metadata
    setNumber: currentSetIndex + 1,
    totalSets: 3,
    lastWeight: snap.lastWeight,
    lastReps: snap.lastReps,
    bestWeight: snap.bestWeight,
    bestReps: snap.averageReps,
    prStatus: isPotentialPR ? 'potential' : 'none',
    volumeTrend: snap.volumeTrend,
    recoveryContext,
    warmupRequired: false,
    suggestedActions: [
      {
        id: 'add_set',
        label: 'Add Set',
        icon: 'plus',
        variant: 'outline',
        priority: 'secondary',
        enabled: true,
      },
    ],
  };
}

function buildSessionProgress(
  queue: readonly { status: string }[],
  elapsedMin: number,
  currentSetIndex: number
): SessionProgress {
  const completed = queue.filter((q) => q.status === 'completed').length;
  const totalSets = queue.length * 3; // rough estimate

  return {
    completedExercises: completed,
    totalExercises: queue.length,
    completedSets: completed * 3 + currentSetIndex,
    totalSets,
    elapsedMin,
    estimatedRemainingMin: Math.max(0, (queue.length - completed) * 7),
    currentVolume: 0, // caller can enrich
  };
}

function buildSmartActions(
  current: CurrentExerciseContext,
  progress: SessionProgress
): SmartActionSuggestion[] {
  const actions: SmartActionSuggestion[] = [];

  if (current.prStatus === 'potential') {
    actions.push({
      id: 'attempt_pr',
      type: 'increase_weight',
      label: 'Go for PR',
      description: `Within 5% of your best (${current.bestWeight}kg)`,
      action: {
        id: 'go_pr',
        label: '+2.5kg',
        icon: 'fire',
        variant: 'filled',
        priority: 'primary',
        enabled: true,
      },
      priority: 'primary',
      context: 'Near personal best',
      confidence: 0.8,
    });
  }

  if (progress.completedSets < 3) {
    actions.push({
      id: 'add_set',
      type: 'add_set',
      label: 'Add Set',
      description: 'Extra volume for this exercise',
      action: {
        id: 'add_set_action',
        label: '+1 Set',
        icon: 'plus',
        variant: 'outline',
        priority: 'secondary',
        enabled: true,
      },
      priority: 'secondary',
      context: 'Volume boost available',
      confidence: 0.6,
    });
  }

  if (progress.completedExercises >= progress.totalExercises - 1) {
    actions.push({
      id: 'finish',
      type: 'finish_session',
      label: 'Finish Workout',
      description: 'All planned exercises completed',
      action: {
        id: 'finish_action',
        label: 'Finish',
        icon: 'chevron-right',
        variant: 'filled',
        priority: 'primary',
        enabled: true,
      },
      priority: 'primary',
      context: 'Session near complete',
      confidence: 0.95,
    });
  }

  return actions;
}

function buildEmptyStateActions(): SmartActionSuggestion[] {
  return [
    {
      id: 'start_quick',
      type: 'start_warmup',
      label: 'Quick Start',
      description: 'Start a predicted session',
      action: {
        id: 'quick_start',
        label: 'Start',
        icon: 'play',
        variant: 'filled',
        priority: 'primary',
        enabled: true,
      },
      priority: 'primary',
      context: 'No active session',
      confidence: 0.7,
    },
  ];
}

function emptyProgress(): SessionProgress {
  return {
    completedExercises: 0,
    totalExercises: 0,
    completedSets: 0,
    totalSets: 0,
    elapsedMin: 0,
    estimatedRemainingMin: 0,
    currentVolume: 0,
  };
}
