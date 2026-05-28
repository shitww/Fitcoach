// ── FitCoach Phase 3 — Unified Training Signal Types ──────────────────────
// All intelligence engines consume this unified signal layer.
// Single source of truth for training state interpretation.

/** Canonical training signals emitted by the signal engine.
 *  All downstream engines (progression, fatigue, recovery, insight, coaching)
 *  consume these signals to ensure consistency and avoid contradictions.
 */
export type TrainingSignalType =
  // Volume dynamics
  | 'volume_rising'
  | 'volume_falling'
  | 'volume_stable'
  | 'volume_spike'
  // Performance
  | 'pr_streak'
  | 'pr_drought'
  | 'plateau_detected'
  | 'progression_ready'
  | 'form_degrading'
  | 'reps_declining'
  // Fatigue / recovery
  | 'fatigue_risk'
  | 'fatigue_mild'
  | 'recovery_low'
  | 'recovery_good'
  | 'overreaching_detected'
  // Frequency / scheduling
  | 'frequency_high'
  | 'frequency_low'
  | 'consistency_high'
  | 'consistency_low'
  // Muscle balance
  | 'muscle_imbalance'
  | 'neglected_muscle_group'
  // Profile / identity
  | 'strength_focused'
  | 'hypertrophy_focused'
  | 'endurance_focused'
  | 'beginner_pattern'
  | 'intermediate_pattern'
  | 'advanced_pattern'
  // Behavioral
  | 'rest_insufficient'
  | 'skipped_sessions'
  | 'deload_needed';

export type SignalSeverity = 'positive' | 'neutral' | 'attention' | 'critical';

export interface TrainingSignal {
  type: TrainingSignalType;
  /** Which subsystem generated this signal. */
  source: 'volume' | 'performance' | 'fatigue' | 'frequency' | 'profile' | 'behavior';
  /** Confidence 0–1 based on data quality & quantity. */
  confidence: number;
  severity: SignalSeverity;
  /** Short, explainable reason. */
  reason: string;
  /** Affected exercise names, if applicable. */
  affectedExercises?: string[];
  /** Affected muscle groups, if applicable. */
  affectedMuscleGroups?: string[];
  /** Raw metadata for debugging / advanced consumers. */
  metadata?: Record<string, number | string | boolean>;
}

/** The aggregated, conflict-resolved signal state.
 *  This is what all downstream engines read from.
 */
export interface UnifiedSignalState {
  signals: TrainingSignal[];
  /** Highest-confidence active signals, one per category. */
  dominant: Map<TrainingSignal['source'], TrainingSignal>;
  /** Overall system confidence (0–1). */
  overallConfidence: number;
  /** Timestamp of generation. */
  generatedAt: number;
}

/** A consumer-facing recommendation that is backed by signals. */
export interface SignalBackedRecommendation {
  text: string;
  action?: string;
  confidence: number;
  /** Signals that back this recommendation. */
  backingSignals: TrainingSignalType[];
  reason: string;
}
