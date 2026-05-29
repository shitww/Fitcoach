// ── Compress Behavior Memory ──────────────────────────────────────────────────
// Reduces localStorage footprint while preserving predictive intelligence.
// ─────────────────────────────────────────────────────────────────────────────

import type { CompressedBehaviorMemory, CompressionConfig } from '@/types/runtime-reliability';
import type { BehaviorMemorySnapshot } from '@/types/workout-memory';
import { buildExerciseSummaries, buildFoodSummaries } from './buildBehaviorSummaries';
import { archiveOldSessions } from './archiveOldSessions';

const LAST_COMPRESSION_KEY = 'fitcoach_last_compression';

const DEFAULT_CONFIG: CompressionConfig = {
  retainRecentDays: 30,
  archiveAfterDays: 90,
  maxRetainedSessions: 100,
  compressOnScheduleDays: 30,
};

/** Compress behavior memory by archiving old sessions and building summaries.
 *  Recency-preserving: last 30 days of data retained in full detail.
 *  Returns a compression report — caller applies the result to memory store.
 */
export function compressBehaviorMemory(
  memory: BehaviorMemorySnapshot,
  config: Partial<CompressionConfig> = {}
): CompressedBehaviorMemory {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const now = new Date().toISOString();

  const beforeSizeKb = estimateSizeKb(memory);

  // Archive old sessions
  const archiveResult = archiveOldSessions(memory, cfg);

  // Build lightweight summaries
  const exerciseSummaries = buildExerciseSummaries(memory);
  const foodSummaries = buildFoodSummaries(memory);

  // Cap recent session list
  const originalCount = memory.workoutMemory.timeline.sessions.length;
  const retainedCount = Math.min(originalCount - archiveResult.archivedCount, cfg.maxRetainedSessions);

  const afterSizeEstimateKb = beforeSizeKb - archiveResult.freedEstimateKb;
  const compressionRatio = beforeSizeKb > 0 ? afterSizeEstimateKb / beforeSizeKb : 1;

  // Record compression timestamp
  try {
    localStorage.setItem(LAST_COMPRESSION_KEY, now);
  } catch { /* non-critical */ }

  return {
    compressedAt: now,
    compressionVersion: 1,
    originalSessionCount: originalCount,
    archivedSessionCount: archiveResult.archivedCount,
    retainedRecentCount: retainedCount,
    exerciseSummaries,
    foodSummaries,
    compressionRatioEstimate: Math.round(compressionRatio * 100) / 100,
    memoryReductionEstimateKb: archiveResult.freedEstimateKb,
  };
}

/** Check if compression should be run based on schedule. */
export function shouldRunCompression(
  config: Partial<CompressionConfig> = {}
): boolean {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  try {
    const last = localStorage.getItem(LAST_COMPRESSION_KEY);
    if (!last) return true; // never compressed

    const daysSinceLast =
      (Date.now() - new Date(last).getTime()) / (24 * 60 * 60 * 1000);
    return daysSinceLast >= cfg.compressOnScheduleDays;
  } catch {
    return false;
  }
}

/** Estimate the localStorage size of a behavior memory object. */
function estimateSizeKb(memory: BehaviorMemorySnapshot): number {
  try {
    return new TextEncoder().encode(JSON.stringify(memory)).length / 1024;
  } catch {
    return 0;
  }
}
