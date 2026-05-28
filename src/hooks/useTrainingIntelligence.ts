// ── FitCoach V2 — Training Intelligence Hook ────────────────────────────────
// Bridges pure training engines with React UI.
// Lightweight, non-blocking, client-side only.

import { useMemo } from 'react';
import type {
  ExerciseHistory,
  LiveExerciseContext,
  UserTrainingContext,
  ProgressionRecommendation,
  FatigueSignal,
  RecoverySuggestion,
  WarmupPlan,
  TrainingInsight,
  ContextualTip,
} from '@/lib/training/trainingTypes';
import { recommendProgression, recommendForNewExercise } from '@/lib/training/progressionEngine';
import { detectFatigue } from '@/lib/training/fatigueEngine';
import { getRecoverySuggestions, getRecoveryStatusLine } from '@/lib/training/recoveryEngine';
import { generateWarmup } from '@/lib/training/warmupEngine';
import { generateInsights } from '@/lib/training/insightEngine';
import { getContextualTips } from '@/lib/training/contextualEngine';
import type { SessionSet } from '@/stores/workoutSession';

// ── Input Types ────────────────────────────────────────────────────────────

export interface IntelligenceInput {
  exerciseHistories: ExerciseHistory[];
  currentExercise: {
    name: string;
    muscleGroup?: string;
    sets: SessionSet[];
    restTimesSec?: number[];
  } | null;
  userContext: UserTrainingContext;
  muscleMap: Map<string, string>; // exerciseName → muscleGroup
  lastRecord: { weight: number; reps: number; date: string } | null;
}

export interface IntelligenceOutput {
  /** For the active exercise (if history exists). */
  progression: ProgressionRecommendation | null;
  /** For new exercises with no history (uses lastRecord). */
  newExerciseProgression: ProgressionRecommendation;
  /** Overall or exercise-specific fatigue signal. */
  fatigue: FatigueSignal | null;
  /** Short recovery suggestions (0–2). */
  recovery: RecoverySuggestion[];
  /** One-liner recovery status for headers. */
  recoveryStatus: string | null;
  /** Warmup plan for active exercise's target weight. */
  warmup: WarmupPlan | null;
  /** Top insights across all exercises. */
  insights: TrainingInsight[];
  /** Inline tips for the current exercise. */
  contextualTips: ContextualTip[];
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useTrainingIntelligence(input: IntelligenceInput): IntelligenceOutput {
  return useMemo(() => computeIntelligence(input), [input]);
}

// ── Pure Computer (usable outside React) ───────────────────────────────────

export function computeIntelligence(input: IntelligenceInput): IntelligenceOutput {
  const { exerciseHistories, currentExercise, userContext, muscleMap, lastRecord } = input;

  const historyForCurrent = currentExercise
    ? exerciseHistories.find((h) => h.exerciseName === currentExercise.name) ?? null
    : null;

  // 1. Progression
  const progression = historyForCurrent
    ? recommendProgression(historyForCurrent)
    : null;
  const newExerciseProgression = recommendForNewExercise(
    lastRecord,
    1 // default RIR preference
  );

  // 2. Fatigue
  const fatigue = detectFatigue(historyForCurrent, userContext, muscleMap);

  // 3. Recovery
  const recovery = getRecoverySuggestions(userContext);
  const recoveryStatus = getRecoveryStatusLine(userContext);

  // 4. Warmup (use last completed set weight as proxy for working weight)
  const warmup = (() => {
    if (!currentExercise || currentExercise.sets.length === 0) return null;
    const workSets = currentExercise.sets.filter((s) => !s.isWarmup && s.completed);
    const lastWorkSet = workSets[workSets.length - 1];
    if (!lastWorkSet) return null;
    return generateWarmup(lastWorkSet.weight, lastWorkSet.reps, lastWorkSet.isBodyweight);
  })();

  // 5. Insights (periodic — computed across all histories)
  const insights = generateInsights(exerciseHistories, userContext);

  // 6. Contextual tips
  const contextualTips = (() => {
    if (!currentExercise) return [];
    const liveCtx: LiveExerciseContext = {
      exerciseName: currentExercise.name,
      muscleGroup: currentExercise.muscleGroup,
      completedSets: currentExercise.sets
        .filter((s) => !s.isWarmup && s.completed)
        .map((s) => ({
          weight: s.weight,
          reps: s.reps,
          rir: s.rir,
          isFailure: s.isFailure,
          isBodyweight: s.isBodyweight,
        })),
      restTimesSec: currentExercise.restTimesSec,
    };
    return getContextualTips(liveCtx, historyForCurrent, userContext);
  })();

  return {
    progression,
    newExerciseProgression,
    fatigue,
    recovery,
    recoveryStatus,
    warmup,
    insights,
    contextualTips,
  };
}
