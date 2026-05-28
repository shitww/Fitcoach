// ── FitCoach Phase 3 — Adaptive Intelligence Hook ───────────────────────────
// Wires the Unified Signal System → Profile → Identity → Coaching pipeline.
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
import {
  recommendProgression,
  recommendForNewExercise,
  detectFatigue,
  getRecoverySuggestions,
  getRecoveryStatusLine,
  generateWarmup,
  generateInsights,
  getContextualTips,
} from '@/lib/training';
import {
  generateSignals,
  aggregateSignals,
  computeOverallConfidence,
  type UnifiedSignalState,
} from '@/lib/training/signals';
import {
  buildTrainingProfile,
  detectProfileChanges,
  type UserTrainingProfile,
} from '@/lib/training/profile';
import {
  classifyFitnessIdentity,
  type IdentityInsight,
} from '@/lib/training/fitnessIdentityEngine';
import {
  computeGrowthMetrics,
  computeOverallGrowth,
  type ExerciseGrowthMetrics,
  type OverallGrowth,
} from '@/lib/training/growthModelEngine';
import { recommendAdaptiveProgression } from '@/lib/training/adaptiveProgressionEngine';
import type { SignalBackedRecommendation } from '@/lib/training/signals/signalTypes';
import {
  generateCoachingCues,
  generateReadinessCue,
  type CoachingCue,
} from '@/lib/training/behavioralCoachingEngine';
import type { SessionSet } from '@/stores/workoutSession';

// ── Input ──────────────────────────────────────────────────────────────────

export interface AdaptiveIntelligenceInput {
  exerciseHistories: ExerciseHistory[];
  currentExercise: {
    name: string;
    muscleGroup?: string;
    sets: SessionSet[];
    restTimesSec?: number[];
  } | null;
  userContext: UserTrainingContext;
  muscleMap: Map<string, string>;
  lastRecord: { weight: number; reps: number; date: string } | null;
  /** Previous profile for change detection (optional). */
  previousProfile?: UserTrainingProfile | null;
}

// ── Output ─────────────────────────────────────────────────────────────────

export interface AdaptiveIntelligenceOutput {
  // V2 legacy outputs (backward compatible)
  progression: ProgressionRecommendation | null;
  newExerciseProgression: ProgressionRecommendation;
  fatigue: FatigueSignal | null;
  recovery: RecoverySuggestion[];
  recoveryStatus: string | null;
  warmup: WarmupPlan | null;
  insights: TrainingInsight[];
  contextualTips: ContextualTip[];

  // Phase 3 — Unified Signals
  signalState: UnifiedSignalState;
  overallConfidence: number;

  // Phase 3 — Profile & Identity
  profile: UserTrainingProfile;
  identity: IdentityInsight;
  profileChanges: ReturnType<typeof detectProfileChanges>;

  // Phase 3 — Adaptive Progression
  adaptiveProgression: SignalBackedRecommendation | null;

  // Phase 3 — Growth Modeling
  exerciseGrowth: ExerciseGrowthMetrics[];
  overallGrowth: OverallGrowth;

  // Phase 3 — Behavioral Coaching
  coachingCues: CoachingCue[];
  readinessCue: CoachingCue | null;
}

// ── Hook ───────────────────────────────────────────────────────────────────

export function useAdaptiveIntelligence(
  input: AdaptiveIntelligenceInput
): AdaptiveIntelligenceOutput {
  return useMemo(() => computeAdaptiveIntelligence(input), [input]);
}

// ── Pure Computer (usable outside React) ───────────────────────────────────

export function computeAdaptiveIntelligence(
  input: AdaptiveIntelligenceInput
): AdaptiveIntelligenceOutput {
  const { exerciseHistories, currentExercise, userContext, muscleMap, lastRecord, previousProfile } =
    input;

  // ── Phase 3: Unified Signal Pipeline ──
  const overallConfidence = computeOverallConfidence(exerciseHistories, userContext);
  const rawSignals = generateSignals(exerciseHistories, userContext, muscleMap);
  const signalState = aggregateSignals(rawSignals, overallConfidence);

  // ── Phase 3: Profile & Identity ──
  const profile = buildTrainingProfile(exerciseHistories, userContext);
  const identity = classifyFitnessIdentity(profile, signalState);
  const profileChanges = detectProfileChanges(previousProfile ?? null, profile);

  // ── V2 Legacy Engines (still computed for backward compat) ──
  const historyForCurrent = currentExercise
    ? exerciseHistories.find((h) => h.exerciseName === currentExercise.name) ?? null
    : null;

  const progression = historyForCurrent
    ? recommendProgression(historyForCurrent)
    : null;
  const newExerciseProgression = recommendForNewExercise(lastRecord, 1);
  const fatigue = detectFatigue(historyForCurrent, userContext, muscleMap);
  const recovery = getRecoverySuggestions(userContext);
  const recoveryStatus = getRecoveryStatusLine(userContext);

  const warmup = (() => {
    if (!currentExercise || currentExercise.sets.length === 0) return null;
    const workSets = currentExercise.sets.filter((s) => !s.isWarmup && s.completed);
    const lastWorkSet = workSets[workSets.length - 1];
    if (!lastWorkSet) return null;
    return generateWarmup(lastWorkSet.weight, lastWorkSet.reps, lastWorkSet.isBodyweight);
  })();

  const insights = generateInsights(exerciseHistories, userContext);

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

  // ── Phase 3: Adaptive Progression ──
  const adaptiveProgression = historyForCurrent
    ? recommendAdaptiveProgression(historyForCurrent, signalState, profile)
    : null;

  // ── Phase 3: Growth Modeling ──
  const exerciseGrowth = exerciseHistories.map((h) => computeGrowthMetrics(h));
  const overallGrowth = computeOverallGrowth(exerciseHistories);

  // ── Phase 3: Behavioral Coaching ──
  const coachingCues = generateCoachingCues(identity.identity, signalState, profile);
  const readinessCue = generateReadinessCue(signalState, profile, userContext);

  return {
    // V2
    progression,
    newExerciseProgression,
    fatigue,
    recovery,
    recoveryStatus,
    warmup,
    insights,
    contextualTips,
    // Phase 3
    signalState,
    overallConfidence,
    profile,
    identity,
    profileChanges,
    adaptiveProgression,
    exerciseGrowth,
    overallGrowth,
    coachingCues,
    readinessCue,
  };
}
