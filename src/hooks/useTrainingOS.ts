// ── FitCoach Phase 4B — Training OS Hook ──────────────────────────────────
// The single hook that drives the entire training experience.
// Wires zustand stores → Phase 3 intelligence → OS controller → unified UI output.
//
// Usage:
//   const os = useTrainingOS(intelligenceInput);
//   <OSDisplay os={os} />

import { useMemo, useRef } from 'react';
import { useWorkoutTimer, selectWorkoutPhase } from '@/stores/workoutTimer';
import { useWorkoutSession } from '@/stores/workoutSession';
import type { AdaptiveIntelligenceInput } from './useAdaptiveIntelligence';
import { computeAdaptiveIntelligence } from './useAdaptiveIntelligence';
import type { TrainingOSOutput } from '@/lib/training/orchestrator/trainingExperienceController';
import { computeTrainingOS } from '@/lib/training/orchestrator/trainingExperienceController';

// ── Hook ───────────────────────────────────────────────────────────────────

/**
 * The single Training OS hook.
 * Pass the same input you would pass to useAdaptiveIntelligence.
 * Returns the complete unified OS output for rendering.
 */
export function useTrainingOS(intelligenceInput: AdaptiveIntelligenceInput): TrainingOSOutput {
  // Read from zustand stores
  const timer = useWorkoutTimer();
  const session = useWorkoutSession();

  // Track previous OS state for transition detection
  const prevStateRef = useRef<TrainingOSOutput['osState'] | null>(null);

  return useMemo(() => {
    // 1. Compute Phase 3 intelligence
    const intelligence = computeAdaptiveIntelligence(intelligenceInput);

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
        prCount: 0, // SessionSet doesn't track isPR; PR detection handled by intelligence layer
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
    intelligenceInput,
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
