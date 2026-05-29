// ── Runtime Reliability Contracts ─────────────────────────────────────────────
// Type definitions for production-grade runtime persistence, recovery, trust,
// offline support, and long-term stability.
// Phase 6: Trust, Persistence & Real-World Runtime.
// ─────────────────────────────────────────────────────────────────────────────

import type { CompletedSetRecord } from './frictionless-runtime';
import type { PredictionReason } from './predictive-flow';

// ── Live Session State ────────────────────────────────────────────────────────

/** Complete snapshot of an in-progress workout session. */
export interface WorkoutSessionState {
  sessionId: string;
  workoutId: string | null;
  startedAt: string;
  lastActivityAt: string;
  currentExerciseId: string | null;
  currentExerciseName: string | null;
  currentSetNumber: number;
  completedSets: CompletedSetRecord[];
  exerciseQueue: SerializedQueueItem[];
  completedExerciseIds: string[];
  totalVolume: number;
  elapsedMin: number;
  restTimerStartedAt: string | null;
  restRecommendedSec: number | null;
  pendingWeightInput: string | null;
  pendingRepsInput: string | null;
  splitLabel: string | null;
}

/** A serialized queue item (UI-decoupled). */
export interface SerializedQueueItem {
  exerciseId: string;
  exerciseName: string;
  orderIndex: number;
  status: 'pending' | 'current' | 'completed' | 'skipped';
  estimatedSets: number;
  targetMuscle: string;
}

// ── Runtime Snapshot ──────────────────────────────────────────────────────────

/** The current schema version for snapshots. Increment on breaking changes. */
export const RUNTIME_SNAPSHOT_VERSION = 1;

/** Complete persistence snapshot of all runtime state. */
export interface RuntimeSnapshot {
  snapshotId: string;          // unique UUID per snapshot
  version: number;             // schema version for migration
  runtimeVersion: string;      // app version that wrote this
  createdAt: string;           // ISO timestamp
  sessionState: WorkoutSessionState | null;
  recoveryState: RecoverySessionState | null;
  pendingInputs: PendingRuntimeInput[];
  checksum: string;            // lightweight integrity check
}

/** A pending user input that hasn't been persisted to DB yet. */
export interface PendingRuntimeInput {
  id: string;
  type: 'weight' | 'reps' | 'food' | 'note';
  value: string;
  context: string;
  capturedAt: string;
}

// ── Offline Runtime ───────────────────────────────────────────────────────────

/** Action types that can be queued offline. */
export type OfflineActionType =
  | 'log_set'
  | 'log_food'
  | 'start_workout'
  | 'end_workout'
  | 'add_exercise'
  | 'remove_exercise'
  | 'skip_exercise'
  | 'log_rest_override'
  | 'log_note';

/** Status of an offline queued action. */
export type OfflineActionStatus = 'pending' | 'replaying' | 'completed' | 'failed' | 'superseded';

/** A single action queued while offline. */
export interface OfflineRuntimeAction {
  actionId: string;
  type: OfflineActionType;
  payload: Record<string, unknown>;
  queuedAt: string;
  retryCount: number;
  maxRetries: number;
  status: OfflineActionStatus;
  idempotencyKey: string;       // prevents duplicate replays
  dependsOn: string[];          // actionIds this must follow
  error: string | null;
}

/** The offline action queue. */
export interface OfflineRuntimeQueue {
  queueId: string;
  deviceId: string;
  actions: OfflineRuntimeAction[];
  totalPending: number;
  totalCompleted: number;
  lastQueuedAt: string;
  lastReplayAt: string | null;
  isReplaying: boolean;
}

// ── Crash Recovery ────────────────────────────────────────────────────────────

/** State captured for crash recovery. */
export interface RecoverySessionState {
  sessionId: string;
  wasInterrupted: boolean;
  interruptedAt: string;
  interruptionType: 'app_close' | 'crash' | 'background_kill' | 'network_loss' | 'unknown';
  currentExerciseId: string | null;
  currentExerciseName: string | null;
  currentSetNumber: number;
  restTimerRemainingMs: number | null;
  exerciseQueue: SerializedQueueItem[];
  completedExerciseIds: string[];
  elapsedMin: number;
  canRecover: boolean;
  recoveryWindowMs: number;    // ms from interruption within which recovery is valid
  recoveryExpiresAt: string;
}

/** Result of a recovery detection check. */
export interface RecoveryDetectionResult {
  hasRecoverableSession: boolean;
  sessionState: RecoverySessionState | null;
  isExpired: boolean;
  minutesSinceInterruption: number;
  message: string;
}

/** A successfully restored workout session. */
export interface RestoredWorkoutSession {
  sessionId: string;
  currentExerciseId: string | null;
  currentExerciseName: string | null;
  currentSetNumber: number;
  restTimerRemainingMs: number | null;
  exerciseQueue: SerializedQueueItem[];
  elapsedMin: number;
  restoredAt: string;
  wasAutoRestored: boolean;
}

// ── Prediction Trust ──────────────────────────────────────────────────────────

/** Trust calibration level for predictions. */
export type CalibrationLevel = 'calibrated' | 'learning' | 'uncalibrated' | 'suppressed';

/** Per-exercise prediction trust state. */
export interface PredictionTrustState {
  exerciseId: string;
  exerciseName: string;
  overallTrust: number;          // 0-1
  recentAccuracy: number;        // correct predictions / total (last 30)
  acceptanceRate: number;        // user accepted / total shown (last 30)
  sampleSize: number;
  calibrationLevel: CalibrationLevel;
  shouldSuppressPrediction: boolean;
  suppressReason: string | null;
  lastEvaluatedAt: string;
}

/** Global prediction trust across the system. */
export interface GlobalPredictionTrust {
  overallSystemTrust: number;
  exerciseTrustMap: Record<string, PredictionTrustState>;
  suppressedCount: number;
  calibratedCount: number;
  learningCount: number;
  lastUpdatedAt: string;
}

/** A single prediction outcome for accuracy tracking. */
export interface PredictionOutcome {
  predictionId: string;
  exerciseId: string;
  predictedWeight: number;
  predictedReps: number;
  actualWeight: number;
  actualReps: number;
  wasAccepted: boolean;
  wasModified: boolean;
  weightDeltaPct: number;   // how far off the weight prediction was
  repsDelta: number;
  recordedAt: string;
}

// ── Runtime Health ────────────────────────────────────────────────────────────

/** Current health of the prediction + runtime system. */
export interface RuntimeHealthState {
  snapshotAt: string;
  predictionAccuracy: number;       // 0-1 (recent 30-session rolling avg)
  acceptanceRate: number;           // 0-1 (user accepted vs rejected)
  queueStability: number;           // 0-1 (no unexpected queue changes)
  averageLatencyMs: number;         // prediction generation time
  persistenceSuccess: number;       // 0-1 (successful saves / total)
  memoryUsageEstimateKb: number;
  offlineQueueDepth: number;        // pending offline actions
  isHealthy: boolean;
  degradationSignals: string[];     // human-readable issues
  recommendations: string[];        // actions to improve health
}

/** A recorded runtime performance metric. */
export interface RuntimeMetric {
  metricId: string;
  type: 'latency' | 'accuracy' | 'acceptance' | 'memory' | 'persistence';
  value: number;
  unit: string;
  recordedAt: string;
  sessionId: string | null;
}

// ── Memory Compression ────────────────────────────────────────────────────────

/** A compressed summary of a single exercise's history. */
export interface ExerciseBehaviorSummary {
  exerciseId: string;
  exerciseName: string;
  muscleGroup: string;
  totalSessions: number;
  avgWeight: number;
  peakWeight: number;
  avgReps: number;
  avgVolume: number;
  lastPerformedAt: string;
  frequency30d: number;
  progressionRate: number; // avg weight gain per session (kg)
  trendLabel: 'up' | 'down' | 'stable' | 'insufficient';
}

/** A compressed summary of food logging history. */
export interface FoodBehaviorSummary {
  foodId: string;
  foodName: string;
  totalLogs: number;
  avgCalories: number;
  frequency30d: number;
  frequentMealTimes: string[];
  lastLoggedAt: string;
}

/** Result of a behavior memory compression operation. */
export interface CompressedBehaviorMemory {
  compressedAt: string;
  compressionVersion: number;
  originalSessionCount: number;
  archivedSessionCount: number;
  retainedRecentCount: number;
  exerciseSummaries: ExerciseBehaviorSummary[];
  foodSummaries: FoodBehaviorSummary[];
  compressionRatioEstimate: number; // 0-1 (lower = more compressed)
  memoryReductionEstimateKb: number;
}

/** Configuration for memory compression. */
export interface CompressionConfig {
  retainRecentDays: number;      // keep full detail for last N days
  archiveAfterDays: number;      // archive sessions older than N days
  maxRetainedSessions: number;   // hard cap on full-detail sessions
  compressOnScheduleDays: number; // run compression every N days
}

// ── Cross-Device Sync ─────────────────────────────────────────────────────────

/** A sync-ready snapshot for cross-device transfer. */
export interface SyncRuntimeSnapshot {
  deviceId: string;
  syncVersion: number;
  syncSchemaVersion: number;
  lastSyncAt: string | null;
  runtimeSnapshot: RuntimeSnapshot;
  offlineQueue: OfflineRuntimeQueue;
  conflictResolutions: RuntimeConflictResolution[];
  behaviorMemoryChecksum: string;
}

/** How a conflict between two device states was resolved. */
export interface RuntimeConflictResolution {
  conflictId: string;
  field: string;                  // which data field conflicted
  type: 'last_write_wins' | 'merge' | 'local_wins' | 'remote_wins' | 'manual';
  localTimestamp: string;
  remoteTimestamp: string;
  localChecksum: string;
  remoteChecksum: string;
  resolvedValue: unknown;
  resolvedAt: string;
  reasoning: string;
}

/** Result of a sync merge operation. */
export interface SyncMergeResult {
  mergedAt: string;
  conflicts: RuntimeConflictResolution[];
  newLocalActions: number;
  newRemoteActions: number;
  sessionsMerged: number;
  isFastForward: boolean;         // no conflicts — simple merge
}

// ── Stability ─────────────────────────────────────────────────────────────────

/** An update batching configuration. */
export interface RuntimeUpdateBatch {
  batchId: string;
  queuedUpdates: RuntimeUpdateEntry[];
  flushIntervalMs: number;
  lastFlushedAt: string | null;
  isPending: boolean;
}

/** A single runtime state update entry. */
export interface RuntimeUpdateEntry {
  updateId: string;
  type: 'prediction' | 'session' | 'queue' | 'momentum' | 'rest_timer' | 'input';
  priority: 'critical' | 'high' | 'normal' | 'low';
  payload: Record<string, unknown>;
  enqueuedAt: string;
  dependencies: string[];         // updateIds this must follow
}

/** Stability configuration for the runtime update loop. */
export interface StabilityConfig {
  maxUpdatesPerSecond: number;
  criticalUpdateImmediateMs: number;
  normalUpdateBatchMs: number;
  lowPriorityDeferMs: number;
  maxPendingUpdates: number;
  enableDependencyIsolation: boolean;
}
