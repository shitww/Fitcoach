// ── FitCoach Phase 4B — Training OS Hook ──────────────────────────────────
// The single hook that drives the entire training experience.
// Wires zustand stores → Phase 3 intelligence → OS controller → unified UI output.
//
// Usage:
//   const os = useTrainingOS(intelligenceInput);
//   <OSDisplay os={os} />

import { useMemo, useRef, useDeferredValue } from 'react';
import { useWorkoutTimer } from '@/stores/workoutTimer';
import { useWorkoutSession } from '@/stores/workoutSession';
import type { AdaptiveIntelligenceInput } from './useAdaptiveIntelligence';
import { computeAdaptiveIntelligence } from './useAdaptiveIntelligence';
import type { TrainingOSOutput } from '@/lib/training/orchestrator/trainingExperienceController';
import { computeTrainingOS } from '@/lib/training/orchestrator/trainingExperienceController';

const IDLE_OUTPUT: TrainingOSOutput = {
  osState: 'idle',
  previousOSState: null,
  stateLabel: '未开始',
  isInSession: false,
  isWorkingState: false,
  rhythm: {
    phase: 'entry',
    tipRefreshIntervalSec: 30,
    allowNewSuggestions: false,
    energyLevel: 'calm',
    primaryStream: 'none',
    focusMode: false,
  },
  intensity: {
    tipCap: 0,
    chipCap: 0,
    animationLevel: 0,
    infoDensity: 'minimal',
    showProgression: false,
    showInsights: false,
    showCoaching: false,
    visualNoise: 'low',
  },
  narrative: null,
  displayItems: [],
  fatigue: null,
  progression: null,
  adaptiveProgression: null,
  warmup: null,
  recoveryStatus: null,
  overallConfidence: 0,
};

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * The single Training OS hook.
 * PROHIBITED on first screen — only computes when user is in an active workout.
 * Heavy intelligence engines run inside useMemo but gated by session phase.
 * Use useDeferredValue on input to avoid blocking React render phase.
 */
export function useTrainingOS(intelligenceInput: AdaptiveIntelligenceInput): TrainingOSOutput {
  const timer = useWorkoutTimer();
  const session = useWorkoutSession();
  const prevStateRef = useRef<TrainingOSOutput['osState'] | null>(null);

  // Deferred input prevents heavy computation from blocking UI transitions
  const deferredInput = useDeferredValue(intelligenceInput);

  const isActive = timer.sessionPhase === 'active' || timer.sessionPhase === 'paused';

  return useMemo(() => {
    // ── Rule: computeTrainingOS is ONLY allowed after user enters active workout ──
    if (!isActive) {
      prevStateRef.current = null;
      return IDLE_OUTPUT;
    }

    // 1. Compute Phase 3 intelligence (heavy CPU — deferred input isolates it)
    const intelligence = computeAdaptiveIntelligence(deferredInput);

    // 2. Build OS input
    const osInput = {
      timer: {
        sessionPhase: timer.sessionPhase,
        isRestActive: timer.isRestActive,
        trainingDurationSec: timer.isTrainingActive && timer.trainingStartTime
          ? Math.floor((Date.now() - timer.trainingStartTime) / 1000)
          : timer.trainingDuration,
        totalSetsInSession: timer.totalSets,
      },
      session: {
        exercises: session.exercises.map((e) => ({
          name: e.name,
          sets: e.sets.map((s) => ({ completed: s.completed, isWarmup: s.isWarmup })),
        })),
        activeExerciseName: session.activeExerciseName,
        prCount: 0,
      },
      intelligence: {
        signalState: intelligence.signalState,
        profile: intelligence.profile,
        identity: intelligence.identity,
        adaptiveProgression: intelligence.adaptiveProgression,
        fatigue: intelligence.fatigue,
        recovery: intelligence.recovery,
        recoveryStatus: intelligence.recoveryStatus,
        warmup: intelligence.warmup,
        insights: intelligence.insights,
        contextualTips: intelligence.contextualTips,
        coachingCues: intelligence.coachingCues,
        readinessCue: intelligence.readinessCue,
        exerciseGrowth: intelligence.exerciseGrowth,
        overallGrowth: intelligence.overallGrowth,
      },
      previousOSState: prevStateRef.current,
    };

    // 3. Compute OS output
    const output = computeTrainingOS(osInput);

    // 4. Update previous state ref
    prevStateRef.current = output.osState;

    return output;
  }, [
    isActive,
    deferredInput,
    timer.sessionPhase,
    timer.isRestActive,
    timer.trainingDuration,
    timer.trainingStartTime,
    timer.isTrainingActive,
    timer.totalSets,
    session.exercises,
    session.activeExerciseName,
  ]);
}
