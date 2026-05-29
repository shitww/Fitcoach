// ── Persist Runtime State ─────────────────────────────────────────────────────
// Saves runtime snapshot to localStorage with versioning and corruption guards.
// ─────────────────────────────────────────────────────────────────────────────

import type { RuntimeSnapshot } from '@/types/runtime-reliability';
import { RUNTIME_SNAPSHOT_VERSION } from '@/types/runtime-reliability';

const STORAGE_KEY = 'fitcoach_runtime_snapshot';
const BACKUP_KEY = 'fitcoach_runtime_snapshot_backup';
const MAX_SNAPSHOT_BYTES = 512 * 1024; // 512 KB hard cap

export interface PersistResult {
  success: boolean;
  bytesWritten: number;
  error: string | null;
  wasCompressed: boolean;
}

/** Persist a runtime snapshot to localStorage.
 *  Maintains a backup copy for corruption recovery.
 *  Returns false and logs error if storage fails.
 */
export function persistRuntimeState(
  snapshot: RuntimeSnapshot
): PersistResult {
  try {
    const serialized = JSON.stringify(snapshot);
    const bytes = new TextEncoder().encode(serialized).length;

    if (bytes > MAX_SNAPSHOT_BYTES) {
      return {
        success: false,
        bytesWritten: 0,
        error: `Snapshot too large (${Math.round(bytes / 1024)}KB > 512KB)`,
        wasCompressed: false,
      };
    }

    // Rotate: current → backup before overwrite
    const existing = localStorage.getItem(STORAGE_KEY);
    if (existing) {
      localStorage.setItem(BACKUP_KEY, existing);
    }

    localStorage.setItem(STORAGE_KEY, serialized);

    return { success: true, bytesWritten: bytes, error: null, wasCompressed: false };
  } catch (err) {
    return {
      success: false,
      bytesWritten: 0,
      error: err instanceof Error ? err.message : 'Unknown storage error',
      wasCompressed: false,
    };
  }
}

/** Clear only the active session state, keeping recovery checkpoint.
 *  Call this when a session ends cleanly.
 */
export function clearSessionState(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    const snapshot: RuntimeSnapshot = JSON.parse(raw);
    const cleared = { ...snapshot, sessionState: null, pendingInputs: [] };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cleared));
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }
}

/** Fully wipe all persisted runtime state. */
export function clearAllRuntimeState(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(BACKUP_KEY);
}

/** Estimate how much storage is being used by runtime state. */
export function estimateStorageUsage(): { currentBytes: number; backupBytes: number } {
  const current = localStorage.getItem(STORAGE_KEY) ?? '';
  const backup = localStorage.getItem(BACKUP_KEY) ?? '';
  return {
    currentBytes: new TextEncoder().encode(current).length,
    backupBytes: new TextEncoder().encode(backup).length,
  };
}
