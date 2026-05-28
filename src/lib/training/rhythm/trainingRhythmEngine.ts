// ── FitCoach Phase 4B — Training Rhythm Engine ────────────────────────────
// Defines the "pulse" of the training session.
// Controls when and how intelligence is surfaced to the user.

import type { TrainingOSState } from '../state/trainingStateMachine';
import { getPhaseGroup } from '../state/trainingStateMachine';
import type { ExperienceIntensity } from '../experience/experienceIntensity';

// ── Public API ─────────────────────────────────────────────────────────────

export interface TrainingRhythm {
  /** Current rhythm phase name. */
  phase: 'entry' | 'slow' | 'peak' | 'recovery' | 'finish';
  /** How many seconds between tip refreshes. */
  tipRefreshIntervalSec: number;
  /** Whether the current phase allows new suggestions. */
  allowNewSuggestions: boolean;
  /** Whether the UI should feel "energetic" or "calm". */
  energyLevel: 'calm' | 'neutral' | 'energetic';
  /** Priority: which intelligence stream to favor. */
  primaryStream: 'progression' | 'coaching' | 'recovery' | 'narrative' | 'none';
  /** Whether to suppress non-essential UI. */
  focusMode: boolean;
}

/**
 * Compute the current training rhythm.
 * Called every time the OS state changes.
 */
export function computeRhythm(
  osState: TrainingOSState,
  intensity: ExperienceIntensity,
  setCountThisExercise: number,
  totalSetsInSession: number
): TrainingRhythm {
  const phase = getPhaseGroup(osState);

  // Tip refresh interval varies by phase and intensity
  const tipRefreshIntervalSec = (() => {
    switch (phase) {
      case 'entry': return 0; // show immediately, then wait
      case 'slow': return 15;
      case 'peak': return setCountThisExercise >= 3 ? 20 : 10;
      case 'recovery': return 0;
      case 'finish': return 0;
    }
  })();

  // Allow new suggestions based on phase and intensity
  const allowNewSuggestions = phase === 'peak' || phase === 'slow';

  // Energy level: calm during warmup/recovery, energetic during peak
  const energyLevel = (() => {
    if (intensity.animationLevel === 0) return 'calm';
    if (phase === 'peak') return 'energetic';
    if (phase === 'slow') return 'neutral';
    return 'calm';
  })();

  // Primary intelligence stream rotates by phase
  const primaryStream = ((): TrainingRhythm['primaryStream'] => {
    switch (phase) {
      case 'entry': return 'narrative';
      case 'slow': return 'progression';
      case 'peak':
        // Later in exercise → coaching over progression
        if (setCountThisExercise >= 4) return 'coaching';
        if (totalSetsInSession >= 12) return 'recovery';
        return 'progression';
      case 'recovery': return 'recovery';
      case 'finish': return 'narrative';
    }
  })();

  // Focus mode: suppress non-essential when deep in work
  const focusMode = phase === 'peak' && setCountThisExercise >= 3 && intensity.visualNoise === 'low';

  return {
    phase,
    tipRefreshIntervalSec,
    allowNewSuggestions,
    energyLevel,
    primaryStream,
    focusMode,
  };
}

/**
 * Should a tip be shown now, or is it too soon?
 */
export function shouldRefreshTip(
  lastTipAt: number,
  rhythm: TrainingRhythm,
  now: number
): boolean {
  if (rhythm.tipRefreshIntervalSec === 0) return true;
  return now - lastTipAt >= rhythm.tipRefreshIntervalSec * 1000;
}

/**
 * Should the UI show the "last push" energy for final sets?
 */
export function isFinalPushPhase(
  osState: TrainingOSState,
  setCount: number,
  targetSets: number
): boolean {
  return osState === 'active_set' && targetSets > 0 && setCount >= targetSets - 1;
}
