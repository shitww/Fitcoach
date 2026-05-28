// ── FitCoach Phase 4B — Training Session Narrative Engine ──────────────────
// Generates unified session narratives triggered by state transitions.
// Not a chatbot. One-liner emotional state descriptions.

import type { TrainingOSState } from '../state/trainingStateMachine';
import type { TrainingRhythm } from '../rhythm/trainingRhythmEngine';
import type { FatigueSignal } from '../trainingTypes';
import type { FitnessIdentity } from '../fitnessIdentityEngine';
import type { IdentityInsight } from '../fitnessIdentityEngine';
import type { CoachingCue } from '../behavioralCoachingEngine';

// ── Public API ─────────────────────────────────────────────────────────────

export interface SessionNarrative {
  /** The narrative text to display. */
  text: string;
  /** When this narrative should appear. */
  trigger: 'entry' | 'mid_session' | 'exit' | 'phase_change';
  /** How long this narrative stays relevant (seconds). 0 = permanent until replaced. */
  ttlSec: number;
  /** Priority: higher replaces lower. */
  priority: number;
  /** Associated icon/emoji hint for UI. */
  mood: 'focused' | 'energized' | 'calm' | 'triumphant' | 'cautious' | 'neutral';
}

/**
 * Generate the current narrative for the session.
 * Called by the orchestrator on every significant state change.
 */
export function generateNarrative(
  osState: TrainingOSState,
  previousState: TrainingOSState | null,
  rhythm: TrainingRhythm,
  fatigue: FatigueSignal | null,
  identity: IdentityInsight,
  readinessCue: CoachingCue | null,
  sessionDurationSec: number,
  totalSets: number,
  prCount: number
): SessionNarrative | null {
  // Entry narratives
  if (osState === 'preparing' && previousState === 'idle') {
    return entryNarrative(identity, readinessCue, fatigue);
  }

  // Mid-session narratives (triggered on phase changes within session)
  if (previousState === 'resting' && osState === 'active_set') {
    return midSessionNarrative(rhythm, fatigue, identity, totalSets, sessionDurationSec);
  }

  // Warmup → active transition
  if (previousState === 'warming_up' && osState === 'active_set') {
    return {
      text: '热身完成，进入主训练',
      trigger: 'phase_change',
      ttlSec: 10,
      priority: 3,
      mood: 'focused',
    };
  }

  // Exit narratives
  if (osState === 'completing') {
    return exitNarrative(totalSets, prCount, sessionDurationSec, identity);
  }

  // Recovery phase
  if (osState === 'recovering') {
    return {
      text: '训练结束，身体正在恢复',
      trigger: 'exit',
      ttlSec: 30,
      priority: 5,
      mood: 'calm',
    };
  }

  return null;
}

// ── Entry Narratives ───────────────────────────────────────────────────────

function entryNarrative(
  identity: IdentityInsight,
  readinessCue: CoachingCue | null,
  fatigue: FatigueSignal | null
): SessionNarrative {
  if (fatigue && fatigue.level === 'elevated') {
    return {
      text: '今天放慢节奏，质量优先',
      trigger: 'entry',
      ttlSec: 0,
      priority: 10,
      mood: 'cautious',
    };
  }

  if (readinessCue) {
    return {
      text: readinessCue.text,
      trigger: 'entry',
      ttlSec: 0,
      priority: 8,
      mood: readinessCue.priority === 'high' ? 'cautious' : 'energized',
    };
  }

  const identityGreetings: Record<FitnessIdentity, string> = {
    the_grinder: '又一天，继续打磨',
    the_optimizer: '今日计划已就绪',
    the_explorer: '今天试试什么新动作？',
    the_specialist: '专注核心，精益求精',
    the_balanced_athlete: '全面训练，均衡发展',
    the_comeback_kid: '重新开始，就是胜利',
    the_steady_climber: '稳定节奏，持续进步',
  };

  return {
    text: identityGreetings[identity.identity] ?? '开始训练',
    trigger: 'entry',
    ttlSec: 0,
    priority: 5,
    mood: 'energized',
  };
}

// ── Mid-Session Narratives ─────────────────────────────────────────────────

function midSessionNarrative(
  rhythm: TrainingRhythm,
  fatigue: FatigueSignal | null,
  identity: IdentityInsight,
  totalSets: number,
  sessionDurationSec: number
): SessionNarrative | null {
  // Late-session fatigue awareness
  if (fatigue && fatigue.level !== 'none' && totalSets >= 8) {
    return {
      text: '后半程了，保持控制',
      trigger: 'mid_session',
      ttlSec: 15,
      priority: 7,
      mood: 'cautious',
    };
  }

  // Grinder identity late in session
  if (identity.identity === 'the_grinder' && totalSets >= 10) {
    return {
      text: '你又撑过了一组，这就是进步',
      trigger: 'mid_session',
      ttlSec: 15,
      priority: 4,
      mood: 'focused',
    };
  }

  // Steady climber encouragement
  if (identity.identity === 'the_steady_climber' && totalSets >= 6) {
    return {
      text: '状态稳定，继续保持',
      trigger: 'mid_session',
      ttlSec: 15,
      priority: 3,
      mood: 'focused',
    };
  }

  // Long session check
  if (sessionDurationSec >= 3600) {
    return {
      text: '已训练一小时，注意能量管理',
      trigger: 'mid_session',
      ttlSec: 20,
      priority: 6,
      mood: 'cautious',
    };
  }

  return null;
}

// ── Exit Narratives ────────────────────────────────────────────────────────

function exitNarrative(
  totalSets: number,
  prCount: number,
  sessionDurationSec: number,
  identity: IdentityInsight
): SessionNarrative {
  if (prCount > 0) {
    return {
      text: `完成！今日 ${prCount} 项突破，状态正佳`,
      trigger: 'exit',
      ttlSec: 0,
      priority: 10,
      mood: 'triumphant',
    };
  }

  if (totalSets >= 15) {
    return {
      text: `高容量完成，${totalSets} 组训练值得肯定`,
      trigger: 'exit',
      ttlSec: 0,
      priority: 8,
      mood: 'triumphant',
    };
  }

  if (sessionDurationSec < 900) {
    return {
      text: '简短高效，保持这个节奏',
      trigger: 'exit',
      ttlSec: 0,
      priority: 5,
      mood: 'neutral',
    };
  }

  const identityClosings: Record<FitnessIdentity, string> = {
    the_grinder: '又完成了一次打磨',
    the_optimizer: '数据已记录，下次再见',
    the_explorer: '今天探索了新可能',
    the_specialist: '专项训练完成',
    the_balanced_athlete: '全面发展，继续加油',
    the_comeback_kid: '你回来了，这很好',
    the_steady_climber: '稳步前行，日积月累',
  };

  return {
    text: identityClosings[identity.identity] ?? '训练完成',
    trigger: 'exit',
    ttlSec: 0,
    priority: 5,
    mood: 'calm',
  };
}
