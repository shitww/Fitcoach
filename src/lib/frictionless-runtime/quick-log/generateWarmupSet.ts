// ── Generate Warmup Set ──────────────────────────────────────────────────────
// Auto-fills warmup sets based on target working weight.
// ─────────────────────────────────────────────────────────────────────────────

import type { QuickSetAction } from '@/types/frictionless-runtime';

export interface WarmupSetConfig {
  targetWeight: number; // working weight
  targetReps: number;   // working reps
}

/** Standard warmup protocol percentages. */
const WARMUP_PROTOCOL: readonly { pct: number; reps: number; label: string }[] = [
  { pct: 0.4, reps: 12, label: 'Activation' },   // 40% × 12
  { pct: 0.6, reps: 8,  label: 'Ramp Up' },      // 60% × 8
  { pct: 0.8, reps: 3,  label: 'Heavy Warmup' }, // 80% × 3
] as const;

/** Generate a full warmup sequence for a target working weight.
 *  Returns ordered warmup sets, lightest first.
 */
export function generateWarmupSets(
  config: WarmupSetConfig,
  exerciseId: string
): QuickSetAction[] {
  const { targetWeight, targetReps } = config;

  return WARMUP_PROTOCOL.map((step, i) => {
    const warmupWeight = roundHalf(targetWeight * step.pct);
    const finalWeight = Math.max(20, warmupWeight); // minimum bar weight

    return {
      id: `warmup_${exerciseId}_${i + 1}`,
      type: 'warmup_set' as const,
      label: `Warmup ${i + 1}: ${finalWeight}kg × ${step.reps}  (${step.label})`,
      displayWeight: `${finalWeight} kg`,
      displayReps: `${step.reps}`,
      weight: finalWeight,
      reps: step.reps,
      rir: null,
      isOneTap: true,
      confidence: 0.95,
      reasoning: `${step.label} — ${Math.round(step.pct * 100)}% of ${targetWeight}kg`,
    };
  });
}

/** Generate a single auto-fill warmup set for a given set number. */
export function generateWarmupSet(
  setNumber: number,
  targetWeight: number,
  exerciseId: string
): QuickSetAction | null {
  const step = WARMUP_PROTOCOL[setNumber - 1];
  if (!step) return null;

  const weight = Math.max(20, roundHalf(targetWeight * step.pct));

  return {
    id: `warmup_${exerciseId}_${setNumber}`,
    type: 'warmup_set',
    label: `Warmup: ${weight}kg × ${step.reps}`,
    displayWeight: `${weight} kg`,
    displayReps: `${step.reps}`,
    weight,
    reps: step.reps,
    rir: null,
    isOneTap: true,
    confidence: 0.92,
    reasoning: `${step.label} warmup — ${Math.round(step.pct * 100)}% of target`,
  };
}

/** Estimate working weight from first set when history is unavailable. */
export function estimateWorkingWeightFromWarmup(warmupWeight: number): number {
  return roundHalf(warmupWeight / 0.6);
}

function roundHalf(value: number): number {
  return Math.round(value * 2) / 2;
}
