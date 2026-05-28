// ── Predict Workout Session ───────────────────────────────────────────────────
// Predicts what the user is most likely to train today.
// Fuses recent history, recovery, frequency, training style, and time spacing.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PredictedWorkoutSession,
  PredictedExerciseCandidate,
  PredictionSignal,
  PredictionReason,
} from '@/types/predictive-flow';
import type {
  WorkoutSessionMemory,
  BodyRecoverySnapshot,
  TrainingStyleProfile,
} from '@/types/workout-memory';
import { calculatePredictionConfidence } from '../ranking/calculatePredictionConfidence';

export interface SessionPredictionInput {
  recentSessions: readonly WorkoutSessionMemory[];
  recoverySnapshot: BodyRecoverySnapshot;
  trainingStyle: TrainingStyleProfile;
  today: Date;
}

const SPLIT_PATTERNS: Record<string, string[]> = {
  push: ['chest', 'shoulders', 'triceps'],
  pull: ['back', 'biceps', 'rear_delts'],
  legs: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
  upper: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
  lower: ['quadriceps', 'hamstrings', 'glutes', 'calves'],
  fullbody: ['chest', 'back', 'legs', 'shoulders', 'arms'],
};

/** Infer split label from muscle groups trained. */
function inferSplit(muscleGroups: string[]): string {
  const set = new Set(muscleGroups);
  for (const [split, muscles] of Object.entries(SPLIT_PATTERNS)) {
    const matchCount = muscles.filter((m) => set.has(m)).length;
    if (matchCount >= muscles.length * 0.5) return split;
  }
  return 'mixed';
}

/** Predict today's workout session type.
 *  Deterministic scoring based on multiple signals.
 */
export function predictWorkoutSession(
  input: SessionPredictionInput
): PredictedWorkoutSession {
  const { recentSessions, recoverySnapshot, trainingStyle, today } = input;

  const signals: PredictionSignal[] = [];
  const reasoning: PredictionReason[] = [];

  // 1. Detect recent split pattern (e.g. PPL rotation)
  const recentSplits = recentSessions
    .slice(0, 5)
    .map((s) => inferSplit(s.muscleGroups));
  const lastSplit = recentSplits[0] || null;

  // 2. Time spacing signal
  let daysSinceLast = 999;
  if (recentSessions.length > 0) {
    const lastDate = new Date(recentSessions[0].date);
    daysSinceLast = Math.floor(
      (today.getTime() - lastDate.getTime()) / 86_400_000
    );
  }

  const spacingSignal = daysSinceLast <= 1 ? 0.1 : daysSinceLast <= 3 ? 0.6 : 1.0;
  signals.push({
    name: 'time_spacing',
    value: spacingSignal,
    weight: 0.15,
    source: 'session-prediction',
  });

  if (daysSinceLast <= 1) {
    reasoning.push({
      type: 'time_spacing',
      text: 'Trained yesterday — may need different stimulus',
      confidence: 0.7,
    });
  } else if (daysSinceLast >= 2) {
    reasoning.push({
      type: 'time_spacing',
      text: `${daysSinceLast} days since last workout — good recovery window`,
      confidence: 0.9,
    });
  }

  // 3. Recovery signal: find the most recovered major muscle group
  const recoveredGroups = recoverySnapshot.muscleGroups.filter(
    (g) => g.status === 'recovered'
  );
  const recoveryValue = recoveredGroups.length / recoverySnapshot.muscleGroups.length;
  signals.push({
    name: 'recovery_state',
    value: recoveryValue,
    weight: 0.25,
    source: 'session-prediction',
  });

  // 4. Frequency signal: which split has been done most in last 30 days
  const splitCounts = new Map<string, number>();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() - 30);
  for (const session of recentSessions) {
    if (new Date(session.date) < cutoff) continue;
    const split = inferSplit(session.muscleGroups);
    splitCounts.set(split, (splitCounts.get(split) || 0) + 1);
  }

  const maxSplitCount = Math.max(...Array.from(splitCounts.values()), 0);
  const totalSessions30d = Array.from(splitCounts.values()).reduce((a, b) => a + b, 0);
  const freqValue = totalSessions30d > 0 ? maxSplitCount / totalSessions30d : 0;
  signals.push({
    name: 'frequency',
    value: freqValue,
    weight: 0.2,
    source: 'session-prediction',
  });

  // 5. Training style signal
  const styleMap: Record<string, string[]> = {
    strength_focused: ['push', 'pull', 'legs', 'upper', 'lower'],
    hypertrophy_focused: ['push', 'pull', 'legs', 'upper'],
    high_volume: ['push', 'pull', 'legs'],
    minimalist: ['fullbody', 'upper', 'lower'],
    compound_heavy: ['push', 'pull', 'legs', 'fullbody'],
    machine_heavy: ['push', 'pull', 'legs', 'upper'],
    cardio_focused: ['fullbody'],
    mixed: ['push', 'pull', 'legs', 'upper', 'fullbody'],
  };

  const styleSplits = styleMap[trainingStyle.primaryStyle] || ['push', 'pull', 'legs'];
  signals.push({
    name: 'training_style',
    value: trainingStyle.confidence,
    weight: 0.15,
    source: 'session-prediction',
  });

  // Determine predicted split
  // Strategy: pick the split that is most recovered AND follows the recent pattern
  let predictedSplit = 'push';
  let bestScore = 0;

  const candidateSplits = ['push', 'pull', 'legs', 'upper', 'lower', 'fullbody'];

  for (const split of candidateSplits) {
    const targetMuscles = SPLIT_PATTERNS[split] || [];
    const avgRecovery =
      targetMuscles.length > 0
        ? targetMuscles.reduce((sum, m) => {
            const r = recoverySnapshot.muscleGroups.find((g) => g.muscleGroup === m);
            return sum + (r?.recoveryScore ?? 100);
          }, 0) / targetMuscles.length
        : 100;

    // Prefer splits that haven't been done recently
    const lastIndex = recentSplits.indexOf(split);
    const recencyBonus = lastIndex === -1 ? 0.3 : lastIndex * 0.05;

    // Prefer splits aligned with training style
    const styleBonus = styleSplits.includes(split) ? 0.15 : 0;

    const splitScore = avgRecovery / 100 + recencyBonus + styleBonus;

    if (splitScore > bestScore) {
      bestScore = splitScore;
      predictedSplit = split;
    }
  }

  // Rotate through common patterns if user has a clear rotation
  if (recentSplits.length >= 3) {
    const last3 = recentSplits.slice(0, 3);
    if (last3[0] === 'push' && last3[1] === 'pull') predictedSplit = 'legs';
    else if (last3[0] === 'pull' && last3[1] === 'legs') predictedSplit = 'push';
    else if (last3[0] === 'legs' && last3[1] === 'push') predictedSplit = 'pull';
  }

  // Build reasoning
  reasoning.push({
    type: 'recovery_state',
    text: `${predictedSplit} muscles are most recovered`,
    confidence: recoveryValue,
  });

  if (recentSplits.length >= 2) {
    reasoning.push({
      type: 'recent_history',
      text: `Recent splits: ${recentSplits.slice(0, 3).join(' → ')}`,
      confidence: 0.8,
    });
  }

  reasoning.push({
    type: 'training_style',
    text: `Training style: ${trainingStyle.primaryStyle.replace('_', ' ')}`,
    confidence: trainingStyle.confidence,
  });

  const confidence = calculatePredictionConfidence(signals);

  return {
    predictedSplit,
    confidence: confidence.overall,
    supportingSignals: signals,
    suggestedExercises: [], // populated by consumers with candidate ranking
    reasoning,
    estimatedDurationMin: 45,
    targetMuscleGroups: SPLIT_PATTERNS[predictedSplit] || [],
  };
}
