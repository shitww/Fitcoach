/**
 * useWorkoutUI — Minimal consumer hook for workout UI components.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  CONSUMER CONTRACT  ·  For read-only display widgets and sub-components. │
 * │  The workout page (orchestrator) uses workoutTimer store directly.       │
 * │  No system internals, no AI metadata, no cardio params, no timer structs.│
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Exposes exactly:
 *   State  — currentExercise, currentSetIndex, totalSets,
 *             restRemainingSeconds, isTrainingActive
 *   Actions — startWorkout(), completeSet(), startRest(s), finishWorkout()
 *
 * What it permanently hides:
 *   sessionId · sessionPhase · now · trainingStartTime · trainingDuration
 *   restTimer · cardioParams · sessionType · feature flags · AI metadata
 *
 * Dependency chain (no leakage upward):
 *   workoutTimer store → useWorkoutUI → consumer UI components
 *                                              ↕ (never)
 *                  eventLog / causal / useWorkoutDebug
 */

import { useShallow } from 'zustand/shallow';
import {
  useWorkoutTimer,
  selectTrainingSeconds,
  selectRestSecondsRemaining,
} from '@/stores/workoutTimer';

// ── Contract version ──────────────────────────────────────────────────────────
/**
 * @frozen
 * Increment only when the contract changes (requires product + engineering sign-off).
 * The UI contract is intentionally minimal and stable — do not add fields or actions
 * without explicit approval. Complexity belongs in the runtime engine, not here.
 */
export const UI_CONTRACT_VERSION = '3.0.0' as const;

// ── Public contract ───────────────────────────────────────────────────────────

/**
 * The complete, minimal training state a UI consumer component needs.
 * No runtime system concepts, no session-machine state, no internal timers.
 */
export interface WorkoutUIState {
  // ── What the user is doing (readonly — UI may not mutate these directly) ───
  /** Name of the exercise currently in progress, or null when idle. */
  readonly currentExercise: string | null;
  /** Ordinal number of the NEXT set to perform (completedSets + 1). Zero when idle. */
  readonly currentSetIndex: number;
  /** Total sets completed so far in this session. */
  readonly totalSets: number;

  // ── Flow status (readonly) ─────────────────────────────────────────────────
  /** True while a training session is running (false when idle, paused, or done). */
  readonly isTrainingActive: boolean;

  // ── Timing (readonly, pre-computed) ──────────────────────────────────────
  /** Whole seconds remaining in the current rest period (0 when not resting). */
  readonly restRemainingSeconds: number;
  /** Total training seconds elapsed this session (live while active). */
  readonly trainingSeconds: number;

  // ── Semantic actions (the ONLY way UI may change workout state) ───────────
  /** Begin a new training session. */
  startWorkout: () => void;
  /** Notify the runtime that the current set was completed. */
  completeSet: () => void;
  /** Begin a timed rest period. */
  startRest: (seconds: number) => void;
  /** End the session and return duration metadata. */
  finishWorkout: () => { duration: number; startTime: number | null };
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useWorkoutUI(): WorkoutUIState {
  return useWorkoutTimer(
    useShallow(s => ({
      currentExercise:      s.currentExercise,
      currentSetIndex:      s.isTrainingActive ? s.totalSets + 1 : 0,
      totalSets:            s.totalSets,
      isTrainingActive:     s.isTrainingActive,
      restRemainingSeconds: selectRestSecondsRemaining(s),
      trainingSeconds:      selectTrainingSeconds(s),
      // Semantic action wrappers — names describe user intent, not store internals
      startWorkout:  s.startTraining,
      completeSet:   s.incrementSets,
      startRest:     s.startRest,
      finishWorkout: s.stopTraining,
    })),
  );
}
