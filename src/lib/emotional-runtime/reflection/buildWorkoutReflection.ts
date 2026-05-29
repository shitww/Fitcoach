// ── Build Workout Reflection ──────────────────────────────────────────────────
// Post-workout analytical feedback. Calm + analytical tone.
// No hype. Factual and useful.
// ─────────────────────────────────────────────────────────────────────────────

import type { WorkoutReflection, RecoveryReflection } from '@/types/emotional-runtime';
import type { RecoveryData } from '@/lib/dashboard-bootstrap';

export interface WorkoutReflectionInput {
  sessionDate: string;
  muscleGroups: string[];
  sessionVolume: number;       // total sets × weight × reps
  avgRecentVolume: number;     // average volume over last 3–5 sessions
  topExercise?: string | null;
  topExerciseTrend?: 'up' | 'stable' | 'down';
  durationMin: number;
}

const RECOVERY_HOURS_BY_MUSCLE: Record<string, [number, number]> = {
  chest:    [48, 72],
  back:     [48, 72],
  legs:     [48, 96],
  shoulders:[24, 48],
  arms:     [24, 48],
  core:     [24, 48],
  default:  [48, 72],
};

/** Build the post-workout reflection for the completed session. */
export function buildWorkoutReflection(
  input: WorkoutReflectionInput
): WorkoutReflection {
  const { sessionDate, muscleGroups, sessionVolume, avgRecentVolume, topExercise, topExerciseTrend, durationMin } = input;

  const intensityDelta = avgRecentVolume > 0
    ? Math.round(((sessionVolume - avgRecentVolume) / avgRecentVolume) * 100)
    : 0;

  const intensityLabel =
    intensityDelta > 10 ? 'heavier' :
    intensityDelta < -10 ? 'lighter' : 'similar';

  const recoveryHours = getRecoveryEstimate(muscleGroups);

  const highlightMessage = buildHighlightMessage(topExercise ?? null, topExerciseTrend ?? null);
  const consistencyNote = buildConsistencyNote(durationMin, intensityLabel);

  return {
    sessionId: null,
    sessionDate,
    muscleGroups,
    intensityVsAvg: intensityDelta,
    intensityLabel,
    highlightExercise: topExercise ?? null,
    highlightMessage,
    estimatedRecoveryHours: recoveryHours,
    consistencyNote,
    tone: 'analytical',
  };
}

/** Build recovery reflection for specific muscle groups. */
export function buildRecoveryReflection(
  muscleGroup: string,
  intensity: 'low' | 'moderate' | 'high'
): RecoveryReflection {
  const hours = RECOVERY_HOURS_BY_MUSCLE[muscleGroup.toLowerCase()] ?? RECOVERY_HOURS_BY_MUSCLE.default;
  const fatigueLevel = intensity;
  const minDays = Math.ceil(hours[0] / 24);
  const maxDays = Math.ceil(hours[1] / 24);
  const nextRange = minDays === maxDays ? `${minDays} 天后` : `${minDays}–${maxDays} 天后`;

  return {
    muscleGroup,
    estimatedRecoveryHours: hours,
    fatigueLevel,
    recommendedNextSessionIn: nextRange,
    note: buildRecoveryNote(muscleGroup, intensity),
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function getRecoveryEstimate(muscleGroups: string[]): [number, number] {
  let maxMin = 24, maxMax = 48;
  for (const mg of muscleGroups) {
    const [lo, hi] = RECOVERY_HOURS_BY_MUSCLE[mg.toLowerCase()] ?? RECOVERY_HOURS_BY_MUSCLE.default;
    if (lo > maxMin) maxMin = lo;
    if (hi > maxMax) maxMax = hi;
  }
  return [maxMin, maxMax];
}

function buildHighlightMessage(
  exercise: string | null,
  trend: 'up' | 'stable' | 'down' | null
): string | null {
  if (!exercise) return null;
  if (trend === 'up') return `${exercise} 表现稳定提升`;
  if (trend === 'stable') return `${exercise} 保持稳定水平`;
  if (trend === 'down') return `${exercise} 略有下降，注意恢复`;
  return null;
}

function buildConsistencyNote(durationMin: number, intensity: string): string | null {
  if (durationMin < 30) return '今天是短时高效训练';
  if (durationMin > 90) return '今天训练时长较长，注意恢复';
  if (intensity === 'heavier') return '今天强度高于近期平均，建议充分恢复';
  return null;
}

function buildRecoveryNote(muscleGroup: string, intensity: string): string {
  if (intensity === 'high') return `${muscleGroup}承受高强度训练，需要充分休息`;
  if (intensity === 'moderate') return `${muscleGroup}正常强度，保持规律恢复`;
  return `${muscleGroup}轻量训练，恢复快速`;
}
