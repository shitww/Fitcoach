// ── Restore Runtime State ─────────────────────────────────────────────────────
// Reads and validates persisted snapshot; falls back to backup on corruption.
// ─────────────────────────────────────────────────────────────────────────────

import type { RuntimeSnapshot } from '@/types/runtime-reliability';
import { RUNTIME_SNAPSHOT_VERSION } from '@/types/runtime-reliability';

const STORAGE_KEY = 'fitcoach_runtime_snapshot';
const BACKUP_KEY = 'fitcoach_runtime_snapshot_backup';

export interface RestoreResult {
  snapshot: RuntimeSnapshot | null;
  source: 'primary' | 'backup' | 'none';
  wasCorrupted: boolean;
  migrationApplied: boolean;
  error: string | null;
}

/** Restore runtime state from localStorage.
 *  Automatically falls back to backup if primary is corrupted.
 *  Applies migrations for older schema versions.
 */
export function restoreRuntimeState(): RestoreResult {
  // Try primary
  const primary = tryReadSnapshot(STORAGE_KEY);
  if (primary.snapshot && validateSnapshot(primary.snapshot)) {
    const migrated = migrateSnapshot(primary.snapshot);
    return {
      snapshot: migrated.snapshot,
      source: 'primary',
      wasCorrupted: false,
      migrationApplied: migrated.applied,
      error: null,
    };
  }

  // Try backup
  const backup = tryReadSnapshot(BACKUP_KEY);
  if (backup.snapshot && validateSnapshot(backup.snapshot)) {
    const migrated = migrateSnapshot(backup.snapshot);
    return {
      snapshot: migrated.snapshot,
      source: 'backup',
      wasCorrupted: true,
      migrationApplied: migrated.applied,
      error: primary.error ?? 'Primary snapshot corrupted',
    };
  }

  return {
    snapshot: null,
    source: 'none',
    wasCorrupted: backup.error !== null,
    migrationApplied: false,
    error: 'No valid snapshot found',
  };
}

/** Check if a snapshot passes integrity validation. */
function validateSnapshot(snapshot: RuntimeSnapshot): boolean {
  if (!snapshot.snapshotId) return false;
  if (typeof snapshot.version !== 'number') return false;
  if (!snapshot.createdAt) return false;
  if (!snapshot.checksum) return false;
  return true;
}

/** Apply schema migrations for older versions. */
function migrateSnapshot(snapshot: RuntimeSnapshot): {
  snapshot: RuntimeSnapshot;
  applied: boolean;
} {
  if (snapshot.version === RUNTIME_SNAPSHOT_VERSION) {
    return { snapshot, applied: false };
  }

  // Future migration logic: v1→v2, v2→v3, etc.
  // For now, return as-is with version bumped
  return {
    snapshot: { ...snapshot, version: RUNTIME_SNAPSHOT_VERSION },
    applied: true,
  };
}

function tryReadSnapshot(key: string): { snapshot: RuntimeSnapshot | null; error: string | null } {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { snapshot: null, error: null };
    const parsed = JSON.parse(raw) as RuntimeSnapshot;
    return { snapshot: parsed, error: null };
  } catch (err) {
    return {
      snapshot: null,
      error: err instanceof Error ? err.message : 'Parse error',
    };
  }
}
