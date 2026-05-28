// ── Quick Start Suggestions ───────────────────────────────────────────────────
// Builds the top-level "one-tap" suggestions for the training page.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  QuickStartSuggestion,
  ResumeWorkoutCandidate,
  PredictedWorkoutSession,
} from '@/types/predictive-flow';
import type { WorkoutSessionMemory } from '@/types/workout-memory';

export interface QuickStartInput {
  resumeCandidates: readonly ResumeWorkoutCandidate[];
  predictedSession: PredictedWorkoutSession | null;
  recentSessions: readonly WorkoutSessionMemory[];
  daysSinceLastWorkout: number;
}

/** Build the primary quick-start suggestions for the training surface. */
export function buildQuickStartSuggestions(
  input: QuickStartInput
): QuickStartSuggestion[] {
  const suggestions: QuickStartSuggestion[] = [];

  // 1. Resume candidate (highest priority if recent)
  if (input.resumeCandidates.length > 0) {
    const topResume = input.resumeCandidates[0];
    suggestions.push({
      id: `resume_${topResume.workoutId}`,
      type: 'resume',
      label: topResume.label,
      subtitle: topResume.description,
      icon: 'repeat',
      confidence: topResume.confidence,
      estimatedDurationMin: topResume.estimatedDurationMin,
      targetMuscleGroups: [],
      primaryAction: 'resume',
      metadata: {
        workoutId: topResume.workoutId,
        exerciseCount: topResume.lastExercises.length,
        lastDate: topResume.lastDate,
      },
    });
  }

  // 2. Predicted split
  if (input.predictedSession) {
    suggestions.push({
      id: `predicted_${input.predictedSession.predictedSplit}`,
      type: 'predicted_split',
      label: `${capitalize(input.predictedSession.predictedSplit)} Day`,
      subtitle: `${input.predictedSession.reasoning.length} signals · Confidence ${Math.round(input.predictedSession.confidence * 100)}%`,
      icon: 'target',
      confidence: input.predictedSession.confidence,
      estimatedDurationMin: input.predictedSession.estimatedDurationMin,
      targetMuscleGroups: input.predictedSession.targetMuscleGroups,
      primaryAction: 'start_new',
      metadata: {
        sessionType: input.predictedSession.predictedSplit,
        exerciseCount: input.predictedSession.suggestedExercises.length,
      },
    });
  }

  // 3. Time-based suggestion
  if (input.daysSinceLastWorkout >= 3) {
    suggestions.push({
      id: 'time_based_quick',
      type: 'time_based',
      label: 'Quick Session',
      subtitle: `${input.daysSinceLastWorkout} days off — keep the habit`,
      icon: 'zap',
      confidence: 0.7,
      estimatedDurationMin: 30,
      targetMuscleGroups: ['chest', 'back', 'legs'],
      primaryAction: 'start_new',
      metadata: { sessionType: 'fullbody' },
    });
  }

  // 4. Frequent pattern (last session's split)
  if (input.recentSessions.length > 0) {
    const lastSplit = inferSplit(input.recentSessions[0].muscleGroups);
    suggestions.push({
      id: `frequent_${lastSplit}`,
      type: 'frequent',
      label: `${capitalize(lastSplit)} — Your Go-To`,
      subtitle: 'Based on your most common split',
      icon: 'play',
      confidence: 0.6,
      estimatedDurationMin: 45,
      targetMuscleGroups: [],
      primaryAction: 'start_new',
      metadata: { sessionType: lastSplit },
    });
  }

  // Sort by confidence
  return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 4);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function inferSplit(muscleGroups: string[]): string {
  const set = new Set(muscleGroups);
  if (set.has('chest') && !set.has('back')) return 'push';
  if (set.has('back') && !set.has('chest')) return 'pull';
  if (set.has('legs') && !set.has('chest') && !set.has('back')) return 'legs';
  if (set.has('chest') && set.has('back')) return 'upper';
  return 'fullbody';
}
