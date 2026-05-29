// ── Generate Rest Insights ────────────────────────────────────────────────────
// Contextual insights shown during rest — useful, never distracting.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutRuntimeState } from '../state-machine/buildWorkoutRuntimeState'

export interface RestInsight {
  text: string
  type: 'form_tip' | 'progression' | 'recovery' | 'momentum'
  isVisible: boolean
}

const FORM_TIPS: Record<string, string> = {
  '卧推':     '确保肩胛骨收紧，护腕放松',
  '硬拉':     '保持脊柱中立，核心收紧',
  '深蹲':     '膝盖追踪脚尖，保持挺胸',
  '引体向上':  '全程控制下降，避免甩身',
  '哑铃卧推':  '哑铃路径略弧形，顶部不完全锁定',
  '肩推':     '核心紧绷，避免腰椎过伸',
  '二头弯举':  '固定肘部位置，全程匀速',
  '三头下压':  '肘部贴紧身体，顶部完全伸直',
}

/** Generate a contextual rest insight. */
export function generateRestInsight(
  state: WorkoutRuntimeState,
  lastSetWeight: number | null,
  lastSetReps: number | null
): RestInsight | null {
  const { currentExercise, completedSetsThisExercise, momentum, totalSetsLogged } = state
  const exerciseName = currentExercise?.split(' (')[0] ?? ''

  // Only show insights after first set — not on the very first rest
  if (completedSetsThisExercise < 1) return null

  // Progression hint after completing sets with good RIR space
  if (completedSetsThisExercise >= 2 && lastSetWeight && lastSetReps && lastSetReps <= 6) {
    return {
      text: `${lastSetWeight}kg × ${lastSetReps} — 强度区间良好`,
      type: 'progression',
      isVisible: true,
    }
  }

  // Momentum note when session is going well
  if (momentum === 'rising' && totalSetsLogged >= 4) {
    return {
      text: '今天节奏很好，保持',
      type: 'momentum',
      isVisible: true,
    }
  }

  // Form tip for known exercises
  const tip = FORM_TIPS[exerciseName]
  if (tip) {
    return {
      text: tip,
      type: 'form_tip',
      isVisible: true,
    }
  }

  return null
}
