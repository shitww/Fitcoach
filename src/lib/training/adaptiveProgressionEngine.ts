// ── FitCoach Phase 3 — Adaptive Progression Engine ──────────────────────────
// Signal-aware progression that adapts to user profile.
// Consumes unified signals, not raw data directly.

import type { ExerciseHistory } from './trainingTypes';
import type { TrainingSignal, UnifiedSignalState, SignalBackedRecommendation } from './signals/signalTypes';
import type { UserTrainingProfile } from './profile/profileTypes';
import { hasSignal, getSignal } from './signals/signalAggregator';

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Generate an adaptive progression recommendation for an exercise.
 * Takes into account:
 *   - Unified signal state (fatigue, volume, performance)
 *   - User training profile (style, experience, progression behavior)
 *   - Exercise-specific history
 *
 * Returns null if no recommendation can be made.
 */
export function recommendAdaptiveProgression(
  history: ExerciseHistory,
  signalState: UnifiedSignalState,
  profile: UserTrainingProfile
): SignalBackedRecommendation | null {
  if (history.sessions.length === 0) return null;

  const latestSession = history.sessions[history.sessions.length - 1];
  const workSets = latestSession.sets.filter((s) => s.weight > 0);
  if (workSets.length === 0) return null;

  const maxWeight = Math.max(...workSets.map((s) => s.weight));
  const setsAtMax = workSets.filter((s) => s.weight === maxWeight);
  const avgReps = setsAtMax.reduce((s, set) => s + set.reps, 0) / setsAtMax.length;

  // ── Safety gates (signals override everything) ──

  if (hasSignal(signalState, 'overreaching_detected') || hasSignal(signalState, 'fatigue_risk')) {
    return buildRec(
      '建议降低重量或维持当前重量',
      'deload',
      ['fatigue_risk', 'overreaching_detected'],
      signalState.overallConfidence,
      '检测到疲劳风险，优先恢复'
    );
  }

  if (hasSignal(signalState, 'volume_falling')) {
    return buildRec(
      '先稳定当前重量，专注动作质量',
      'maintain',
      ['volume_falling'],
      getSignalConfidence(signalState, 'volume_falling'),
      '容量下降，不宜贸然加重'
    );
  }

  if (hasSignal(signalState, 'form_degrading')) {
    return buildRec(
      '降低重量，恢复动作控制',
      'reduce',
      ['form_degrading'],
      getSignalConfidence(signalState, 'form_degrading'),
      '近期力竭率过高'
    );
  }

  // ── Profile-aware progression ──

  const baseConfidence = signalState.overallConfidence;

  // Beginner: slower progression
  if (profile.experience === 'beginner') {
    if (avgReps >= 10) {
      return buildRec(
        `尝试 ${incrementWeight(maxWeight, profile)}kg × 8`,
        'increase',
        ['progression_ready'],
        adjustConfidence(baseConfidence, 0.7),
        '新手阶段，保守加重保证动作质量'
      );
    }
    return buildRec(
      `维持 ${maxWeight}kg，尝试做到 10 次`,
      'maintain',
      [],
      adjustConfidence(baseConfidence, 0.6),
      '新手阶段，优先提升次数'
    );
  }

  // Advanced: more nuanced
  if (profile.experience === 'advanced') {
    if (hasSignal(signalState, 'plateau_detected')) {
      if (profile.progressionStyle === 'conservative_wave') {
        return buildRec(
          '尝试 wave loading 或改变动作变式',
          'maintain',
          ['plateau_detected'],
          adjustConfidence(baseConfidence, 0.75),
          '平台期，建议调整训练变量'
        );
      }
      return buildRec(
        '尝试增加次数或做退让组突破平台',
        'maintain',
        ['plateau_detected'],
        adjustConfidence(baseConfidence, 0.65),
        '力量平台期，尝试容量突破'
      );
    }
  }

  // ── Style-aware ──

  if (profile.style === 'strength_focused') {
    if (avgReps >= 5) {
      return buildRec(
        `尝试 ${incrementWeight(maxWeight, profile)}kg × 3–5`,
        'increase',
        ['progression_ready'],
        adjustConfidence(baseConfidence, 0.85),
        '力量风格，低次数高重量'
      );
    }
  }

  if (profile.style === 'hypertrophy_focused') {
    if (avgReps >= 10) {
      return buildRec(
        `尝试 ${incrementWeight(maxWeight, profile)}kg × 8–10`,
        'increase',
        ['progression_ready'],
        adjustConfidence(baseConfidence, 0.85),
        '肌肥大风格，中等次数'
      );
    }
    return buildRec(
      `维持 ${maxWeight}kg，尝试做到 12 次`,
      'maintain',
      [],
      adjustConfidence(baseConfidence, 0.7),
      '肌肥大风格，优先提升次数'
    );
  }

  // ── Default logic ──

  if (hasSignal(signalState, 'progression_ready')) {
    return buildRec(
      `尝试 ${incrementWeight(maxWeight, profile)}kg × ${Math.round(avgReps)}`,
      'increase',
      ['progression_ready'],
      getSignalConfidence(signalState, 'progression_ready'),
      '次数充足，建议加重'
    );
  }

  if (avgReps >= 8) {
    return buildRec(
      `尝试 ${incrementWeight(maxWeight, profile)}kg × 8`,
      'increase',
      [],
      adjustConfidence(baseConfidence, 0.7),
      '次数达标，可尝试加重'
    );
  }

  return buildRec(
    `维持 ${maxWeight}kg，尝试提升次数`,
    'maintain',
    [],
    adjustConfidence(baseConfidence, 0.5),
    '当前次数偏少，先稳定重量'
  );
}

// ── Weight Arithmetic ──────────────────────────────────────────────────────

const PLATE_SMALLEST = 1.25;
const PLATE_STANDARD = 2.5;

function incrementWeight(current: number, profile: UserTrainingProfile): number {
  const baseIncrement = current >= 20 ? PLATE_STANDARD : PLATE_SMALLEST;
  const multiplier = profile.experience === 'beginner' ? 1 : profile.experience === 'intermediate' ? 1.5 : 1;
  const increment = baseIncrement * multiplier;
  return Math.round((current + increment) / PLATE_SMALLEST) * PLATE_SMALLEST;
}

// ── Builders ────────────────────────────────────────────────────────────────

function buildRec(
  text: string,
  action: string,
  backingSignals: string[],
  confidence: number,
  reason: string
): SignalBackedRecommendation {
  return {
    text,
    action,
    backingSignals: backingSignals as TrainingSignal['type'][],
    confidence: round2(confidence),
    reason,
  };
}

function getSignalConfidence(state: UnifiedSignalState, type: TrainingSignal['type']): number {
  return getSignal(state, type)?.confidence ?? state.overallConfidence;
}

function adjustConfidence(base: number, factor: number): number {
  return round2(Math.min(1, Math.max(0, base * factor)));
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
