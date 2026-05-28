// ── Context-Aware Ranking Engine ────────────────────────────────────────────
// Dynamically scores exercise candidates within an active workout context.
// Blends Phase 2 memory with real-time workout state.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  WorkoutContext,
  ContextAwareRankingResult,
  PredictedExerciseCandidate,
  PredictionReason,
} from '@/types/predictive-flow';
import type {
  MuscleRecoveryState,
  ExerciseTransitionGraph,
  UserExerciseAffinity,
} from '@/types/workout-memory';
import { calculateRecencyScore } from '@/lib/behavior-memory/analytics/calculateRecencyScore';

export interface RankableCandidate {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  movementPattern: string;
  primaryEquipment: string;
  fatigueScore: number; // 1-10
  difficulty: string;
  lastPerformedAt: string | null;
}

/** Build a context-aware ranking of exercise candidates.
 *  Scores are explainable and deterministic.
 */
export function buildContextAwareRanking(
  candidates: readonly RankableCandidate[],
  context: WorkoutContext,
  recoveryStates: readonly MuscleRecoveryState[],
  transitionGraph: ExerciseTransitionGraph,
  affinities: readonly UserExerciseAffinity[],
  previousExerciseId?: string
): ContextAwareRankingResult {
  const recoveryMap = new Map(recoveryStates.map((r) => [r.muscleGroup, r]));
  const affinityMap = new Map(affinities.map((a) => [a.exerciseId, a]));
  const completedSet = new Set(context.completedExercises);
  const remainingMuscles = new Set(context.remainingMuscleGroups);

  const scored: PredictedExerciseCandidate[] = [];

  for (const c of candidates) {
    if (completedSet.has(c.exerciseId)) continue; // already done

    const reasoning: PredictionReason[] = [];
    let score = 0.5; // baseline

    // 1. Muscle group priority (if this muscle is still needed)
    const isNeeded = remainingMuscles.has(c.muscleGroup);
    if (isNeeded) {
      score += 0.2;
      reasoning.push({
        type: 'muscle_balance',
        text: `${c.muscleGroup} still needed in this session`,
        confidence: 0.9,
      });
    } else {
      score -= 0.15;
      reasoning.push({
        type: 'muscle_balance',
        text: `${c.muscleGroup} already covered`,
        confidence: 0.7,
      });
    }

    // 2. Recovery state
    const recovery = recoveryMap.get(c.muscleGroup);
    if (recovery) {
      const recoveryBonus = recovery.recoveryScore / 200; // 0-0.5
      score += recoveryBonus;
      if (recovery.recoveryScore < 50) {
        reasoning.push({
          type: 'recovery_state',
          text: `${c.muscleGroup} still fatigued (${recovery.recoveryScore}/100)`,
          confidence: 0.8,
        });
      } else {
        reasoning.push({
          type: 'recovery_state',
          text: `${c.muscleGroup} recovered (${recovery.recoveryScore}/100)`,
          confidence: 0.9,
        });
      }
    }

    // 3. Transition probability
    if (previousExerciseId && transitionGraph.edges[previousExerciseId]) {
      const trans = transitionGraph.edges[previousExerciseId].find(
        (t) => t.toExerciseId === c.exerciseId
      );
      if (trans) {
        const transScore = trans.probability * 0.25;
        score += transScore;
        reasoning.push({
          type: 'transition_graph',
          text: `Often follows ${previousExerciseId} (${Math.round(trans.probability * 100)}%)`,
          confidence: trans.probability,
        });
      }
    }

    // 4. User affinity
    const affinity = affinityMap.get(c.exerciseId);
    if (affinity) {
      score += affinity.overallScore * 0.15;
      reasoning.push({
        type: 'user_affinity',
        text: `User affinity rank #${affinity.rank}`,
        confidence: affinity.overallScore,
      });
    }

    // 5. Recency bonus (not done recently = higher)
    if (c.lastPerformedAt) {
      const recency = calculateRecencyScore(c.lastPerformedAt, { halfLifeDays: 7 });
      score += (1 - recency) * 0.1; // less recent = higher score
    } else {
      score += 0.05; // never done = slight novelty bonus
    }

    // 6. Equipment availability
    if (context.availableEquipment.includes(c.primaryEquipment)) {
      score += 0.05;
      reasoning.push({
        type: 'equipment_availability',
        text: `${c.primaryEquipment} available`,
        confidence: 1,
      });
    } else {
      score -= 0.1;
      reasoning.push({
        type: 'equipment_availability',
        text: `${c.primaryEquipment} not available`,
        confidence: 1,
      });
    }

    // 7. Fatigue ordering: higher fatigueScore should come earlier
    const fatiguePositionBonus =
      context.currentFatigueEstimate < 40 ? c.fatigueScore / 20 : -(c.fatigueScore / 40);
    score += fatiguePositionBonus;

    // Normalize
    const normalizedScore = Math.max(0, Math.min(1, Math.round(score * 1000) / 1000));

    scored.push({
      exerciseId: c.exerciseId,
      exerciseName: c.exerciseName,
      score: normalizedScore,
      reasoning,
      basedOn: reasoning.map((r) => {
        switch (r.type) {
          case 'transition_graph': return 'transition';
          case 'recovery_state': return 'recovery';
          case 'frequency': return 'frequency';
          case 'user_affinity': return 'affinity';
          case 'muscle_balance': return 'muscle_balance';
          default: return 'frequency';
        }
      }),
      estimatedSets: 3,
      estimatedStartingWeight: null,
    });
  }

  scored.sort((a, b) => b.score - a.score);

  // Calculate session balance
  const balance: Record<string, number> = {};
  for (const c of context.completedExercises) {
    // We don't have muscle group mapping here, so leave empty
    // Consumers should enrich this with exercise metadata
  }

  return {
    candidates: scored,
    topPick: scored.length > 0 ? scored[0] : null,
    needsWarmup: context.currentFatigueEstimate < 30,
    sessionBalance: balance,
  };
}
