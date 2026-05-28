// ── Muscle Recovery State ────────────────────────────────────────────────────
// Deterministic recovery model based on last trained date and session intensity.
// No AI. Simple, explainable, local-first.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  MuscleRecoveryState,
  BodyRecoverySnapshot,
  WorkoutSessionMemory,
} from '@/types/workout-memory';

import { MUSCLE_GROUPS } from '@/lib/fitness-taxonomy';

/** Recovery rate per day by muscle group (percentage points per day).
 *  Larger muscle groups recover slower.
 */
const RECOVERY_RATES: Record<string, number> = {
  legs: 25,       // 4 days to full recovery
  back: 30,       // ~3.5 days
  chest: 35,      // ~3 days
  shoulders: 40,   // ~2.5 days
  arms: 50,       // 2 days
  core: 60,       // ~1.5 days
};

/** Minimum required recovery score to be considered "recovered". */
const RECOVERED_THRESHOLD = 80;
const FATIGUED_THRESHOLD = 40;

/** Calculate recovery state for a single muscle group.
 *  Recovery score increases linearly with days since training,
 *  penalized by session intensity (fatigue contribution).
 */
export function calculateMuscleRecovery(
  muscleGroup: string,
  lastSession: WorkoutSessionMemory | null | undefined
): MuscleRecoveryState {
  if (!lastSession) {
    return {
      muscleGroup,
      lastTrainedAt: null,
      daysSinceTrained: 999,
      recoveryScore: 100,
      lastSessionVolume: 0,
      estimatedFatigueContribution: 0,
      status: 'recovered',
    };
  }

  const today = new Date();
  const trained = new Date(lastSession.date);
  const daysSince = Math.max(
    0,
    Math.floor((today.getTime() - trained.getTime()) / 86_400_000)
  );

  // Find the volume for this specific muscle group in the session
  let groupVolume = 0;
  for (const ex of lastSession.exercises) {
    if (ex.muscleGroup === muscleGroup) {
      groupVolume += ex.sets.reduce((s, set) => s + set.weight * set.reps, 0);
    }
  }

  // Baseline recovery per day
  const recoveryRate = RECOVERY_RATES[muscleGroup] || 35;
  let recoveryScore = Math.min(100, daysSince * recoveryRate);

  // Fatigue penalty: higher volume = longer recovery needed
  // Normalize: every 5000 volume units above baseline adds 1 "extra recovery day"
  const volumePenalty = Math.max(0, (groupVolume - 3000) / 5000) * recoveryRate;
  recoveryScore = Math.max(0, recoveryScore - volumePenalty);

  const status: MuscleRecoveryState['status'] =
    recoveryScore >= RECOVERED_THRESHOLD
      ? 'recovered'
      : recoveryScore >= FATIGUED_THRESHOLD
        ? 'recovering'
        : 'fatigued';

  return {
    muscleGroup,
    lastTrainedAt: lastSession.date,
    daysSinceTrained: daysSince,
    recoveryScore: Math.round(recoveryScore),
    lastSessionVolume: groupVolume,
    estimatedFatigueContribution: Math.round(volumePenalty),
    status,
  };
}

/** Build a full body recovery snapshot from session history. */
export function buildRecoverySnapshot(
  sessions: readonly WorkoutSessionMemory[]
): BodyRecoverySnapshot {
  // Find the most recent session per muscle group
  const lastSessionByGroup = new Map<string, WorkoutSessionMemory>();

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const session of sorted) {
    for (const group of session.muscleGroups) {
      if (!lastSessionByGroup.has(group)) {
        lastSessionByGroup.set(group, session);
      }
    }
  }

  const muscleGroups = MUSCLE_GROUPS.map((group) =>
    calculateMuscleRecovery(group, lastSessionByGroup.get(group))
  );

  const overallRecoveryScore = Math.round(
    muscleGroups.reduce((s, g) => s + g.recoveryScore, 0) / muscleGroups.length
  );

  const mostFatigued =
    muscleGroups.filter((g) => g.status !== 'recovered').sort(
      (a, b) => a.recoveryScore - b.recoveryScore
    )[0] || null;

  const fullyRecovered = muscleGroups.filter(
    (g) => g.status === 'recovered'
  );

  return {
    muscleGroups,
    overallRecoveryScore,
    mostFatigued,
    fullyRecovered,
  };
}

/** Quick check: is a specific muscle group recovered? */
export function isMuscleRecovered(
  sessions: readonly WorkoutSessionMemory[],
  muscleGroup: string
): boolean {
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  const lastSession = sorted.find((s) =>
    s.muscleGroups.includes(muscleGroup)
  );
  const state = calculateMuscleRecovery(muscleGroup, lastSession);
  return state.status === 'recovered';
}
