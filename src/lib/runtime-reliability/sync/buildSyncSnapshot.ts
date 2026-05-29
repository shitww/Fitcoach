// ── Build Sync Snapshot ───────────────────────────────────────────────────────
// Packages runtime state into a portable sync-ready format.
// Architecture-ready for future multi-device sync — no live server required yet.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  SyncRuntimeSnapshot,
  OfflineRuntimeQueue,
  RuntimeSnapshot,
} from '@/types/runtime-reliability';
import { loadOfflineQueue } from '../offline/persistOfflineActions';
import { restoreRuntimeState } from '../persistence/restoreRuntimeState';

const SYNC_VERSION_KEY = 'fitcoach_sync_version';
const DEVICE_ID_KEY = 'fitcoach_device_id';

/** Build a sync snapshot from current runtime state.
 *  Can be serialized and transmitted to any future sync endpoint.
 */
export function buildSyncSnapshot(): SyncRuntimeSnapshot {
  const { snapshot: runtimeSnapshot } = restoreRuntimeState();
  const offlineQueue = loadOfflineQueue() ?? buildEmptyQueue();
  const deviceId = getDeviceId();
  const syncVersion = incrementSyncVersion();

  const checksum = computeBehaviorChecksum();

  return {
    deviceId,
    syncVersion,
    syncSchemaVersion: 1,
    lastSyncAt: null,
    runtimeSnapshot: runtimeSnapshot ?? buildFallbackSnapshot(),
    offlineQueue,
    conflictResolutions: [],
    behaviorMemoryChecksum: checksum,
  };
}

/** Mark the sync as completed and record the timestamp. */
export function markSyncCompleted(snapshot: SyncRuntimeSnapshot): SyncRuntimeSnapshot {
  return {
    ...snapshot,
    lastSyncAt: new Date().toISOString(),
  };
}

/** Check if two sync snapshots are from the same device. */
export function isSameDevice(a: SyncRuntimeSnapshot, b: SyncRuntimeSnapshot): boolean {
  return a.deviceId === b.deviceId;
}

/** Determine which snapshot is more recent. */
export function selectNewerSnapshot(
  local: SyncRuntimeSnapshot,
  remote: SyncRuntimeSnapshot
): SyncRuntimeSnapshot {
  const localTs = local.runtimeSnapshot?.createdAt ?? '';
  const remoteTs = remote.runtimeSnapshot?.createdAt ?? '';
  return localTs >= remoteTs ? local : remote;
}

// ── Internal Helpers ──────────────────────────────────────────────────────────

function getDeviceId(): string {
  try {
    return localStorage.getItem(DEVICE_ID_KEY) ?? 'unknown_device';
  } catch {
    return 'unknown_device';
  }
}

function incrementSyncVersion(): number {
  try {
    const current = parseInt(localStorage.getItem(SYNC_VERSION_KEY) ?? '0', 10);
    const next = current + 1;
    localStorage.setItem(SYNC_VERSION_KEY, next.toString());
    return next;
  } catch {
    return 0;
  }
}

function computeBehaviorChecksum(): string {
  try {
    const keys = Object.keys(localStorage).filter((k) => k.startsWith('fitcoach_'));
    const combined = keys.sort().map((k) => `${k}:${(localStorage.getItem(k) ?? '').length}`).join('|');
    let hash = 0;
    for (let i = 0; i < combined.length; i++) {
      hash = (hash << 5) - hash + combined.charCodeAt(i);
      hash |= 0;
    }
    return (hash >>> 0).toString(16);
  } catch {
    return '00000000';
  }
}

function buildEmptyQueue(): OfflineRuntimeQueue {
  return {
    queueId: '',
    deviceId: getDeviceId(),
    actions: [],
    totalPending: 0,
    totalCompleted: 0,
    lastQueuedAt: new Date().toISOString(),
    lastReplayAt: null,
    isReplaying: false,
  };
}

function buildFallbackSnapshot(): RuntimeSnapshot {
  return {
    snapshotId: 'fallback',
    version: 1,
    runtimeVersion: '0.0.0',
    createdAt: new Date().toISOString(),
    sessionState: null,
    recoveryState: null,
    pendingInputs: [],
    checksum: '00000000',
  };
}
