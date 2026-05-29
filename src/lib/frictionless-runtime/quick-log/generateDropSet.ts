// ── Generate Drop Set ────────────────────────────────────────────────────────
// Creates drop set actions following a failure or explicit drop trigger.
// ─────────────────────────────────────────────────────────────────────────────

import type { QuickSetAction, CompletedSetRecord } from '@/types/frictionless-runtime';

export interface DropSetConfig {
  dropPercentage: number; // 0-1, e.g. 0.15 = 15% drop
  repsBonus: number;      // extra reps to compensate for lower weight
}

const DEFAULT_DROP_CONFIG: DropSetConfig = {
  dropPercentage: 0.15,
  repsBonus: 2,
};

/** Generate a drop set from the last completed set.
 *  Reduces weight by ~15% and adds 2 reps.
 */
export function generateDropSet(
  lastSet: CompletedSetRecord,
  setNumber: number,
  exerciseId: string,
  config: Partial<DropSetConfig> = {}
): QuickSetAction {
  const cfg = { ...DEFAULT_DROP_CONFIG, ...config };
  const dropWeight = roundHalf(lastSet.weight * (1 - cfg.dropPercentage));
  const dropReps = lastSet.reps + cfg.repsBonus;
  const dropPct = Math.round(cfg.dropPercentage * 100);

  return {
    id: `drop_${exerciseId}_${setNumber}`,
    type: 'drop_set',
    label: `Drop ${dropWeight}kg × ${dropReps}  (-${dropPct}%)`,
    displayWeight: `${dropWeight} kg`,
    displayReps: `${dropReps}`,
    weight: dropWeight,
    reps: dropReps,
    rir: 0,
    isOneTap: true,
    confidence: 0.9,
    reasoning: `Drop set after failure: -${dropPct}% weight`,
  };
}

/** Generate a mechanical drop set (e.g. for machines with plate stacks). */
export function generateMechanicalDropSet(
  lastSet: CompletedSetRecord,
  setNumber: number,
  exerciseId: string
): QuickSetAction {
  const plateIncrements = [20, 25, 30, 35, 40, 45, 50, 60, 70, 80];
  const currentPlate = plateIncrements.find((p) => p >= lastSet.weight) ?? lastSet.weight;
  const prevPlate = plateIncrements[plateIncrements.indexOf(currentPlate) - 1] ?? lastSet.weight * 0.85;
  const dropReps = lastSet.reps + 2;

  return {
    id: `mech_drop_${exerciseId}_${setNumber}`,
    type: 'drop_set',
    label: `Drop ${prevPlate}kg × ${dropReps}  (plate drop)`,
    displayWeight: `${prevPlate} kg`,
    displayReps: `${dropReps}`,
    weight: prevPlate,
    reps: dropReps,
    rir: 0,
    isOneTap: true,
    confidence: 0.85,
    reasoning: `Plate drop: ${lastSet.weight}→${prevPlate}kg`,
  };
}

function roundHalf(value: number): number {
  return Math.round(value * 2) / 2;
}
