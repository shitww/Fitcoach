// ── Next Exercise Prediction ──────────────────────────────────────────────────
// Predicts what the user is likely to do next based on current workout state.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PredictedExerciseCandidate,
  WorkoutContext,
  PredictionReason,
} from '@/types/predictive-flow';
import type {
  ExerciseTransitionGraph,
  MuscleRecoveryState,
  UserExerciseAffinity,
} from '@/types/workout-memory';
import { getNextLikelyExercises } from '@/lib/behavior-memory/exercise-graph/getNextLikelyExercises';

/** Predict the next likely exercise(s) within an active workout.
 *  Fuses transition graph, recovery, affinity, and muscle balance.
 */
export function predictNextExercises(
  currentExerciseId: string,
  context: WorkoutContext,
  transitionGraph: ExerciseTransitionGraph,
  recoveryStates: readonly MuscleRecoveryState[],
  affinities: readonly UserExerciseAffinity[],
  allCandidates: readonly { exerciseId: string; exerciseName: string; muscleGroup: string }[],
  limit: number = 5
): PredictedExerciseCandidate[] {
  const recoveryMap = new Map(recoveryStates.map((r) => [r.muscleGroup, r]));
  const affinityMap = new Map(affinities.map((a) => [a.exerciseId, a]));
  const completed = new Set(context.completedExercises);

  // 1. Get transition-based candidates
  const transCandidates = getNextLikelyExercises(transitionGraph, currentExerciseId, limit * 2);

  // 2. Score and enrich each candidate
  const scored: PredictedExerciseCandidate[] = [];
  const seen = new Set<string>();

  for (const trans of transCandidates) {
    const candidate = allCandidates.find((c) => c.exerciseId === trans.exerciseId);
    if (!candidate || completed.has(candidate.exerciseId)) continue;
    if (seen.has(candidate.exerciseId)) continue;
    seen.add(candidate.exerciseId);

    const reasoning: PredictionReason[] = [];
    let score = trans.probability * 0.5; // base from transition graph

    reasoning.push({
      type: 'transition_graph',
      text: `Follows ${currentExerciseId} in ${Math.round(trans.probability * 100)}% of sessions`,
      confidence: trans.probability,
    });

    // Recovery check
    const recovery = recoveryMap.get(candidate.muscleGroup);
    if (recovery) {
      const recFactor = recovery.recoveryScore / 100;
      score += recFactor * 0.2;
      reasoning.push({
        type: 'recovery_state',
        text: `${candidate.muscleGroup} recovery: ${recovery.status} (${recovery.recoveryScore})`,
        confidence: recFactor,
      });
    }

    // Affinity
    const affinity = affinityMap.get(candidate.exerciseId);
    if (affinity) {
      score += affinity.overallScore * 0.15;
      reasoning.push({
        type: 'user_affinity',
        text: `User affinity rank #${affinity.rank}`,
        confidence: affinity.overallScore,
      });
    }

    // Muscle balance: prefer muscles not yet covered
    if (context.remainingMuscleGroups.includes(candidate.muscleGroup)) {
      score += 0.1;
      reasoning.push({
        type: 'muscle_balance',
        text: `${candidate.muscleGroup} still needs work this session`,
        confidence: 0.8,
      });
    }

    const normalized = Math.max(0, Math.min(1, Math.round(score * 1000) / 1000));

    scored.push({
      exerciseId: candidate.exerciseId,
      exerciseName: candidate.exerciseName,
      score: normalized,
      reasoning,
      basedOn: ['transition', 'recovery', 'affinity', 'muscle_balance'],
      estimatedSets: 3,
      estimatedStartingWeight: null,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
