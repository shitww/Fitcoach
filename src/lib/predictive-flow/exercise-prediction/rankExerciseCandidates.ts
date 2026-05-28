// ── Rank Exercise Candidates ──────────────────────────────────────────────────
// Static ranking of exercises for a given session type, not within a live workout.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  PredictedExerciseCandidate,
  PredictionReason,
} from '@/types/predictive-flow';
import type {
  UserExerciseAffinity,
  MuscleRecoveryState,
  ExercisePerformanceSnapshot,
} from '@/types/workout-memory';
import { calculateRecencyScore } from '@/lib/behavior-memory/analytics/calculateRecencyScore';

export interface StaticCandidate {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  movementPattern: string;
  equipment: string[];
  category: string;
  fatigueScore: number;
}

/** Rank exercises for a predicted session type.
 *  Does NOT use live workout context — uses memory + recovery + affinity only.
 */
export function rankExerciseCandidates(
  candidates: readonly StaticCandidate[],
  sessionType: string,
  recoveryStates: readonly MuscleRecoveryState[],
  affinities: readonly UserExerciseAffinity[],
  snapshots: Record<string, ExercisePerformanceSnapshot>,
  limit: number = 10
): PredictedExerciseCandidate[] {
  const recoveryMap = new Map(recoveryStates.map((r) => [r.muscleGroup, r]));
  const affinityMap = new Map(affinities.map((a) => [a.exerciseId, a]));

  const scored: PredictedExerciseCandidate[] = [];

  for (const c of candidates) {
    const reasoning: PredictionReason[] = [];
    let score = 0.4; // baseline

    // Affinity
    const affinity = affinityMap.get(c.exerciseId);
    if (affinity) {
      score += affinity.overallScore * 0.3;
      reasoning.push({
        type: 'user_affinity',
        text: `User affinity rank #${affinity.rank}`,
        confidence: affinity.overallScore,
      });
    }

    // Recovery
    const recovery = recoveryMap.get(c.muscleGroup);
    if (recovery) {
      const recBonus = recovery.recoveryScore / 300; // 0-0.33
      score += recBonus;
      reasoning.push({
        type: 'recovery_state',
        text: `${c.muscleGroup}: ${recovery.status} (${recovery.recoveryScore})`,
        confidence: recovery.recoveryScore / 100,
      });
    }

    // Snapshot performance data
    const snap = snapshots[c.exerciseId];
    if (snap) {
      if (snap.volumeTrend === 'up') {
        score += 0.08;
        reasoning.push({ type: 'recent_history', text: 'Volume trending up', confidence: 0.7 });
      }
      const recency = snap.lastPerformedAt
        ? calculateRecencyScore(snap.lastPerformedAt, { halfLifeDays: 14 })
        : 0;
      score += (1 - recency) * 0.1;
    } else {
      score += 0.05; // novelty bonus for untried exercises
    }

    // Movement pattern variety within session type
    // (This would need session history to calculate; simplified here)
    if (c.category === 'strength') {
      score += 0.03;
      reasoning.push({ type: 'training_style', text: 'Compound strength movement', confidence: 0.5 });
    }

    const normalized = Math.max(0, Math.min(1, Math.round(score * 1000) / 1000));

    scored.push({
      exerciseId: c.exerciseId,
      exerciseName: c.exerciseName,
      score: normalized,
      reasoning,
      basedOn: ['affinity', 'recovery', 'frequency'],
      estimatedSets: c.fatigueScore > 7 ? 3 : 4,
      estimatedStartingWeight: snap?.lastWeight ?? null,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit);
}
