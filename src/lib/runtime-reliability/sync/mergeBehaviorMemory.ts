// ── Merge Behavior Memory ─────────────────────────────────────────────────────
// Deterministic merge of behavior memory from two devices.
// Eventual consistency: same inputs always produce the same merged output.
// ─────────────────────────────────────────────────────────────────────────────

import type { SyncMergeResult, SyncRuntimeSnapshot } from '@/types/runtime-reliability';
import { detectConflicts, resolveRuntimeConflict } from './resolveRuntimeConflicts';
import { selectNewerSnapshot } from './buildSyncSnapshot';

/** Merge two sync snapshots into a single canonical result.
 *  Deterministic: same local + remote → same merged output.
 */
export function mergeBehaviorMemory(
  local: SyncRuntimeSnapshot,
  remote: SyncRuntimeSnapshot
): { merged: SyncRuntimeSnapshot; result: SyncMergeResult } {
  const now = new Date().toISOString();

  // Fast-forward: if one is a strict ancestor of the other
  if (remote.syncVersion <= local.syncVersion) {
    return {
      merged: local,
      result: {
        mergedAt: now,
        conflicts: [],
        newLocalActions: 0,
        newRemoteActions: 0,
        sessionsMerged: 0,
        isFastForward: true,
      },
    };
  }

  // Detect conflicts
  const conflictCandidates = detectConflicts(local, remote);
  const resolutions = conflictCandidates.map(resolveRuntimeConflict);

  // Merge offline queues: union of all actions by idempotency key
  const mergedActions = mergeOfflineQueues(local, remote);

  // Pick base snapshot (newer wins for non-conflicted fields)
  const baseSnapshot = selectNewerSnapshot(local, remote);

  // Apply conflict resolutions
  const resolvedRuntimeSnapshot = applyResolutions(
    baseSnapshot.runtimeSnapshot,
    resolutions
  );

  const merged: SyncRuntimeSnapshot = {
    ...baseSnapshot,
    syncVersion: Math.max(local.syncVersion, remote.syncVersion) + 1,
    lastSyncAt: now,
    runtimeSnapshot: resolvedRuntimeSnapshot,
    offlineQueue: mergedActions,
    conflictResolutions: [...baseSnapshot.conflictResolutions, ...resolutions],
  };

  return {
    merged,
    result: {
      mergedAt: now,
      conflicts: resolutions,
      newLocalActions: countNewActions(local, remote),
      newRemoteActions: countNewActions(remote, local),
      sessionsMerged: 0,
      isFastForward: false,
    },
  };
}

function mergeOfflineQueues(
  local: SyncRuntimeSnapshot,
  remote: SyncRuntimeSnapshot
): SyncRuntimeSnapshot['offlineQueue'] {
  const localActions = local.offlineQueue.actions;
  const remoteActions = remote.offlineQueue.actions;

  const seen = new Set<string>();
  const merged = [...localActions, ...remoteActions].filter((a) => {
    if (seen.has(a.idempotencyKey)) return false;
    seen.add(a.idempotencyKey);
    return true;
  });

  return {
    ...local.offlineQueue,
    actions: merged,
    totalPending: merged.filter((a) => a.status === 'pending').length,
  };
}

function applyResolutions(
  snapshot: SyncRuntimeSnapshot['runtimeSnapshot'],
  resolutions: SyncMergeResult['conflicts']
): SyncRuntimeSnapshot['runtimeSnapshot'] {
  let result = { ...snapshot };
  for (const res of resolutions) {
    (result as Record<string, unknown>)[res.field] = res.resolvedValue;
  }
  return result;
}

function countNewActions(source: SyncRuntimeSnapshot, target: SyncRuntimeSnapshot): number {
  const targetKeys = new Set(target.offlineQueue.actions.map((a) => a.idempotencyKey));
  return source.offlineQueue.actions.filter((a) => !targetKeys.has(a.idempotencyKey)).length;
}
