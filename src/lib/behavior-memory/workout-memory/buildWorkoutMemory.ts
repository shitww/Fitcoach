// ── Workout Memory Builder ──────────────────────────────────────────────────
// Top-level builder: converts raw session history into UserWorkoutMemory.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  WorkoutSessionMemory,
  UserWorkoutMemory,
  ExercisePerformanceSnapshot,
  WorkoutTimeline,
  WeeklyTrainingSummary,
} from '@/types/workout-memory';
import { buildWorkoutSessionStats, estimate1RM } from './calculateWorkoutStats';
import { buildRecoverySnapshot } from './getMuscleRecoveryState';

/** Build an ExercisePerformanceSnapshot from all historical sessions of that exercise. */
function buildExerciseSnapshot(
  exerciseName: string,
  exerciseId: string | null | undefined,
  sessions: WorkoutSessionMemory[]
): ExercisePerformanceSnapshot {
  const allSets = sessions.flatMap((s) =>
    s.exercises
      .filter((e) => (e.exerciseId || e.exerciseName) === (exerciseId || exerciseName))
      .flatMap((e) => e.sets)
  );

  const sessionData = sessions
    .map((s) => {
      const ex = s.exercises.find(
        (e) => (e.exerciseId || e.exerciseName) === (exerciseId || exerciseName)
      );
      if (!ex) return null;
      const volume = ex.sets.reduce((sum, set) => sum + set.weight * set.reps, 0);
      const bestSet = ex.sets.reduce(
        (best, set) =>
          set.weight * set.reps > best.weight * best.reps ? set : best,
        ex.sets[0]
      );
      return { date: s.date, volume, bestSet };
    })
    .filter((d): d is NonNullable<typeof d> => d !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sessionData.length === 0) {
    return {
      exerciseId,
      exerciseName,
      lastWeight: 0,
      lastReps: 0,
      lastVolume: 0,
      lastPerformedAt: '',
      bestWeight: 0,
      bestVolume: 0,
      best1RMEstimate: 0,
      averageVolume: 0,
      averageReps: 0,
      averageWeight: 0,
      recentFrequency: 0,
      totalSessions: 0,
      volumeTrend: 'insufficient_data',
    };
  }

  const last = sessionData[0];
  const recent30d = sessionData.filter((d) => {
    const daysAgo =
      (Date.now() - new Date(d.date).getTime()) / 86_400_000;
    return daysAgo <= 30;
  });

  const totalVolume = sessionData.reduce((s, d) => s + d.volume, 0);
  const avgVolume = totalVolume / sessionData.length;
  const avgReps =
    allSets.reduce((s, set) => s + set.reps, 0) / (allSets.length || 1);
  const avgWeight =
    allSets.reduce((s, set) => s + set.weight, 0) / (allSets.length || 1);

  const bestWeight = Math.max(...allSets.map((s) => s.weight));
  const bestVolume = Math.max(...sessionData.map((d) => d.volume));
  const best1RM = Math.max(...sessionData.map((d) =>
    estimate1RM([d.bestSet])
  ));

  // Trend: compare recent 3 sessions vs previous 3
  let volumeTrend: ExercisePerformanceSnapshot['volumeTrend'] = 'insufficient_data';
  if (sessionData.length >= 6) {
    const recent3 = sessionData.slice(0, 3).reduce((s, d) => s + d.volume, 0) / 3;
    const prev3 = sessionData.slice(3, 6).reduce((s, d) => s + d.volume, 0) / 3;
    const change = (recent3 - prev3) / (prev3 || 1);
    if (change > 0.05) volumeTrend = 'up';
    else if (change < -0.05) volumeTrend = 'down';
    else volumeTrend = 'stable';
  } else if (sessionData.length >= 2) {
    volumeTrend = 'stable';
  }

  return {
    exerciseId,
    exerciseName,
    lastWeight: last.bestSet.weight,
    lastReps: last.bestSet.reps,
    lastVolume: last.volume,
    lastPerformedAt: last.date,
    bestWeight,
    bestVolume,
    best1RMEstimate: Math.round(best1RM * 10) / 10,
    averageVolume: Math.round(avgVolume),
    averageReps: Math.round(avgReps * 10) / 10,
    averageWeight: Math.round(avgWeight * 10) / 10,
    recentFrequency: recent30d.length,
    totalSessions: sessionData.length,
    volumeTrend,
  };
}

/** Build weekly summaries from session history. */
function buildWeeklySummaries(
  sessions: WorkoutSessionMemory[]
): WeeklyTrainingSummary[] {
  const byWeek = new Map<string, WorkoutSessionMemory[]>();

  for (const session of sessions) {
    const date = new Date(session.date);
    const dayOfWeek = date.getDay();
    const monday = new Date(date);
    monday.setDate(date.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const key = monday.toISOString().split('T')[0];

    const arr = byWeek.get(key) || [];
    arr.push(session);
    byWeek.set(key, arr);
  }

  const summaries: WeeklyTrainingSummary[] = [];
  for (const [weekStart, weekSessions] of byWeek) {
    const sessionCount = weekSessions.length;
    const totalVolume = weekSessions.reduce((s, sess) => s + sess.totalVolume, 0);
    const totalDurationSec = weekSessions.reduce((s, sess) => s + sess.durationSec, 0);
    const muscleGroups = Array.from(
      new Set(weekSessions.flatMap((s) => s.muscleGroups))
    );
    const exerciseNames = Array.from(
      new Set(weekSessions.flatMap((s) => s.exercises.map((e) => e.exerciseName)))
    );
    const avgFatigue =
      weekSessions.reduce((s, sess) => s + sess.estimatedFatigueScore, 0) /
      sessionCount;

    summaries.push({
      weekStart,
      sessionCount,
      totalVolume,
      totalDurationSec,
      muscleGroups,
      exerciseNames,
      avgFatigueScore: Math.round(avgFatigue),
    });
  }

  return summaries.sort(
    (a, b) => new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime()
  );
}

/** Build the complete workout timeline with streak calculation. */
function buildTimeline(
  sessions: WorkoutSessionMemory[]
): WorkoutTimeline {
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const dates = sorted.map((s) => s.date);
  const uniqueDates = Array.from(new Set(dates));
  const totalSessions = sorted.length;
  const firstWorkoutDate = dates.length > 0 ? dates[dates.length - 1] : null;
  const lastWorkoutDate = dates.length > 0 ? dates[0] : null;

  // Streak calculation
  let currentStreak = 0;
  let longestStreak = 0;
  let run = 0;
  const dateSet = new Set(uniqueDates);

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  // Current streak
  if (dateSet.has(todayStr)) {
    currentStreak = 1;
  } else if (dateSet.has(yesterdayStr)) {
    currentStreak = 1;
  } else {
    currentStreak = 0;
  }

  if (currentStreak > 0) {
    let cursor = new Date(today);
    if (!dateSet.has(todayStr)) cursor = yesterday;

    while (true) {
      const str = cursor.toISOString().split('T')[0];
      if (!dateSet.has(str)) break;
      currentStreak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    // Adjust: the loop counts one extra
    currentStreak--;
  }

  // Longest streak
  const ascDates = Array.from(dateSet).sort();
  for (let i = 0; i < ascDates.length; i++) {
    if (i === 0) {
      run = 1;
    } else {
      const prev = new Date(ascDates[i - 1] + 'T12:00:00Z');
      const curr = new Date(ascDates[i] + 'T12:00:00Z');
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86_400_000);
      run = diffDays === 1 ? run + 1 : 1;
    }
    if (run > longestStreak) longestStreak = run;
  }

  return {
    sessions: sorted,
    totalSessions,
    firstWorkoutDate,
    lastWorkoutDate,
    currentStreak,
    longestStreak,
  };
}

/** Build the complete UserWorkoutMemory from session history. */
export function buildWorkoutMemory(
  userId: string,
  sessions: WorkoutSessionMemory[]
): UserWorkoutMemory {
  const timeline = buildTimeline(sessions);
  const recoverySnapshot = buildRecoverySnapshot(sessions);
  const weeklySummaries = buildWeeklySummaries(sessions);

  // Build per-exercise snapshots
  const exerciseSessions = new Map<string, WorkoutSessionMemory[]>();
  for (const session of sessions) {
    for (const ex of session.exercises) {
      const key = ex.exerciseId || ex.exerciseName;
      const arr = exerciseSessions.get(key) || [];
      arr.push(session);
      exerciseSessions.set(key, arr);
    }
  }

  const exerciseSnapshots: Record<string, ExercisePerformanceSnapshot> = {};
  const seen = new Set<string>();
  for (const session of sessions) {
    for (const ex of session.exercises) {
      const key = ex.exerciseId || ex.exerciseName;
      if (seen.has(key)) continue;
      seen.add(key);
      const exSessions = exerciseSessions.get(key) || [];
      exerciseSnapshots[key] = buildExerciseSnapshot(
        ex.exerciseName,
        ex.exerciseId,
        exSessions
      );
    }
  }

  return {
    userId,
    version: 1,
    lastUpdatedAt: new Date().toISOString(),
    timeline,
    exerciseSnapshots,
    recoverySnapshot,
    weeklySummaries,
  };
}
