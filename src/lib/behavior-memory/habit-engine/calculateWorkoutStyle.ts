// ── Workout Style Detector ──────────────────────────────────────────────────
// Deterministic classification of user's training style.
// All rules are explainable and human-readable.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  WorkoutSessionMemory,
  TrainingStyleProfile,
  TrainingStyle,
} from '@/types/workout-memory';
import { TRAINING_STYLES } from '@/types/workout-memory';

interface StyleEvidence {
  style: TrainingStyle;
  score: number; // 0-1
  reasons: string[];
}

/** Detect training style from session patterns.
 *  Each style gets a score based on deterministic heuristics.
 */
export function detectWorkoutStyle(
  sessions: readonly WorkoutSessionMemory[]
): TrainingStyleProfile {
  if (sessions.length === 0) {
    return {
      primaryStyle: 'mixed',
      secondaryStyles: [],
      confidence: 0,
      basis: ['No workout history available'],
    };
  }

  const evidence: StyleEvidence[] = [];

  // ── Strength-focused: low reps, high weight, few exercises
  const strengthEvidence = analyzeStrengthFocus(sessions);
  evidence.push(strengthEvidence);

  // ── Hypertrophy-focused: moderate reps, moderate weight, more volume
  const hypertrophyEvidence = analyzeHypertrophyFocus(sessions);
  evidence.push(hypertrophyEvidence);

  // ── High-volume: many sets, long sessions, many exercises
  const volumeEvidence = analyzeVolumeFocus(sessions);
  evidence.push(volumeEvidence);

  // ── Minimalist: few exercises per session, simple structure
  const minimalistEvidence = analyzeMinimalist(sessions);
  evidence.push(minimalistEvidence);

  // ── Compound-heavy: mostly multi-joint exercises
  const compoundEvidence = analyzeCompoundHeavy(sessions);
  evidence.push(compoundEvidence);

  // ── Machine-heavy: mostly machine-based exercises
  const machineEvidence = analyzeMachineHeavy(sessions);
  evidence.push(machineEvidence);

  // ── Cardio-focused: frequent cardio sessions
  const cardioEvidence = analyzeCardioFocus(sessions);
  evidence.push(cardioEvidence);

  // Sort by score
  evidence.sort((a, b) => b.score - a.score);

  const primary = evidence[0];
  const secondary = evidence
    .slice(1)
    .filter((e) => e.score > 0.4 && e.style !== primary.style)
    .map((e) => e.style);

  // Confidence is the gap between primary and next best
  const nextBest = evidence[1]?.score || 0;
  const confidence = Math.min(1, Math.max(0, (primary.score - nextBest) * 2));

  return {
    primaryStyle: primary.style,
    secondaryStyles: secondary,
    confidence: Math.round(confidence * 1000) / 1000,
    basis: primary.reasons,
  };
}

// ── Individual analyzers ───────────────────────────────────────────────────

function analyzeStrengthFocus(sessions: readonly WorkoutSessionMemory[]): StyleEvidence {
  let lowRepSets = 0;
  let totalSets = 0;
  let totalExercises = 0;

  for (const session of sessions) {
    for (const ex of session.exercises) {
      totalExercises++;
      for (const set of ex.sets) {
        totalSets++;
        if (set.reps <= 6) lowRepSets++;
      }
    }
  }

  const lowRepRatio = totalSets > 0 ? lowRepSets / totalSets : 0;
  const avgExercisesPerSession =
    sessions.length > 0 ? totalExercises / sessions.length : 0;

  const score =
    lowRepRatio * 0.6 + (avgExercisesPerSession <= 5 ? 0.3 : 0) + 0.1;

  const reasons: string[] = [];
  if (lowRepRatio > 0.4) reasons.push(`${Math.round(lowRepRatio * 100)}% sets ≤ 6 reps`);
  if (avgExercisesPerSession <= 5) reasons.push('Few exercises per session');

  return {
    style: 'strength_focused',
    score: Math.min(1, score),
    reasons: reasons.length > 0 ? reasons : ['Some low-rep work'],
  };
}

function analyzeHypertrophyFocus(
  sessions: readonly WorkoutSessionMemory[]
): StyleEvidence {
  let moderateRepSets = 0;
  let totalSets = 0;

  for (const session of sessions) {
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        totalSets++;
        if (set.reps >= 8 && set.reps <= 15) moderateRepSets++;
      }
    }
  }

  const moderateRepRatio = totalSets > 0 ? moderateRepSets / totalSets : 0;
  const score = moderateRepRatio * 0.7 + 0.2;

  return {
    style: 'hypertrophy_focused',
    score: Math.min(1, score),
    reasons:
      moderateRepRatio > 0.4
        ? [`${Math.round(moderateRepRatio * 100)}% sets in 8-15 rep range`]
        : ['Moderate rep ranges detected'],
  };
}

function analyzeVolumeFocus(sessions: readonly WorkoutSessionMemory[]): StyleEvidence {
  const avgSetsPerSession =
    sessions.reduce((s, sess) => {
      const sets = sess.exercises.reduce((ss, ex) => ss + ex.sets.length, 0);
      return s + sets;
    }, 0) / (sessions.length || 1);

  const avgExercises =
    sessions.reduce((s, sess) => s + sess.exercises.length, 0) /
    (sessions.length || 1);

  const score =
    (avgSetsPerSession > 20 ? 0.4 : avgSetsPerSession > 15 ? 0.25 : 0) +
    (avgExercises > 7 ? 0.3 : 0) +
    0.1;

  const reasons: string[] = [];
  if (avgSetsPerSession > 20) reasons.push(`Avg ${Math.round(avgSetsPerSession)} sets/session`);
  if (avgExercises > 7) reasons.push(`Avg ${Math.round(avgExercises)} exercises/session`);

  return {
    style: 'high_volume',
    score: Math.min(1, score),
    reasons: reasons.length > 0 ? reasons : ['Moderate volume'],
  };
}

function analyzeMinimalist(sessions: readonly WorkoutSessionMemory[]): StyleEvidence {
  const avgExercises =
    sessions.reduce((s, sess) => s + sess.exercises.length, 0) /
    (sessions.length || 1);

  const score = avgExercises <= 4 ? 0.8 : avgExercises <= 6 ? 0.4 : 0.1;

  return {
    style: 'minimalist',
    score,
    reasons:
      avgExercises <= 4
        ? [`Only ${Math.round(avgExercises)} exercises per session`]
        : ['Simple workout structure'],
  };
}

function analyzeCompoundHeavy(sessions: readonly WorkoutSessionMemory[]): StyleEvidence {
  // Heuristic: compound movements typically have higher weight and involve multiple muscle groups
  const compoundPatterns = [
    'squat', 'deadlift', 'bench', 'press', 'row', 'pull-up', 'chin-up', 'dip',
    'lunge', 'thrust', 'clean', 'snatch', 'swing',
  ];

  let compoundExercises = 0;
  let totalExercises = 0;

  for (const session of sessions) {
    for (const ex of session.exercises) {
      totalExercises++;
      const name = ex.exerciseName.toLowerCase();
      if (compoundPatterns.some((p) => name.includes(p))) {
        compoundExercises++;
      }
    }
  }

  const ratio = totalExercises > 0 ? compoundExercises / totalExercises : 0;
  const score = ratio * 0.8 + 0.1;

  return {
    style: 'compound_heavy',
    score: Math.min(1, score),
    reasons:
      ratio > 0.5
        ? [`${Math.round(ratio * 100)}% compound movements`]
        : ['Some compound work'],
  };
}

function analyzeMachineHeavy(sessions: readonly WorkoutSessionMemory[]): StyleEvidence {
  const machinePatterns = ['machine', 'cable', 'fly', 'extension', 'curl machine', 'press machine'];

  let machineExercises = 0;
  let totalExercises = 0;

  for (const session of sessions) {
    for (const ex of session.exercises) {
      totalExercises++;
      const name = ex.exerciseName.toLowerCase();
      if (machinePatterns.some((p) => name.includes(p))) {
        machineExercises++;
      }
    }
  }

  const ratio = totalExercises > 0 ? machineExercises / totalExercises : 0;
  const score = ratio * 0.8 + 0.1;

  return {
    style: 'machine_heavy',
    score: Math.min(1, score),
    reasons:
      ratio > 0.5
        ? [`${Math.round(ratio * 100)}% machine/cable exercises`]
        : ['Some machine work'],
  };
}

function analyzeCardioFocus(sessions: readonly WorkoutSessionMemory[]): StyleEvidence {
  const cardioPatterns = [
    'run', 'treadmill', 'bike', 'cycle', 'rowing', 'swim', 'jump rope',
    'burpee', 'hiit', 'sprint', 'cardio',
  ];

  let cardioSessions = 0;

  for (const session of sessions) {
    const hasCardio = session.exercises.some((ex) =>
      cardioPatterns.some((p) => ex.exerciseName.toLowerCase().includes(p))
    );
    if (hasCardio) cardioSessions++;
  }

  const ratio = sessions.length > 0 ? cardioSessions / sessions.length : 0;
  const score = ratio * 0.9 + 0.05;

  return {
    style: 'cardio_focused',
    score: Math.min(1, score),
    reasons:
      ratio > 0.3
        ? [`${Math.round(ratio * 100)}% sessions include cardio`]
        : ['Some cardio activity'],
  };
}
