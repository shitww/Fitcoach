// ── FitCoach Phase 3 — Fitness Identity System ──────────────────────────────
// Classifies the user into a training identity based on long-term behavior.
// Not a label for vanity — drives adaptive coaching and expectations.

import type { UserTrainingProfile } from './profile/profileTypes';
import type { UnifiedSignalState } from './signals/signalTypes';
import { hasSignal } from './signals/signalAggregator';

// ── Identity Types ───────────────────────────────────────────────────────────

export type FitnessIdentity =
  | 'the_grinder' // high frequency, pushes hard, needs deload reminders
  | 'the_optimizer' // data-driven, perfect form, careful progression
  | 'the_explorer' // tries many exercises, inconsistent, needs structure
  | 'the_specialist' // focuses on 2-3 lifts, narrow but deep
  | 'the_balanced_athlete' // even development, moderate everything
  | 'the_comeback_kid' // inconsistent history, restarting often
  | 'the_steady_climber'; // consistent slow progression, reliable

export interface IdentityInsight {
  identity: FitnessIdentity;
  /** 0–1 confidence in this classification. */
  confidence: number;
  /** Why this identity was assigned. */
  reasoning: string;
  /** What this identity implies for coaching. */
  coachingImplication: string;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Classify user into a fitness identity.
 * Call monthly or after significant profile changes.
 */
export function classifyFitnessIdentity(
  profile: UserTrainingProfile,
  signalState: UnifiedSignalState
): IdentityInsight {
  const checks = [
    checkGrinder(profile, signalState),
    checkOptimizer(profile, signalState),
    checkExplorer(profile, signalState),
    checkSpecialist(profile, signalState),
    checkComebackKid(profile, signalState),
    checkSteadyClimber(profile, signalState),
    checkBalancedAthlete(profile, signalState),
  ];

  // Pick highest-confidence match
  const best = checks.filter(Boolean).sort((a, b) => b!.confidence - a!.confidence)[0];

  if (best) return best;

  // Fallback
  return {
    identity: 'the_steady_climber',
    confidence: 0.3,
    reasoning: '数据不足，暂归为稳定进步型',
    coachingImplication: '保持现有节奏，逐步建立训练档案',
  };
}

// ── Identity Detectors ─────────────────────────────────────────────────────

function checkGrinder(
  profile: UserTrainingProfile,
  signalState: UnifiedSignalState
): IdentityInsight | null {
  const isHighFreq = profile.frequencyPattern === 'high_frequency';
  const isAggressive = profile.recoveryBehavior === 'aggressive';
  const hasFatigueRisk = hasSignal(signalState, 'fatigue_risk');
  const hasHighFailure = profile.highFailureRate;

  const score = [isHighFreq, isAggressive, hasFatigueRisk, hasHighFailure].filter(Boolean).length;
  if (score < 2) return null;

  return {
    identity: 'the_grinder',
    confidence: 0.5 + score * 0.12,
    reasoning: `高频训练 (${profile.frequencyPattern}) + 激进恢复风格 + 疲劳风险`,
    coachingImplication: '提醒主动恢复，防止过度训练，鼓励周期化减载',
  };
}

function checkOptimizer(
  profile: UserTrainingProfile,
  signalState: UnifiedSignalState
): IdentityInsight | null {
  const isConservative = profile.progressionStyle === 'conservative_wave';
  const lowFailure = !profile.highFailureRate;
  const noFatigue = !hasSignal(signalState, 'fatigue_risk');
  const moderateFreq = profile.frequencyPattern === 'moderate_frequency';

  const score = [isConservative, lowFailure, noFatigue, moderateFreq].filter(Boolean).length;
  if (score < 3) return null;

  return {
    identity: 'the_optimizer',
    confidence: 0.5 + score * 0.12,
    reasoning: '保守渐进 + 低失误率 + 规律训练',
    coachingImplication: '鼓励在适当时机突破舒适区，尝试更激进的渐进',
  };
}

function checkExplorer(
  profile: UserTrainingProfile,
  signalState: UnifiedSignalState
): IdentityInsight | null {
  const manyExercises = profile.exercisePriority.length >= 3;
  const irregular = profile.frequencyPattern === 'irregular';
  const hasSkip = profile.skipsSessions;
  const scatteredMuscles = profile.musclePriority.length >= 3;

  const score = [manyExercises, irregular, hasSkip, scatteredMuscles].filter(Boolean).length;
  if (score < 2) return null;

  return {
    identity: 'the_explorer',
    confidence: 0.5 + score * 0.12,
    reasoning: '动作种类多 + 频率不规律 + 训练计划性弱',
    coachingImplication: '建议简化动作选择，建立核心训练框架，提高一致性',
  };
}

function checkSpecialist(
  profile: UserTrainingProfile,
  signalState: UnifiedSignalState
): IdentityInsight | null {
  const fewExercises = profile.exercisePriority.length <= 2;
  const focusedMuscles = profile.musclePriority.length <= 2;
  const highSets = profile.avgSetsPerWorkout >= 20;

  const score = [fewExercises, focusedMuscles, highSets].filter(Boolean).length;
  if (score < 2) return null;

  return {
    identity: 'the_specialist',
    confidence: 0.5 + score * 0.15,
    reasoning: '动作聚焦 + 肌群集中 + 高容量',
    coachingImplication: '关注弱势肌群平衡，避免过度专项化带来的失衡风险',
  };
}

function checkComebackKid(
  profile: UserTrainingProfile,
  signalState: UnifiedSignalState
): IdentityInsight | null {
  const hasSkip = profile.skipsSessions;
  const lowFreq = profile.frequencyPattern === 'low_frequency';
  const inconsistent = profile.progressionStyle === 'inconsistent';

  const score = [hasSkip, lowFreq, inconsistent].filter(Boolean).length;
  if (score < 2) return null;

  return {
    identity: 'the_comeback_kid',
    confidence: 0.5 + score * 0.15,
    reasoning: '训练不规律 + 频繁中断 + 进度不稳定',
    coachingImplication: '降低预期，重建训练习惯比追求进步更重要',
  };
}

function checkSteadyClimber(
  profile: UserTrainingProfile,
  signalState: UnifiedSignalState
): IdentityInsight | null {
  const consistent = profile.frequencyPattern === 'moderate_frequency';
  const balancedRecovery = profile.recoveryBehavior === 'balanced';
  const noPlateau = !hasSignal(signalState, 'plateau_detected');
  const noFatigue = !hasSignal(signalState, 'fatigue_risk');

  const score = [consistent, balancedRecovery, noPlateau, noFatigue].filter(Boolean).length;
  if (score < 3) return null;

  return {
    identity: 'the_steady_climber',
    confidence: 0.5 + score * 0.12,
    reasoning: '规律训练 + 平衡恢复 + 持续进步',
    coachingImplication: '保持节奏，适时引入训练变量刺激新适应',
  };
}

function checkBalancedAthlete(
  profile: UserTrainingProfile,
  signalState: UnifiedSignalState
): IdentityInsight | null {
  const evenMuscles = profile.musclePriority.length >= 3;
  const mixedStyle = profile.style === 'mixed';
  const moderateFreq =
    profile.frequencyPattern === 'moderate_frequency' ||
    profile.frequencyPattern === 'high_frequency';
  const noImbalance = !hasSignal(signalState, 'muscle_imbalance');

  const score = [evenMuscles, mixedStyle, moderateFreq, noImbalance].filter(Boolean).length;
  if (score < 3) return null;

  return {
    identity: 'the_balanced_athlete',
    confidence: 0.5 + score * 0.12,
    reasoning: '全面发展 + 混合训练风格 + 肌群均衡',
    coachingImplication: '保持全面性，可针对弱项进行专项强化周期',
  };
}
