// ── Calculate Workout Momentum ────────────────────────────────────────────────
// Scores the current training flow to detect and prevent session dropoff.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutMomentumState, MomentumStatus } from '@/types/frictionless-runtime';

export interface MomentumInput {
  sessionId: string;
  totalSetsCompleted: number;
  elapsedSinceLastActionSec: number;
  restTimeCurrentSec: number;
  averageRestTimeSec: number;
  exercisesCompleted: number;
  totalExercises: number;
  workoutStyle: 'strength' | 'hypertrophy' | 'endurance' | 'mixed';
  lastSetWasFailure: boolean;
}

/** Expected rest time by workout style (seconds). */
const EXPECTED_REST: Record<string, number> = {
  strength: 180,
  hypertrophy: 90,
  endurance: 45,
  mixed: 120,
};

/** Thresholds (seconds of inactivity) for momentum status. */
const DROPOFF_THRESHOLDS = {
  slowing: 1.5,   // 1.5× expected rest
  stalled: 2.5,   // 2.5× expected rest
  dropped: 4.0,   // 4× expected rest
} as const;

/** Calculate the live momentum score and status.
 *  Score 100 = perfect flow. Score 0 = session abandoned.
 */
export function calculateWorkoutMomentum(
  input: MomentumInput
): WorkoutMomentumState {
  const {
    sessionId,
    totalSetsCompleted,
    elapsedSinceLastActionSec,
    restTimeCurrentSec,
    averageRestTimeSec,
    exercisesCompleted,
    totalExercises,
    workoutStyle,
    lastSetWasFailure,
  } = input;

  const expectedRest = EXPECTED_REST[workoutStyle] ?? 90;
  const status = deriveStatus(elapsedSinceLastActionSec, expectedRest, workoutStyle);
  const score = calculateScore(input, expectedRest, status);
  const dropoffRisk = calculateDropoffRisk(elapsedSinceLastActionSec, expectedRest, totalSetsCompleted);

  const warning = buildWarning(status, elapsedSinceLastActionSec, expectedRest, totalSetsCompleted);
  const encouragement = buildEncouragement(score, totalSetsCompleted, exercisesCompleted, totalExercises);

  return {
    sessionId,
    score,
    status,
    setsSinceLastRest: totalSetsCompleted,
    elapsedSinceLastActionSec,
    restTimeCurrentSec,
    averageRestTimeSec,
    dropoffRisk,
    suggestedActions: [],
    warning,
    encouragement,
  };
}

function deriveStatus(
  elapsedSec: number,
  expectedRest: number,
  workoutStyle: string
): MomentumStatus {
  const ratio = elapsedSec / expectedRest;
  if (ratio >= DROPOFF_THRESHOLDS.dropped) return 'dropped';
  if (ratio >= DROPOFF_THRESHOLDS.stalled) return 'stalled';
  if (ratio >= DROPOFF_THRESHOLDS.slowing) return 'slowing';
  return 'flowing';
}

function calculateScore(
  input: MomentumInput,
  expectedRest: number,
  status: MomentumStatus
): number {
  const { elapsedSinceLastActionSec, totalSetsCompleted, exercisesCompleted, totalExercises } = input;

  // Base score from elapsed vs expected
  const restRatio = Math.min(elapsedSinceLastActionSec / expectedRest, 4);
  let score = 100 - restRatio * 20; // -20 per expected rest interval exceeded

  // Bonus for completing many sets
  score += Math.min(totalSetsCompleted * 2, 20);

  // Bonus for session progress
  const progressPct = totalExercises > 0 ? exercisesCompleted / totalExercises : 0;
  score += progressPct * 10;

  // Penalty for being stalled/dropped
  if (status === 'stalled') score *= 0.7;
  if (status === 'dropped') score *= 0.4;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateDropoffRisk(
  elapsedSec: number,
  expectedRest: number,
  setsCompleted: number
): number {
  const restRatio = elapsedSec / expectedRest;

  // Base risk from rest time ratio
  let risk = Math.min(1, restRatio / 4);

  // Fewer sets = higher risk of cold exit
  if (setsCompleted <= 2) risk += 0.1;

  return Math.min(1, Math.round(risk * 100) / 100);
}

function buildWarning(
  status: MomentumStatus,
  elapsedSec: number,
  expectedRest: number,
  setsCompleted: number
): string | null {
  const elapsed = Math.round(elapsedSec);
  if (status === 'dropped') {
    return `${formatSec(elapsed)} since last action — still training?`;
  }
  if (status === 'stalled') {
    return `Rest time is ${Math.round(elapsedSec / expectedRest)}× usual — ready when you are`;
  }
  if (status === 'slowing') {
    return `Longer rest than usual — take your time`;
  }
  return null;
}

function buildEncouragement(
  score: number,
  sets: number,
  exercisesDone: number,
  exercisesTotal: number
): string | null {
  if (score >= 80 && sets >= 3) return `Great pace! ${sets} sets in flow`;
  if (exercisesTotal > 0 && exercisesDone === exercisesTotal - 1) {
    return `One exercise left — almost there!`;
  }
  if (score >= 60 && sets >= 2) return `Keep it up!`;
  return null;
}

function formatSec(sec: number): string {
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}m ${sec % 60}s`;
}
