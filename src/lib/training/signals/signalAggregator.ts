// ── FitCoach Phase 3 — Signal Aggregator ──────────────────────────────────
// Resolves conflicts between signals and produces a clean, unified state.
// All downstream engines read from the aggregated state.

import type { TrainingSignal, UnifiedSignalState, TrainingSignalType } from './signalTypes';

// ── Configuration ──────────────────────────────────────────────────────────

/** Signals that override others in the same category. */
const OVERRIDE_RULES: Record<string, TrainingSignalType[]> = {
  volume_rising: ['volume_stable'],
  volume_falling: ['volume_stable'],
  volume_spike: ['volume_rising', 'volume_stable'],
  fatigue_risk: ['recovery_low', 'fatigue_mild'],
  recovery_good: ['recovery_low'],
  overreaching_detected: ['progression_ready', 'pr_streak'],
  consistency_low: ['consistency_high'],
  deload_needed: ['progression_ready', 'pr_streak', 'volume_rising'],
};

/** Severity priority for conflict resolution. */
const SEVERITY_RANK: Record<TrainingSignal['severity'], number> = {
  critical: 4,
  attention: 3,
  neutral: 2,
  positive: 1,
};

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Aggregate raw signals into a unified, conflict-free state.
 * Downstream engines should read from this state exclusively.
 */
export function aggregateSignals(
  signals: TrainingSignal[],
  overallConfidence: number
): UnifiedSignalState {
  // 1. Resolve conflicts (remove overridden signals)
  const resolved = resolveConflicts(signals);

  // 2. Pick dominant signal per source
  const dominant = pickDominantPerSource(resolved);

  return {
    signals: resolved,
    dominant,
    overallConfidence,
    generatedAt: Date.now(),
  };
}

/**
 * Check if a specific signal type is active in the aggregated state.
 */
export function hasSignal(
  state: UnifiedSignalState,
  type: TrainingSignalType
): boolean {
  return state.signals.some((s) => s.type === type);
}

/**
 * Get the most confident signal of a given type.
 */
export function getSignal(
  state: UnifiedSignalState,
  type: TrainingSignalType
): TrainingSignal | undefined {
  return state.signals
    .filter((s) => s.type === type)
    .sort((a, b) => b.confidence - a.confidence)[0];
}

/**
 * Get all active signals for a source category.
 */
export function getSignalsBySource(
  state: UnifiedSignalState,
  source: TrainingSignal['source']
): TrainingSignal[] {
  return state.signals.filter((s) => s.source === source);
}

/**
 * Check if any critical signal is active.
 */
export function hasCriticalSignal(state: UnifiedSignalState): boolean {
  return state.signals.some((s) => s.severity === 'critical');
}

/**
 * Get the highest-severity active signal.
 */
export function getHighestSeveritySignal(
  state: UnifiedSignalState
): TrainingSignal | null {
  const sorted = [...state.signals].sort(
    (a, b) => SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity]
  );
  return sorted[0] ?? null;
}

// ── Internal ───────────────────────────────────────────────────────────────

function resolveConflicts(signals: TrainingSignal[]): TrainingSignal[] {
  const toRemove = new Set<TrainingSignalType>();
  const byType = new Map<TrainingSignalType, TrainingSignal[]>();

  for (const s of signals) {
    const arr = byType.get(s.type) ?? [];
    arr.push(s);
    byType.set(s.type, arr);
  }

  for (const [winner, losers] of Object.entries(OVERRIDE_RULES)) {
    if (byType.has(winner as TrainingSignalType)) {
      for (const loser of losers) {
        toRemove.add(loser);
      }
    }
  }

  return signals.filter((s) => !toRemove.has(s.type));
}

function pickDominantPerSource(signals: TrainingSignal[]): Map<TrainingSignal['source'], TrainingSignal> {
  const map = new Map<TrainingSignal['source'], TrainingSignal>();

  for (const s of signals) {
    const existing = map.get(s.source);
    if (!existing) {
      map.set(s.source, s);
      continue;
    }
    // Pick by: higher severity → higher confidence
    const existingRank = SEVERITY_RANK[existing.severity];
    const newRank = SEVERITY_RANK[s.severity];
    if (newRank > existingRank || (newRank === existingRank && s.confidence > existing.confidence)) {
      map.set(s.source, s);
    }
  }

  return map;
}
