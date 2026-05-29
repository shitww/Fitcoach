// ── Resolve Runtime Conflicts ─────────────────────────────────────────────────
// Deterministic conflict resolution for cross-device sync merges.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  RuntimeConflictResolution,
  SyncRuntimeSnapshot,
} from '@/types/runtime-reliability';

export interface ConflictCandidate {
  field: string;
  localValue: unknown;
  remoteValue: unknown;
  localTimestamp: string;
  remoteTimestamp: string;
  localChecksum: string;
  remoteChecksum: string;
}

/** Resolve a conflict between two versions of a runtime field.
 *  Always deterministic: same inputs → same resolution.
 */
export function resolveRuntimeConflict(
  candidate: ConflictCandidate
): RuntimeConflictResolution {
  const { field, localTimestamp, remoteTimestamp, localValue, remoteValue } = candidate;

  // Identical values — no actual conflict
  if (candidate.localChecksum === candidate.remoteChecksum) {
    return {
      conflictId: generateId(),
      field,
      type: 'merge',
      localTimestamp,
      remoteTimestamp,
      localChecksum: candidate.localChecksum,
      remoteChecksum: candidate.remoteChecksum,
      resolvedValue: localValue,
      resolvedAt: new Date().toISOString(),
      reasoning: 'Values identical — no conflict',
    };
  }

  // Session state: more recent wins
  if (field === 'sessionState' || field === 'recoveryState') {
    const localIsNewer = localTimestamp >= remoteTimestamp;
    return {
      conflictId: generateId(),
      field,
      type: 'last_write_wins',
      localTimestamp,
      remoteTimestamp,
      localChecksum: candidate.localChecksum,
      remoteChecksum: candidate.remoteChecksum,
      resolvedValue: localIsNewer ? localValue : remoteValue,
      resolvedAt: new Date().toISOString(),
      reasoning: `Last write wins: ${localIsNewer ? 'local' : 'remote'} (${localIsNewer ? localTimestamp : remoteTimestamp})`,
    };
  }

  // Pending inputs: merge (keep all unique)
  if (field === 'pendingInputs') {
    const local = Array.isArray(localValue) ? localValue : [];
    const remote = Array.isArray(remoteValue) ? remoteValue : [];
    const merged = mergeByIdField(local, remote, 'id');
    return {
      conflictId: generateId(),
      field,
      type: 'merge',
      localTimestamp,
      remoteTimestamp,
      localChecksum: candidate.localChecksum,
      remoteChecksum: candidate.remoteChecksum,
      resolvedValue: merged,
      resolvedAt: new Date().toISOString(),
      reasoning: `Merged ${local.length} local + ${remote.length} remote pending inputs`,
    };
  }

  // Default: last write wins
  const localWins = localTimestamp >= remoteTimestamp;
  return {
    conflictId: generateId(),
    field,
    type: localWins ? 'local_wins' : 'remote_wins',
    localTimestamp,
    remoteTimestamp,
    localChecksum: candidate.localChecksum,
    remoteChecksum: candidate.remoteChecksum,
    resolvedValue: localWins ? localValue : remoteValue,
    resolvedAt: new Date().toISOString(),
    reasoning: `Default last-write-wins: ${localWins ? 'local' : 'remote'}`,
  };
}

/** Detect conflicts between two sync snapshots. */
export function detectConflicts(
  local: SyncRuntimeSnapshot,
  remote: SyncRuntimeSnapshot
): ConflictCandidate[] {
  const conflicts: ConflictCandidate[] = [];

  const fields = ['sessionState', 'recoveryState', 'pendingInputs'] as const;

  for (const field of fields) {
    const localSnap = local.runtimeSnapshot;
    const remoteSnap = remote.runtimeSnapshot;

    if (!localSnap || !remoteSnap) continue;

    const lv = (localSnap as unknown as Record<string, unknown>)[field];
    const rv = (remoteSnap as unknown as Record<string, unknown>)[field];

    const lHash = computeHash(lv);
    const rHash = computeHash(rv);

    if (lHash !== rHash) {
      conflicts.push({
        field,
        localValue: lv,
        remoteValue: rv,
        localTimestamp: localSnap.createdAt,
        remoteTimestamp: remoteSnap.createdAt,
        localChecksum: lHash,
        remoteChecksum: rHash,
      });
    }
  }

  return conflicts;
}

function mergeByIdField(a: unknown[], b: unknown[], idField: string): unknown[] {
  const seen = new Set<unknown>();
  const merged: unknown[] = [];
  for (const item of [...a, ...b]) {
    const id = (item as Record<string, unknown>)[idField];
    if (!seen.has(id)) {
      seen.add(id);
      merged.push(item);
    }
  }
  return merged;
}

function computeHash(value: unknown): string {
  const str = JSON.stringify(value);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return (hash >>> 0).toString(16);
}

function generateId(): string {
  return `cfl_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}
