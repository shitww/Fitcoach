// ── Build Resume Candidates ─────────────────────────────────────────────────
// Generates "Continue Previous Workout" suggestions from recent history.
// ─────────────────────────────────────────────────────────────────────────────

import type { ResumeWorkoutCandidate } from '@/types/predictive-flow';
import type { WorkoutSessionMemory } from '@/types/workout-memory';

/** Build resume candidates from session history.
 *  A candidate is either:
 *  - The exact last workout (repeat)
 *  - The same split type from earlier
 */
export function buildResumeCandidates(
  sessions: readonly WorkoutSessionMemory[]
): ResumeWorkoutCandidate[] {
  if (sessions.length === 0) return [];

  const candidates: ResumeWorkoutCandidate[] = [];
  const seenLabels = new Set<string>();

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Candidate 1: Most recent exact workout
  const last = sorted[0];
  const daysAgoLast = Math.floor(
    (Date.now() - new Date(last.date).getTime()) / 86_400_000
  );

  const splitLabel = inferSplitLabel(last.muscleGroups);
  const lastLabel = `Continue ${splitLabel} Day`;

  candidates.push({
    workoutId: last.workoutId,
    label: lastLabel,
    description: `${last.exercises.length} exercises · ${Math.round(last.durationSec / 60)} min · ${daysAgoLast} days ago`,
    lastDate: last.date,
    lastExercises: last.exercises.map((e) => e.exerciseName),
    confidence: 0.9,
    estimatedDurationMin: Math.round(last.durationSec / 60),
    expectedVolume: last.totalVolume,
    isRepeat: true,
  });
  seenLabels.add(lastLabel);

  // Candidate 2: Find the most frequent split and offer it
  const splitCounts = new Map<string, { count: number; lastSession: WorkoutSessionMemory }>();
  for (const session of sorted.slice(0, 20)) {
    const label = inferSplitLabel(session.muscleGroups);
    const existing = splitCounts.get(label);
    if (existing) {
      existing.count++;
    } else {
      splitCounts.set(label, { count: 1, lastSession: session });
    }
  }

  for (const [splitLabel, data] of splitCounts) {
    if (seenLabels.has(`Continue ${splitLabel} Day`)) continue;
    const daysAgo = Math.floor(
      (Date.now() - new Date(data.lastSession.date).getTime()) / 86_400_000
    );

    candidates.push({
      workoutId: data.lastSession.workoutId,
      label: `Continue ${splitLabel} Day`,
      description: `${data.count} recent sessions · Last: ${daysAgo} days ago`,
      lastDate: data.lastSession.date,
      lastExercises: data.lastSession.exercises.map((e) => e.exerciseName),
      confidence: Math.min(0.85, 0.5 + data.count * 0.05),
      estimatedDurationMin: Math.round(data.lastSession.durationSec / 60),
      expectedVolume: data.lastSession.totalVolume,
      isRepeat: true,
    });
  }

  return candidates.slice(0, 3);
}

function inferSplitLabel(muscleGroups: string[]): string {
  const set = new Set(muscleGroups);
  if (set.has('chest') && !set.has('back') && !set.has('legs')) return 'Push';
  if (set.has('back') && !set.has('chest') && !set.has('legs')) return 'Pull';
  if (set.has('legs') && !set.has('chest') && !set.has('back')) return 'Legs';
  if (set.has('chest') && set.has('back') && !set.has('legs')) return 'Upper';
  if (set.has('chest') && set.has('back') && set.has('legs')) return 'Full Body';
  return 'Mixed';
}
