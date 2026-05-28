// ── FitCoach V2 — Auto Warmup Intelligence Engine ──────────────────────────
// Generates warmup sets from working weight using simple rule-based steps.
// Fast. Deterministic. One-tap ready.

import type { WarmupPlan, WarmupSet } from './trainingTypes';

// ── Configuration ──────────────────────────────────────────────────────────

interface WarmupConfig {
  steps: number;         // how many warmup sets
  startPercent: number;  // first set % of working weight
  endPercent: number;    // last warmup set %
  minReps: number;
  maxReps: number;
  minWeight: number;     // absolute floor for warmup
}

const DEFAULT_CFG: WarmupConfig = {
  steps: 4,
  startPercent: 0.20,
  endPercent: 0.80,
  minReps: 5,
  maxReps: 12,
  minWeight: 20, // empty bar ~20kg
};

const BODYWEIGHT_CFG: WarmupConfig = {
  steps: 3,
  startPercent: 0.40,
  endPercent: 0.75,
  minReps: 5,
  maxReps: 10,
  minWeight: 0,
};

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Generate a warmup plan given the target working weight and reps.
 * If bodyweight, uses assisted / easier variant progression.
 */
export function generateWarmup(
  workWeight: number,
  workReps: number,
  isBodyweight: boolean = false
): WarmupPlan {
  if (workWeight <= 0 && !isBodyweight) {
    return { sets: [], note: null };
  }

  const cfg = isBodyweight ? BODYWEIGHT_CFG : DEFAULT_CFG;
  const sets: WarmupSet[] = [];
  const stepDelta = (cfg.endPercent - cfg.startPercent) / Math.max(cfg.steps - 1, 1);

  for (let i = 0; i < cfg.steps; i++) {
    const pct = cfg.startPercent + stepDelta * i;
    let w = isBodyweight ? 0 : Math.round(workWeight * pct);
    w = Math.max(w, cfg.minWeight);

    // Fewer reps as weight approaches working weight
    const reps = Math.max(
      cfg.minReps,
      Math.min(cfg.maxReps, Math.round(workReps * (1 - i * 0.15)))
    );

    // Skip duplicate weights (common with light loads)
    if (sets.length > 0 && sets[sets.length - 1].weight === w) {
      continue;
    }

    // Stop once we reach or exceed working weight
    if (!isBodyweight && w >= workWeight) break;

    sets.push({ weight: w, reps, percentOfWorkWeight: pct });
  }

  // Edge case: very light working weight → fewer sets
  if (!isBodyweight && workWeight < 40) {
    while (sets.length > 2) sets.pop();
  }

  // Ensure last warmup set is reasonably close to work weight
  if (!isBodyweight && sets.length > 0) {
    const last = sets[sets.length - 1];
    if (last.weight < workWeight * 0.5) {
      const midW = Math.round(workWeight * 0.6);
      if (midW > last.weight) {
        sets.push({
          weight: midW,
          reps: Math.max(3, Math.round(workReps * 0.5)),
          percentOfWorkWeight: 0.6,
        });
      }
    }
  }

  const note = isBodyweight
    ? '先完成简单变式，逐步增加难度'
    : sets.length > 0
    ? `共 ${sets.length} 组热身，最后一组约为 ${sets[sets.length - 1].weight}kg`
    : null;

  return { sets, note };
}

/**
 * Quick 1–2 set micro-warmup for weight jumps within the same exercise.
 */
export function generateMicroWarmup(
  previousWeight: number,
  nextWeight: number
): WarmupSet[] {
  if (nextWeight <= previousWeight || previousWeight <= 0) return [];
  const jump = nextWeight - previousWeight;
  if (jump < 10) return []; // small jump, no need

  const mid = Math.round(previousWeight + jump * 0.5);
  return [
    { weight: mid, reps: 5, percentOfWorkWeight: mid / nextWeight },
    { weight: nextWeight, reps: 3, percentOfWorkWeight: 1.0 },
  ];
}
