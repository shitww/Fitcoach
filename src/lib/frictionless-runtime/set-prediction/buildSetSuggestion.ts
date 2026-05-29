// ── Build Set Suggestion ─────────────────────────────────────────────────────
// Assembles a PredictedSetSuggestion from progressive load + context signals.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PredictedSetSuggestion,
  SetPredictionInput,
  CompletedSetRecord,
} from '@/types/frictionless-runtime';
import type { PredictionReason } from '@/types/predictive-flow';
import {
  calculateProgressiveLoad,
} from './calculateProgressiveLoad';

/** Build a fully-enriched set suggestion from prediction inputs.
 *  The primary output consumed by UI — handles all reasoning.
 */
export function buildSetSuggestion(
  input: SetPredictionInput
): PredictedSetSuggestion {
  const {
    exerciseId,
    exerciseName,
    setNumber,
    previousSetsThisSession,
    lastSessionSets,
    fatigueEstimate,
    workoutStyle,
    volumeTrend,
  } = input;

  const load = calculateProgressiveLoad({
    lastSessionSets,
    currentSessionSets: previousSetsThisSession,
    setNumber,
    workoutStyle,
    fatigueEstimate,
    volumeTrend,
  });

  const reasoning = buildReasoning(
    input,
    load.progressionType,
    fatigueEstimate
  );

  const confidence = deriveConfidence(
    lastSessionSets,
    previousSetsThisSession,
    fatigueEstimate,
    load.progressionType
  );

  return {
    exerciseId,
    exerciseName,
    setNumber,
    suggestedWeight: load.targetWeight,
    suggestedReps: load.targetReps,
    suggestedRir: deriveRir(workoutStyle, setNumber, previousSetsThisSession),
    confidence,
    progressionType: load.progressionType,
    reasoning,
    delta: load.delta,
  };
}

function buildReasoning(
  input: SetPredictionInput,
  progressionType: PredictedSetSuggestion['progressionType'],
  fatigue: number
): PredictionReason[] {
  const reasons: PredictionReason[] = [];
  const { lastSessionSets, previousSetsThisSession, workoutStyle, volumeTrend } = input;

  if (lastSessionSets.length > 0) {
    const ref = getRepresentativeSet(lastSessionSets);
    reasons.push({
      type: 'recent_history',
      text: `Last session: ${ref.weight}kg × ${ref.reps}`,
      confidence: 0.9,
    });
  }

  if (progressionType === 'progressive_overload') {
    reasons.push({
      type: 'training_style',
      text: volumeTrend === 'up' ? 'Volume trending up — time to progress' : 'Good completion rate — adding rep',
      confidence: 0.8,
    });
  }

  if (progressionType === 'drop_set' && previousSetsThisSession.length > 0) {
    reasons.push({
      type: 'fatigue_ordering',
      text: 'Previous set hit failure — drop set suggested',
      confidence: 0.95,
    });
  }

  if (fatigue > 50) {
    reasons.push({
      type: 'recovery_state',
      text: `Fatigue ${Math.round(fatigue)}/100 — adjusted load`,
      confidence: 0.75,
    });
  }

  reasons.push({
    type: 'training_style',
    text: workoutStyle === 'strength'
      ? 'Strength focus — heavier, fewer reps'
      : workoutStyle === 'hypertrophy'
        ? 'Hypertrophy focus — moderate load'
        : 'Balanced training approach',
    confidence: 0.7,
  });

  return reasons;
}

function deriveConfidence(
  lastSessionSets: CompletedSetRecord[],
  currentSets: CompletedSetRecord[],
  fatigue: number,
  progressionType: string
): number {
  let score = 0.5;

  if (lastSessionSets.length >= 3) score += 0.25; // good history
  else if (lastSessionSets.length >= 1) score += 0.1;

  if (currentSets.length >= 1) score += 0.1; // in-session data

  if (fatigue < 30) score += 0.1; // low fatigue = more predictable
  if (fatigue > 70) score -= 0.1; // high fatigue = harder to predict

  if (progressionType === 'same_as_last') score += 0.05;
  if (progressionType === 'first_set') score -= 0.2;

  return Math.max(0.1, Math.min(1, Math.round(score * 100) / 100));
}

function deriveRir(
  style: SetPredictionInput['workoutStyle'],
  setNumber: number,
  previousSets: CompletedSetRecord[]
): number | null {
  if (style === 'endurance') return null;

  const baseRir = {
    strength: 2,
    hypertrophy: 1,
    mixed: 2,
    endurance: null,
  }[style] ?? 2;

  // Later sets tend to accumulate fatigue, so RIR decreases
  const fatiguePenalty = Math.min(setNumber - 1, 2);
  const adjusted = Math.max(0, (baseRir ?? 2) - fatiguePenalty);
  return adjusted;
}

function getRepresentativeSet(sets: CompletedSetRecord[]): CompletedSetRecord {
  return sets.reduce((best, s) =>
    s.type === 'working' && s.weight > (best?.weight ?? 0) ? s : best,
    sets[0]
  );
}
