// ── Predict Workout Split (lightweight) ─────────────────────────────────────
// Quick split prediction without full session enrichment.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutSessionMemory, BodyRecoverySnapshot } from '@/types/workout-memory';

/** Quick split prediction — returns label and confidence only. */
export function predictWorkoutSplit(
  recentSessions: readonly WorkoutSessionMemory[],
  recoverySnapshot: BodyRecoverySnapshot
): { split: string; confidence: number } {
  // Infer split from recent sessions
  const splitLabels = ['push', 'pull', 'legs', 'upper', 'lower', 'fullbody'];

  // Count recent splits
  const counts = new Map<string, number>();
  for (const session of recentSessions.slice(0, 10)) {
    const mg = session.muscleGroups;
    let label = 'mixed';
    if (mg.includes('chest') && !mg.includes('back')) label = 'push';
    else if (mg.includes('back') && !mg.includes('chest')) label = 'pull';
    else if (mg.includes('chest') && mg.includes('back')) label = 'upper';
    else if (mg.includes('legs') && !mg.includes('chest') && !mg.includes('back')) label = 'legs';
    else if (mg.includes('legs') && (mg.includes('chest') || mg.includes('back'))) label = 'fullbody';

    counts.set(label, (counts.get(label) || 0) + 1);
  }

  // Find most recovered muscle group set
  const recovered = recoverySnapshot.fullyRecovered.map((g) => g.muscleGroup);
  let bestSplit = 'push';
  let bestMatch = 0;

  const splitMuscles: Record<string, string[]> = {
    push: ['chest', 'shoulders', 'triceps'],
    pull: ['back', 'biceps', 'rear_delts'],
    legs: ['quadriceps', 'hamstrings', 'glutes'],
    upper: ['chest', 'back', 'shoulders', 'biceps', 'triceps'],
    fullbody: ['chest', 'back', 'legs', 'shoulders'],
  };

  for (const [split, muscles] of Object.entries(splitMuscles)) {
    const matchCount = muscles.filter((m) => recovered.includes(m)).length;
    if (matchCount > bestMatch) {
      bestMatch = matchCount;
      bestSplit = split;
    }
  }

  const totalRecent = recentSessions.length;
  const splitCount = counts.get(bestSplit) || 0;
  const freqConfidence = totalRecent > 0 ? splitCount / totalRecent : 0.3;
  const recoveryConfidence = bestMatch / 3;

  const confidence = Math.min(1, (freqConfidence + recoveryConfidence) / 2);

  return { split: bestSplit, confidence: Math.round(confidence * 100) / 100 };
}
