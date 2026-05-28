// ── FitCoach Phase 3 — Behavioral Coaching Layer ──────────────────────────
// Coaching that adapts to the user's behavioral profile and current state.
// No generic advice — everything is contextual and profile-aware.

import type { UserTrainingProfile } from './profile/profileTypes';
import type { UnifiedSignalState } from './signals/signalTypes';
import { hasSignal } from './signals/signalAggregator';
import type { FitnessIdentity } from './fitnessIdentityEngine';
import type { UserTrainingContext } from './trainingTypes';

export interface CoachingCue {
  text: string;
  /** Why this cue is relevant now. */
  context: string;
  /** How important this cue is right now. */
  priority: 'low' | 'medium' | 'high';
  /** Which identity / signal triggered this. */
  trigger: string;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Generate behavioral coaching cues for the current session.
 * Adapts to identity + signals. Returns 0–3 cues max.
 */
export function generateCoachingCues(
  identity: FitnessIdentity,
  signalState: UnifiedSignalState,
  profile: UserTrainingProfile
): CoachingCue[] {
  const cues: CoachingCue[] = [];

  // Identity-specific cues
  cues.push(...identityCues(identity, signalState, profile));

  // Signal-driven cues
  cues.push(...signalDrivenCues(signalState, profile));

  // Profile-aware cues
  cues.push(...profileAwareCues(profile, signalState));

  // Deduplicate by text, sort by priority, cap at 3
  const seen = new Set<string>();
  return cues
    .filter((c) => {
      if (seen.has(c.text)) return false;
      seen.add(c.text);
      return true;
    })
    .sort((a, b) => priorityRank(b.priority) - priorityRank(a.priority))
    .slice(0, 3);
}

/**
 * Generate a single pre-workout readiness cue.
 */
export function generateReadinessCue(
  signalState: UnifiedSignalState,
  profile: UserTrainingProfile,
  context?: UserTrainingContext
): CoachingCue | null {
  if (hasSignal(signalState, 'fatigue_risk')) {
    return {
      text: '今日降低预期，专注动作质量',
      context: '疲劳风险信号',
      priority: 'high',
      trigger: 'fatigue_risk',
    };
  }

  if (hasSignal(signalState, 'recovery_good')) {
    return {
      text: '恢复良好，今日适合挑战',
      context: '恢复充分',
      priority: 'medium',
      trigger: 'recovery_good',
    };
  }

  if (context && context.daysSinceLastWorkout > 5) {
    return {
      text: '重新开始，从轻重量建立节奏',
      context: '训练间隔较长',
      priority: 'medium',
      trigger: 'long_break',
    };
  }

  return null;
}

// ── Identity Cues ──────────────────────────────────────────────────────────

function identityCues(
  identity: FitnessIdentity,
  signalState: UnifiedSignalState,
  profile: UserTrainingProfile
): CoachingCue[] {
  const cues: CoachingCue[] = [];

  switch (identity) {
    case 'the_grinder': {
      if (hasSignal(signalState, 'fatigue_risk')) {
        cues.push({
          text: '你已经连续多天训练，今天 lighter is smarter',
          context: 'grinder + fatigue',
          priority: 'high',
          trigger: identity,
        });
      }
      break;
    }
    case 'the_optimizer': {
      if (hasSignal(signalState, 'plateau_detected')) {
        cues.push({
          text: '平台期？尝试一次小幅突破（+2.5kg 或 +2 次）',
          context: 'optimizer + plateau',
          priority: 'medium',
          trigger: identity,
        });
      }
      break;
    }
    case 'the_explorer': {
      cues.push({
        text: `今日聚焦 ${profile.exercisePriority[0] ?? '核心动作'}，减少动作切换`,
        context: 'explorer needs focus',
        priority: 'medium',
        trigger: identity,
      });
      break;
    }
    case 'the_specialist': {
      if (hasSignal(signalState, 'neglected_muscle_group')) {
        cues.push({
          text: '今日加一组弱势肌群，防止失衡',
          context: 'specialist + neglected group',
          priority: 'medium',
          trigger: identity,
        });
      }
      break;
    }
    case 'the_comeback_kid': {
      cues.push({
        text: '不要求多，完成就是胜利',
        context: 'comeback kid needs consistency',
        priority: 'high',
        trigger: identity,
      });
      break;
    }
    case 'the_steady_climber': {
      if (hasSignal(signalState, 'progression_ready')) {
        cues.push({
          text: '状态稳定，今日可以尝试小幅加重',
          context: 'steady climber + ready',
          priority: 'low',
          trigger: identity,
        });
      }
      break;
    }
    case 'the_balanced_athlete': {
      if (hasSignal(signalState, 'muscle_imbalance')) {
        cues.push({
          text: '注意弱势肌群，均衡发展才能更强',
          context: 'balanced + imbalance',
          priority: 'medium',
          trigger: identity,
        });
      }
      break;
    }
  }

  return cues;
}

// ── Signal-Driven Cues ─────────────────────────────────────────────────────

function signalDrivenCues(
  signalState: UnifiedSignalState,
  _profile: UserTrainingProfile
): CoachingCue[] {
  const cues: CoachingCue[] = [];

  if (hasSignal(signalState, 'overreaching_detected')) {
    cues.push({
      text: '近期容量下降，这是身体的信号——减载',
      context: 'overreaching signal',
      priority: 'high',
      trigger: 'overreaching_detected',
    });
  }

  if (hasSignal(signalState, 'rest_insufficient')) {
    cues.push({
      text: '组间再休息 30 秒，力量恢复更充分',
      context: 'rest signal',
      priority: 'medium',
      trigger: 'rest_insufficient',
    });
  }

  if (hasSignal(signalState, 'pr_streak')) {
    cues.push({
      text: '状态正佳，保持控制不要冒进',
      context: 'PR streak active',
      priority: 'low',
      trigger: 'pr_streak',
    });
  }

  if (hasSignal(signalState, 'volume_spike')) {
    cues.push({
      text: '今日容量突增，注意下一组的表现',
      context: 'volume spike',
      priority: 'medium',
      trigger: 'volume_spike',
    });
  }

  return cues;
}

// ── Profile-Aware Cues ─────────────────────────────────────────────────────

function profileAwareCues(
  profile: UserTrainingProfile,
  signalState: UnifiedSignalState
): CoachingCue[] {
  const cues: CoachingCue[] = [];

  if (profile.experience === 'beginner' && hasSignal(signalState, 'progression_ready')) {
    cues.push({
      text: '新手红利期，每周稳定进步即可',
      context: 'beginner + ready',
      priority: 'low',
      trigger: 'beginner_pattern',
    });
  }

  if (profile.progressionStyle === 'aggressive_linear' && hasSignal(signalState, 'plateau_detected')) {
    cues.push({
      text: '线性增重遇到瓶颈，尝试 wave loading',
      context: 'aggressive + plateau',
      priority: 'medium',
      trigger: 'plateau_detected',
    });
  }

  if (profile.highFailureRate && !hasSignal(signalState, 'fatigue_risk')) {
    cues.push({
      text: '你经常练到力竭，今天留 1-2 次余力',
      context: 'high failure rate',
      priority: 'medium',
      trigger: 'form_degrading',
    });
  }

  return cues;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function priorityRank(p: CoachingCue['priority']): number {
  switch (p) {
    case 'high':
      return 3;
    case 'medium':
      return 2;
    case 'low':
      return 1;
  }
}
