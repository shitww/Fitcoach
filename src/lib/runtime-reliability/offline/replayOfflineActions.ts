// ── Replay Offline Actions ────────────────────────────────────────────────────
// Replays queued offline actions when connectivity is restored.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  OfflineRuntimeQueue,
  OfflineRuntimeAction,
} from '@/types/runtime-reliability';
import {
  markActionCompleted,
  markActionFailed,
  getPendingActionsOrdered,
  pruneCompletedActions,
} from './buildOfflineQueue';

export interface ActionReplayHandler {
  type: OfflineRuntimeAction['type'];
  handler: (payload: Record<string, unknown>) => Promise<void>;
}

export interface ReplayResult {
  replayed: number;
  failed: number;
  skipped: number;
  queue: OfflineRuntimeQueue;
  errors: string[];
}

/** Replay all pending offline actions in dependency order.
 *  Actions are replayed with idempotency protection.
 *  Returns updated queue state.
 */
export async function replayOfflineActions(
  queue: OfflineRuntimeQueue,
  handlers: readonly ActionReplayHandler[]
): Promise<ReplayResult> {
  const ordered = getPendingActionsOrdered(queue);
  const handlerMap = new Map(handlers.map((h) => [h.type, h.handler]));
  const seenIdempotencyKeys = new Set<string>();
  const errors: string[] = [];

  let current = { ...queue, isReplaying: true };
  let replayed = 0;
  let failed = 0;
  let skipped = 0;

  for (const action of ordered) {
    // Skip duplicate idempotency keys
    if (seenIdempotencyKeys.has(action.idempotencyKey)) {
      current = { ...current, actions: current.actions.map((a) =>
        a.actionId === action.actionId ? { ...a, status: 'superseded' } : a
      )};
      skipped++;
      continue;
    }

    const handler = handlerMap.get(action.type);
    if (!handler) {
      failed++;
      errors.push(`No handler for action type: ${action.type}`);
      current = markActionFailed(current, action.actionId, `No handler for ${action.type}`);
      continue;
    }

    try {
      await handler(action.payload);
      seenIdempotencyKeys.add(action.idempotencyKey);
      current = markActionCompleted(current, action.actionId);
      replayed++;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`Action ${action.actionId} failed: ${errorMsg}`);
      current = markActionFailed(current, action.actionId, errorMsg);
      failed++;
    }
  }

  current = { ...pruneCompletedActions(current), isReplaying: false, lastReplayAt: new Date().toISOString() };

  return { replayed, failed, skipped, queue: current, errors };
}

/** Check if the device currently has network access. */
export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

/** Register a network status change listener. */
export function onNetworkChange(callback: (online: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const onOnline = () => callback(true);
  const onOffline = () => callback(false);

  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
}
