// ── Generate Resume Session ─────────────────────────────────────────────────
// Creates a concrete session plan from a resume candidate with weight suggestions.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  ResumeWorkoutCandidate,
  ResumeExercise,
  OneTapWorkout,
  PredictionReason,
} from '@/types/predictive-flow';
import type { ExercisePerformanceSnapshot } from '@/types/workout-memory';

export interface GenerateResumeInput {
  candidate: ResumeWorkoutCandidate;
  exerciseSnapshots: Record<string, ExercisePerformanceSnapshot>;
  warmupFlows: { exerciseId: string; durationSec: number }[];
}

/** Generate a complete resumable session from a candidate.
 *  Uses last-known weights and applies small progression.
 */
export function generateResumeSession(
  input: GenerateResumeInput
): OneTapWorkout {
  const { candidate, exerciseSnapshots, warmupFlows } = input;

  const exercises: OneTapWorkout['exercises'] = [];
  const resumeExercises: ResumeExercise[] = [];
  const reasoning: PredictionReason[] = [];

  for (const exName of candidate.lastExercises) {
    // Find snapshot by name (fallback: any matching snapshot)
    const snapshot = Object.values(exerciseSnapshots).find(
      (s) => s.exerciseName === exName
    );

    let suggestedWeight = snapshot?.lastWeight ?? 0;
    let delta = 'same';

    // Progressive overload: if last was successful (volume trend up or stable)
    if (snapshot && snapshot.volumeTrend === 'up') {
      // Round to nearest 2.5kg for barbell, 2kg for dumbbell
      const increment = suggestedWeight > 20 ? 2.5 : 2;
      suggestedWeight = Math.round((suggestedWeight + increment) * 10) / 10;
      delta = `+${increment}kg`;
    }

    resumeExercises.push({
      exerciseId: snapshot?.exerciseId ?? exName,
      exerciseName: exName,
      lastWeight: snapshot?.lastWeight ?? 0,
      lastReps: snapshot?.lastReps ?? 0,
      lastVolume: snapshot?.lastVolume ?? 0,
      targetSets: 3,
      suggestedWeight,
      deltaFromLast: delta,
    });

    exercises.push({
      exerciseId: snapshot?.exerciseId ?? exName,
      name: exName,
      sets: 3,
      weightHint: suggestedWeight > 0 ? `${suggestedWeight}kg` : null,
    });
  }

  const daysAgo = Math.floor((Date.now() - new Date(candidate.lastDate).getTime()) / 86_400_000);
  reasoning.push({
    type: 'recent_history',
    text: `Resumes last ${candidate.label} from ${daysAgo} days ago`,
    confidence: 0.9,
  });

  return {
    title: `Resume ${candidate.label}`,
    subtitle: `${exercises.length} exercises · Est. ${candidate.estimatedDurationMin} min`,
    exercises,
    estimatedDurationMin: candidate.estimatedDurationMin,
    warmupFlows: [], // populated by caller
    reasoning,
  };
}
