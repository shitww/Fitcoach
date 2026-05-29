// ── Build Recovery Reflection ─────────────────────────────────────────────────
// Post-workout recovery analysis. Helps users understand rest.
// "恢复也是训练的一部分"
// ─────────────────────────────────────────────────────────────────────────────

import type { RecoveryReflection } from '@/types/emotional-runtime';
import type { RecoveryData } from '@/lib/dashboard-bootstrap';

/** Build a recovery reflection from dashboard recovery data. */
export function buildRecoveryReflectionFromData(
  recovery: RecoveryData,
  muscleGroups: string[]
): RecoveryReflection[] {
  const intensity: RecoveryReflection['fatigueLevel'] =
    recovery.fatigueScore >= 70 ? 'high' :
    recovery.fatigueScore >= 40 ? 'moderate' :
    recovery.fatigueLevel === 'high' ? 'high' : 'low';

  return muscleGroups.map((mg) => buildMuscleRecovery(mg, intensity));
}

/** Get the recovery insight line for the empty state / rest day. */
export function getRecoveryInsight(recovery: RecoveryData): string {
  const { fatigueLevel, daysSinceLastWorkout } = recovery;

  if (daysSinceLastWorkout === 0) return '今日已完成训练，注意恢复';
  if (fatigueLevel === 'high') return '疲劳积累较高，今天是恢复最好的时机';
  if (fatigueLevel === 'medium') return '适度休息有助于明天更好的表现';
  if (daysSinceLastWorkout >= 3) return '恢复也是训练的一部分';
  return '充分恢复，为下次训练蓄力';
}

function buildMuscleRecovery(
  muscleGroup: string,
  fatigueLevel: 'low' | 'moderate' | 'high'
): RecoveryReflection {
  const hours = getRecoveryHours(muscleGroup, fatigueLevel);
  const minDays = Math.ceil(hours[0] / 24);
  const maxDays = Math.ceil(hours[1] / 24);
  const nextRange = minDays === maxDays ? `${minDays} 天后` : `${minDays}–${maxDays} 天后`;

  return {
    muscleGroup,
    estimatedRecoveryHours: hours,
    fatigueLevel,
    recommendedNextSessionIn: nextRange,
    note: buildNote(muscleGroup, fatigueLevel),
  };
}

function getRecoveryHours(
  muscleGroup: string,
  intensity: 'low' | 'moderate' | 'high'
): [number, number] {
  const base: Record<string, [number, number]> = {
    chest:     [48, 72],
    back:      [48, 72],
    legs:      [48, 96],
    shoulders: [24, 48],
    arms:      [24, 48],
    core:      [24, 48],
  };
  const [lo, hi] = base[muscleGroup.toLowerCase()] ?? [48, 72];
  if (intensity === 'high') return [hi, hi + 24] as [number, number];
  if (intensity === 'low')  return [Math.max(24, lo - 12), lo] as [number, number];
  return [lo, hi];
}

function buildNote(group: string, intensity: 'low' | 'moderate' | 'high'): string {
  if (intensity === 'high') return `${group}高强度训练，充分休息优先`;
  if (intensity === 'low')  return `${group}轻量训练，恢复快速`;
  return `${group}正常强度，保持规律恢复`;
}
