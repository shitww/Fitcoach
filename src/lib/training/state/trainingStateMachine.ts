// ── FitCoach Phase 4B — Training OS State Machine ─────────────────────────
// Single canonical state model for the entire training experience.
// All UI derives from this state. No component-level state guessing.

/** The 7 canonical states of a training session. */
export type TrainingOSState =
  | 'idle'
  | 'preparing'
  | 'warming_up'
  | 'active_set'
  | 'resting'
  | 'recovering'
  | 'completing';

/** Valid state transitions. */
const VALID_TRANSITIONS: Record<TrainingOSState, TrainingOSState[]> = {
  idle: ['preparing'],
  preparing: ['warming_up', 'active_set', 'idle'],
  warming_up: ['active_set', 'preparing', 'idle'],
  active_set: ['resting', 'preparing', 'recovering', 'idle'],
  resting: ['active_set', 'preparing', 'recovering', 'idle'],
  recovering: ['completing', 'idle'],
  completing: ['idle'],
};

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Derive canonical TrainingOSState from timer + session state.
 * This is the ONLY function in the codebase that should compute this.
 */
export function deriveOSState(params: {
  timerSessionPhase: 'idle' | 'active' | 'paused' | 'done';
  isRestActive: boolean;
  hasExercises: boolean;
  activeExerciseName: string;
  currentExerciseSetCount: number;
  currentExerciseCompletedSetCount: number;
  isSessionFinishing: boolean;
}): TrainingOSState {
  const {
    timerSessionPhase,
    isRestActive,
    hasExercises,
    activeExerciseName,
    currentExerciseSetCount,
    currentExerciseCompletedSetCount,
    isSessionFinishing,
  } = params;

  // 1. Global session states
  if (timerSessionPhase === 'idle') return 'idle';
  if (timerSessionPhase === 'done') return 'completing';

  // 2. Finishing flow
  if (isSessionFinishing) return 'recovering';

  // 3. No exercise selected yet
  if (!hasExercises || !activeExerciseName) return 'preparing';

  // 4. Rest takes priority over everything else
  if (isRestActive) return 'resting';

  // 5. Warming up: exercise selected, but only warmup sets completed (or no sets yet)
  // Heuristic: if < 2 working sets completed, treat as warmup/early phase
  if (currentExerciseCompletedSetCount < 2 && currentExerciseSetCount < 3) {
    // If there are completed sets and they are all warmup-like (light weight), still warming_up
    return 'warming_up';
  }

  // 6. Active working sets
  return 'active_set';
}

/**
 * Check if a transition is valid.
 */
export function isValidTransition(from: TrainingOSState, to: TrainingOSState): boolean {
  return VALID_TRANSITIONS[from].includes(to);
}

/**
 * Get the "phase group" for rhythm / intensity purposes.
 */
export function getPhaseGroup(state: TrainingOSState): 'entry' | 'slow' | 'peak' | 'recovery' | 'finish' {
  switch (state) {
    case 'idle':
    case 'preparing':
      return 'entry';
    case 'warming_up':
      return 'slow';
    case 'active_set':
    case 'resting':
      return 'peak';
    case 'recovering':
      return 'recovery';
    case 'completing':
      return 'finish';
  }
}

/**
 * Human-readable state label for UI display.
 */
export function getStateLabel(state: TrainingOSState): string {
  switch (state) {
    case 'idle': return '未开始';
    case 'preparing': return '准备中';
    case 'warming_up': return '热身阶段';
    case 'active_set': return '训练中';
    case 'resting': return '休息中';
    case 'recovering': return '恢复中';
    case 'completing': return '完成';
  }
}

/**
 * Is the user currently "in session" (any non-idle, non-completing state).
 */
export function isInSession(state: TrainingOSState): boolean {
  return state !== 'idle' && state !== 'completing';
}

/**
 * Is the user in a "working" state where sets are being logged.
 */
export function isWorkingState(state: TrainingOSState): boolean {
  return state === 'active_set' || state === 'warming_up';
}
