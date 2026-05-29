// ── Persist Offline Actions ───────────────────────────────────────────────────
// Saves the offline action queue to localStorage between sessions.
// ─────────────────────────────────────────────────────────────────────────────

import type { OfflineRuntimeQueue } from '@/types/runtime-reliability';

const QUEUE_STORAGE_KEY = 'fitcoach_offline_queue';
const MAX_QUEUE_BYTES = 256 * 1024; // 256 KB

export interface QueuePersistResult {
  success: boolean;
  actionCount: number;
  bytesWritten: number;
  error: string | null;
}

/** Save the offline queue to localStorage. */
export function persistOfflineQueue(queue: OfflineRuntimeQueue): QueuePersistResult {
  try {
    const serialized = JSON.stringify(queue);
    const bytes = new TextEncoder().encode(serialized).length;

    if (bytes > MAX_QUEUE_BYTES) {
      return {
        success: false,
        actionCount: 0,
        bytesWritten: 0,
        error: `Queue too large (${Math.round(bytes / 1024)}KB > 256KB)`,
      };
    }

    localStorage.setItem(QUEUE_STORAGE_KEY, serialized);
    return { success: true, actionCount: queue.actions.length, bytesWritten: bytes, error: null };
  } catch (err) {
    return {
      success: false,
      actionCount: 0,
      bytesWritten: 0,
      error: err instanceof Error ? err.message : 'Storage error',
    };
  }
}

/** Load the offline queue from localStorage. */
export function loadOfflineQueue(): OfflineRuntimeQueue | null {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OfflineRuntimeQueue;
  } catch {
    return null;
  }
}

/** Clear the offline queue after successful sync. */
export function clearOfflineQueue(): void {
  localStorage.removeItem(QUEUE_STORAGE_KEY);
}

/** Get the number of pending offline actions without loading full queue. */
export function getPendingActionCount(): number {
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!raw) return 0;
    const queue = JSON.parse(raw) as OfflineRuntimeQueue;
    return queue.actions.filter((a) => a.status === 'pending').length;
  } catch {
    return 0;
  }
}
