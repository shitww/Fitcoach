// ── User Exercise Preference Affinity ─────────────────────────────────────────
// Measures which exercises the user prefers based on frequency, recency, and
// consistency. This is the "habit" affinity, NOT the transition affinity.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutSessionMemory } from '@/types/workout-memory';

export interface UserExerciseAffinity {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  frequencyScore: number;      // 0-1, how often they do it
  recencyScore: number;        // 0-1, how recently
  consistencyScore: number;    // 0-1, regular intervals = higher
  overallScore: number;          // 0-1, weighted blend
  rank: number;
  basis: string[];             // explainable evidence
}

/** Calculate user preference affinity for each exercise.
 *  Higher score = user gravitates toward this exercise.
 */
export function calculateUserExerciseAffinities(
  sessions: readonly WorkoutSessionMemory[]
): UserExerciseAffinity[] {
  if (sessions.length === 0) return [];

  const now = Date.now();
  const maxDays = 90; // lookback window
  const cutoff = now - maxDays * 86_400_000;

  const exerciseData = new Map<
    string,
    {
      name: string;
      muscleGroup: string;
      sessionDates: number[]; // timestamps
      sessionCount: number;
      setCount: number;
    }
  >();

  for (const session of sessions) {
    const sessionTime = new Date(session.date).getTime();
    if (sessionTime < cutoff) continue;

    const seen = new Set<string>();
    for (const ex of session.exercises) {
      const id = ex.exerciseId || ex.exerciseName;
      if (seen.has(id)) continue;
      seen.add(id);

      const existing = exerciseData.get(id);
      if (existing) {
        existing.sessionDates.push(sessionTime);
        existing.sessionCount++;
        existing.setCount += ex.sets.length;
      } else {
        exerciseData.set(id, {
          name: ex.exerciseName,
          muscleGroup: ex.muscleGroup,
          sessionDates: [sessionTime],
          sessionCount: 1,
          setCount: ex.sets.length,
        });
      }
    }
  }

  const totalSessionsInWindow = sessions.filter(
    (s) => new Date(s.date).getTime() >= cutoff
  ).length;

  const results: UserExerciseAffinity[] = [];

  for (const [id, data] of exerciseData) {
    // Frequency: proportion of sessions containing this exercise
    const frequencyScore = Math.min(1, data.sessionCount / Math.max(totalSessionsInWindow * 0.3, 3));

    // Recency: time since last session (exponential decay)
    const lastSession = Math.max(...data.sessionDates);
    const daysSinceLast = (now - lastSession) / 86_400_000;
    const recencyScore = Math.max(0, 1 - daysSinceLast / maxDays);

    // Consistency: standard deviation of intervals between sessions
    const dates = data.sessionDates.sort((a, b) => a - b);
    let consistencyScore = 0;
    if (dates.length >= 3) {
      const intervals: number[] = [];
      for (let i = 1; i < dates.length; i++) {
        intervals.push((dates[i] - dates[i - 1]) / 86_400_000);
      }
      const mean = intervals.reduce((s, v) => s + v, 0) / intervals.length;
      const variance =
        intervals.reduce((s, v) => s + Math.pow(v - mean, 2), 0) /
        intervals.length;
      const stdDev = Math.sqrt(variance);
      // Lower stdDev = higher consistency. Normalize: <3 days = perfect, >14 = poor
      consistencyScore = Math.max(0, 1 - stdDev / 14);
    } else if (dates.length >= 2) {
      consistencyScore = 0.5;
    } else {
      consistencyScore = 0.2;
    }

    // Overall: weighted blend
    const overallScore = Math.round(
      (frequencyScore * 0.4 + recencyScore * 0.35 + consistencyScore * 0.25) * 1000
    ) / 1000;

    const basis: string[] = [];
    if (frequencyScore > 0.7) basis.push(`Used in ${data.sessionCount} sessions`);
    else if (frequencyScore > 0.4) basis.push(`Regularly used`);
    if (recencyScore > 0.8) basis.push('Recent activity');
    if (consistencyScore > 0.7) basis.push('Consistent schedule');

    results.push({
      exerciseId: id,
      exerciseName: data.name,
      muscleGroup: data.muscleGroup,
      frequencyScore: Math.round(frequencyScore * 1000) / 1000,
      recencyScore: Math.round(recencyScore * 1000) / 1000,
      consistencyScore: Math.round(consistencyScore * 1000) / 1000,
      overallScore,
      rank: 0, // filled later
      basis: basis.length > 0 ? basis : ['Occasionally used'],
    });
  }

  results.sort((a, b) => b.overallScore - a.overallScore);
  results.forEach((r, i) => (r.rank = i + 1));

  return results;
}
