// ── FitCoach Phase 3 — Training Profile Engine ──────────────────────────────
// Builds a long-term behavioral profile from exercise histories + context.
// Deterministic. Explainable. No AI/LLM.

import type { ExerciseHistory, UserTrainingContext } from '../trainingTypes';
import type {
  UserTrainingProfile,
  TrainingStyle,
  ExperienceLevel,
  FrequencyPattern,
  RecoveryBehavior,
  ProgressionStyle,
  ProfileDelta,
} from './profileTypes';

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Build a user training profile from all available data.
 * Call periodically (e.g. weekly) — not every render.
 */
export function buildTrainingProfile(
  histories: ExerciseHistory[],
  context: UserTrainingContext
): UserTrainingProfile {
  const totalSessions = histories.reduce((s, h) => s + h.sessions.length, 0);
  const totalSets = histories.reduce(
    (s, h) => s + h.sessions.reduce((ss, sess) => ss + sess.sets.length, 0),
    0
  );
  const totalVolume = histories.reduce(
    (s, h) => s + h.sessions.reduce((ss, sess) => ss + sess.totalVolume, 0),
    0
  );

  return {
    style: detectStyle(histories),
    experience: detectExperienceLevel(totalSessions),
    frequencyPattern: detectFrequencyPattern(context),
    recoveryBehavior: detectRecoveryBehavior(context, histories),
    progressionStyle: detectProgressionStyle(histories),
    musclePriority: rankMuscleGroups(histories),
    exercisePriority: rankExercises(histories),
    avgWorkoutDurationMin: context.recentWorkouts.length > 0
      ? round2(
          context.recentWorkouts.reduce((s, w) => s + w.durationMin, 0) /
            context.recentWorkouts.length
        )
      : 0,
    avgSetsPerWorkout: context.recentWorkouts.length > 0
      ? round2(totalSets / context.recentWorkouts.length)
      : 0,
    avgRestPreferenceSec: estimateRestPreference(histories),
    skipsSessions: detectSessionSkipping(context),
    highFailureRate: detectHighFailureRate(histories),
    computedAt: Date.now(),
  };
}

/**
 * Compare two profiles to detect meaningful changes.
 */
export function detectProfileChanges(
  previous: UserTrainingProfile | null,
  current: UserTrainingProfile
): ProfileDelta[] {
  if (!previous) return [];
  const deltas: ProfileDelta[] = [];

  const compareFields: { field: keyof UserTrainingProfile; threshold?: number }[] = [
    { field: 'style' },
    { field: 'experience' },
    { field: 'frequencyPattern' },
    { field: 'recoveryBehavior' },
    { field: 'progressionStyle' },
    { field: 'avgWorkoutDurationMin', threshold: 10 },
    { field: 'avgSetsPerWorkout', threshold: 2 },
    { field: 'skipsSessions' },
    { field: 'highFailureRate' },
  ];

  for (const { field, threshold } of compareFields) {
    const prev = previous[field];
    const curr = current[field];
    if (prev !== curr) {
      let significance: ProfileDelta['significance'] = 'minor';
      if (field === 'style' || field === 'experience' || field === 'progressionStyle') {
        significance = 'major';
      } else if (threshold !== undefined) {
        const diff = Math.abs(Number(curr) - Number(prev));
        significance = diff >= threshold ? 'major' : 'minor';
      }
      deltas.push({ field, previous: prev, current: curr, significance });
    }
  }

  return deltas;
}

// ── Detectors ──────────────────────────────────────────────────────────────

function detectStyle(histories: ExerciseHistory[]): TrainingStyle {
  const allAvgReps: number[] = [];
  for (const h of histories) {
    for (const sess of h.sessions) {
      const workSets = sess.sets.filter((s) => s.weight > 0);
      if (workSets.length > 0) {
        const avg = workSets.reduce((s, set) => s + set.reps, 0) / workSets.length;
        allAvgReps.push(avg);
      }
    }
  }

  if (allAvgReps.length === 0) return 'undetermined';

  const globalAvg = allAvgReps.reduce((a, b) => a + b, 0) / allAvgReps.length;
  if (globalAvg <= 5) return 'strength_focused';
  if (globalAvg >= 10) return 'hypertrophy_focused';

  // Check for mixed pattern (some exercises low reps, some high)
  const lowCount = allAvgReps.filter((r) => r <= 6).length;
  const highCount = allAvgReps.filter((r) => r >= 9).length;
  if (lowCount > 0 && highCount > 0) return 'mixed';

  return 'undetermined';
}

function detectExperienceLevel(totalSessions: number): ExperienceLevel {
  if (totalSessions < 15) return 'beginner';
  if (totalSessions < 60) return 'intermediate';
  return 'advanced';
}

function detectFrequencyPattern(context: UserTrainingContext): FrequencyPattern {
  const recent = context.recentWorkouts;
  if (recent.length < 7) return 'irregular';

  const uniqueDays = new Set(recent.map((w) => w.date)).size;
  const weeks = 2;
  const avgPerWeek = uniqueDays / weeks;

  if (avgPerWeek >= 5) return 'high_frequency';
  if (avgPerWeek >= 3) return 'moderate_frequency';
  if (avgPerWeek >= 1) return 'low_frequency';
  return 'irregular';
}

function detectRecoveryBehavior(
  context: UserTrainingContext,
  histories: ExerciseHistory[]
): RecoveryBehavior {
  // Check if user trains through fatigue signals
  const streak = context.currentStreak;
  if (streak >= 7) return 'aggressive';

  // Check if user takes frequent rest
  const totalSessions = histories.reduce((s, h) => s + h.sessions.length, 0);
  const daysTracked = context.recentWorkouts.length;
  if (daysTracked > totalSessions * 3) return 'conservative';

  if (streak >= 3 && streak <= 6) return 'balanced';
  return 'unknown';
}

function detectProgressionStyle(histories: ExerciseHistory[]): ProgressionStyle {
  if (histories.length === 0) return 'inconsistent';

  const weightChanges: number[] = [];
  const repChanges: number[] = [];

  for (const h of histories) {
    if (h.sessions.length < 3) continue;
    for (let i = 2; i < h.sessions.length; i++) {
      const maxW = (s: typeof h.sessions[number]) =>
        Math.max(...s.sets.map((set) => set.weight), 0);
      const prev = maxW(h.sessions[i - 2]);
      const curr = maxW(h.sessions[i]);
      if (prev > 0) {
        weightChanges.push(curr - prev);
      }
    }
  }

  if (weightChanges.length === 0) return 'inconsistent';

  const avgWeightChange = weightChanges.reduce((a, b) => a + b, 0) / weightChanges.length;
  const increases = weightChanges.filter((c) => c > 0).length;
  const increaseRate = increases / weightChanges.length;

  if (increaseRate >= 0.6 && avgWeightChange > 2) return 'aggressive_linear';
  if (increaseRate >= 0.3 && increaseRate < 0.6) return 'conservative_wave';
  if (increaseRate < 0.3) return 'rep_focused';
  return 'inconsistent';
}

function rankMuscleGroups(histories: ExerciseHistory[]): string[] {
  const mgVolume = new Map<string, number>();
  for (const h of histories) {
    if (!h.muscleGroup) continue;
    const vol = h.sessions.reduce((s, sess) => s + sess.totalVolume, 0);
    mgVolume.set(h.muscleGroup, (mgVolume.get(h.muscleGroup) ?? 0) + vol);
  }
  return Array.from(mgVolume.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name]) => name);
}

function rankExercises(histories: ExerciseHistory[]): string[] {
  return histories
    .map((h) => ({
      name: h.exerciseName,
      totalSets: h.sessions.reduce((s, sess) => s + sess.sets.length, 0),
    }))
    .sort((a, b) => b.totalSets - a.totalSets)
    .slice(0, 3)
    .map((e) => e.name);
}

function estimateRestPreference(histories: ExerciseHistory[]): number {
  // Default assumption based on training style
  const style = detectStyle(histories);
  switch (style) {
    case 'strength_focused':
      return 180;
    case 'hypertrophy_focused':
      return 90;
    case 'endurance_focused':
      return 45;
    default:
      return 90;
  }
}

function detectSessionSkipping(context: UserTrainingContext): boolean {
  const recent = context.recentWorkouts;
  if (recent.length < 14) return false;
  const uniqueDays = new Set(recent.map((w) => w.date)).size;
  return uniqueDays < 7; // less than 1 workout per week on average
}

function detectHighFailureRate(histories: ExerciseHistory[]): boolean {
  let totalSessions = 0;
  let failureSessions = 0;
  for (const h of histories) {
    for (const sess of h.sessions) {
      totalSessions++;
      const workSets = sess.sets.filter((s) => s.weight > 0);
      if (workSets.length === 0) continue;
      const maxW = Math.max(...workSets.map((s) => s.weight));
      const setsAtMax = workSets.filter((s) => s.weight === maxW);
      if (setsAtMax.some((s) => s.isFailure || s.rir === 0)) {
        failureSessions++;
      }
    }
  }
  return totalSessions > 0 && failureSessions / totalSessions > 0.3;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
