// ── Batch Runtime Updates ─────────────────────────────────────────────────────
// Coalesces rapid state updates to prevent cascade recomputations.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  RuntimeUpdateBatch,
  RuntimeUpdateEntry,
  StabilityConfig,
} from '@/types/runtime-reliability';

const DEFAULT_STABILITY_CONFIG: StabilityConfig = {
  maxUpdatesPerSecond: 10,
  criticalUpdateImmediateMs: 0,
  normalUpdateBatchMs: 50,
  lowPriorityDeferMs: 200,
  maxPendingUpdates: 50,
  enableDependencyIsolation: true,
};

/** Create an empty update batch. */
export function createUpdateBatch(flushIntervalMs = 50): RuntimeUpdateBatch {
  return {
    batchId: generateId(),
    queuedUpdates: [],
    flushIntervalMs,
    lastFlushedAt: null,
    isPending: false,
  };
}

/** Enqueue a new update into the batch.
 *  Critical updates bypass the queue and are returned immediately.
 */
export function enqueueUpdate(
  batch: RuntimeUpdateBatch,
  update: Omit<RuntimeUpdateEntry, 'updateId' | 'enqueuedAt'>,
  config: Partial<StabilityConfig> = {}
): { batch: RuntimeUpdateBatch; shouldFlushNow: boolean } {
  const cfg = { ...DEFAULT_STABILITY_CONFIG, ...config };

  const entry: RuntimeUpdateEntry = {
    ...update,
    updateId: generateId(),
    enqueuedAt: new Date().toISOString(),
  };

  // Critical updates never batch — flush immediately
  if (update.priority === 'critical') {
    return {
      batch: { ...batch, isPending: true },
      shouldFlushNow: true,
    };
  }

  // Drop lowest-priority updates if queue is full
  let updates = [...batch.queuedUpdates, entry];
  if (updates.length > cfg.maxPendingUpdates) {
    updates = updates.filter((u) => u.priority !== 'low');
  }

  return {
    batch: {
      ...batch,
      queuedUpdates: updates,
      isPending: true,
    },
    shouldFlushNow: false,
  };
}

/** Flush the batch: deduplicates, sorts by priority, returns ordered updates. */
export function flushBatch(
  batch: RuntimeUpdateBatch
): { updates: RuntimeUpdateEntry[]; batch: RuntimeUpdateBatch } {
  const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };

  const deduped = deduplicateUpdates(batch.queuedUpdates);
  const sorted = [...deduped].sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return {
    updates: sorted,
    batch: {
      ...batch,
      queuedUpdates: [],
      isPending: false,
      lastFlushedAt: new Date().toISOString(),
    },
  };
}

/** Deduplicate updates of the same type — keep only the latest. */
function deduplicateUpdates(updates: RuntimeUpdateEntry[]): RuntimeUpdateEntry[] {
  const byType = new Map<string, RuntimeUpdateEntry>();
  for (const u of updates) {
    const existing = byType.get(u.type);
    if (!existing || u.enqueuedAt > existing.enqueuedAt) {
      byType.set(u.type, u);
    }
  }
  return Array.from(byType.values());
}

function generateId(): string {
  return `upd_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}
