// ── Reduce Interaction Distance ───────────────────────────────────────────────
// Minimizes the physical distance a thumb needs to travel per interaction.
// Context-aware: surfaces the right action at the right moment.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutRuntimePhase } from '../state-machine/buildWorkoutRuntimeState'

export type PrimaryAction =
  | 'log_set'           // active_set phase
  | 'skip_rest'         // rest phase
  | 'start_set'         // ready after rest
  | 'next_exercise'     // transition phase
  | 'finish_workout'    // completion phase
  | 'add_exercise'      // pre_workout phase

export interface InteractionSurface {
  primaryAction: PrimaryAction
  primaryLabel: string
  primaryColor: string
  /** Whether the primary button should take full width */
  fullWidth: boolean
  /** Whether to show step controls (weight/reps adjusters) */
  showStepControls: boolean
  /** Whether secondary controls should be visible */
  showSecondary: boolean
}

/** Get the reduced-interaction surface for the current phase. */
export function getInteractionSurface(
  phase: WorkoutRuntimePhase,
  hasExercise: boolean
): InteractionSurface {
  switch (phase) {
    case 'active_set':
      return {
        primaryAction: 'log_set',
        primaryLabel: '完成此组',
        primaryColor: 'var(--accent)',
        fullWidth: true,
        showStepControls: true,
        showSecondary: false,
      }

    case 'rest':
      return {
        primaryAction: 'skip_rest',
        primaryLabel: '跳过休息',
        primaryColor: 'var(--surface-2)',
        fullWidth: false,
        showStepControls: false,
        showSecondary: false,
      }

    case 'transition':
      return {
        primaryAction: 'next_exercise',
        primaryLabel: '开始下一个',
        primaryColor: 'var(--accent)',
        fullWidth: true,
        showStepControls: false,
        showSecondary: false,
      }

    case 'pre_workout':
      return {
        primaryAction: hasExercise ? 'log_set' : 'add_exercise',
        primaryLabel: hasExercise ? '开始训练' : '选择动作',
        primaryColor: 'var(--accent)',
        fullWidth: true,
        showStepControls: false,
        showSecondary: false,
      }

    case 'completion':
      return {
        primaryAction: 'finish_workout',
        primaryLabel: '查看训练总结',
        primaryColor: 'var(--accent)',
        fullWidth: true,
        showStepControls: false,
        showSecondary: false,
      }

    default:
      return {
        primaryAction: 'add_exercise',
        primaryLabel: '开始训练',
        primaryColor: 'var(--accent)',
        fullWidth: true,
        showStepControls: false,
        showSecondary: false,
      }
  }
}
