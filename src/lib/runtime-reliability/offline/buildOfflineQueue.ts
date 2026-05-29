// ── Build Offline Queue ───────────────────────────────────────────────────────
// Creates and manages the action queue for offline-first operation.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  OfflineRuntimeQueue,
  OfflineRuntimeAction,
  OfflineActionType,
} from '@/types/runtime-reliability';

const DEVICE_ID_KEY = 'fitcoach_device_id';

/** Create a new empty offline queue. */
export function buildOfflineQueue(): OfflineRuntimeQueue {
  return {
    queueId: generateId('q'),
    deviceId: getOrCreateDeviceId(),
    actions: [],
    totalPending: 0,
    totalCompleted: 0,
    lastQueuedAt: new Date().toISOString(),
    lastReplayAt: null,
    isReplaying: false,
  };
}

/** Enqueue a new action for offline storage.
 *  Returns the updated queue — pure function.
 */
export function enqueueOfflineAction(
  queue: OfflineRuntimeQueue,
  type: OfflineActionType,
  payload: Record<string, unknown>,
  dependsOn: string[] = []
): { queue: OfflineRuntimeQueue; actionId: string } {
  const actionId = generateId('act');

  const action: OfflineRuntimeAction = {
    actionId,
    type,
    payload,
    queuedAt: new Date().toISOString(),
    retryCount: 0,
    maxRetries: 3,
    status: 'pending',
    idempotencyKey: buildIdempotencyKey(type, payload),
    dependsOn,
    error: null,
  };

  const updated: OfflineRuntimeQueue = {
    ...queue,
    actions: [...queue.actions, action],
    totalPending: queue.totalPending + 1,
    lastQueuedAt: action.queuedAt,
  };

  return { queue: updated, actionId };
}

/** Mark an action as completed and remove from pending. */
export function markActionCompleted(
  queue: OfflineRuntimeQueue,
  actionId: string
): OfflineRuntimeQueue {
  return {
    ...queue,
    actions: queue.actions.map((a) =>
      a.actionId === actionId ? { ...a, status: 'completed' } : a
    ),
    totalPending: Math.max(0, queue.totalPending - 1),
    totalCompleted: queue.totalCompleted + 1,
  };
}

/** Mark an action as failed with error message. */
export function markActionFailed(
  queue: OfflineRuntimeQueue,
  actionId: string,
  error: string
): OfflineRuntimeQueue {
  return {
    ...queue,
    actions: queue.actions.map((a) =>
      a.actionId === actionId
        ? { ...a, status: a.retryCount >= a.maxRetries ? 'failed' : 'pending', retryCount: a.retryCount + 1, error }
        : a
    ),
  };
}

/** Get all pending actions in dependency-safe order. */
export function getPendingActionsOrdered(
  queue: OfflineRuntimeQueue
): OfflineRuntimeAction[] {
  const pending = queue.actions.filter((a) => a.status === 'pending');
  return topologicalSort(pending);
}

/** Purge completed and permanently-failed actions. */
export function pruneCompletedActions(
  queue: OfflineRuntimeQueue
): OfflineRuntimeQueue {
  const keep = queue.actions.filter(
    (a) => a.status !== 'completed' && !(a.status === 'failed' && a.retryCount >= a.maxRetries)
  );
  return { ...queue, actions: keep };
}

/** Check if the offline queue has any pending actions. */
export function hasPendingActions(queue: OfflineRuntimeQueue): boolean {
  return queue.actions.some((a) => a.status === 'pending');
}

// ── Internal Helpers ──────────────────────────────────────────────────────────

function topologicalSort(actions: OfflineRuntimeAction[]): OfflineRuntimeAction[] {
  const idToAction = new Map(actions.map((a) => [a.actionId, a]));
  const visited = new Set<string>();
  const result: OfflineRuntimeAction[] = [];

  function visit(action: OfflineRuntimeAction) {
    if (visited.has(action.actionId)) return;
    visited.add(action.actionId);

    for (const depId of action.dependsOn) {
      const dep = idToAction.get(depId);
      if (dep) visit(dep);
    }
    result.push(action);
  }

  for (const action of actions) {
    visit(action);
  }
  return result;
}

function buildIdempotencyKey(type: OfflineActionType, payload: Record<string, unknown>): string {
  const relevant = JSON.stringify({ type, ...payload });
  let hash = 0;
  for (let i = 0; i < relevant.length; i++) {
    hash = (hash << 5) - hash + relevant.charCodeAt(i);
    hash |= 0;
  }
  return `${type}_${(hash >>> 0).toString(16)}`;
}

function generateId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function getOrCreateDeviceId(): string {
  const key = DEVICE_ID_KEY;
  let id = '';
  try {
    id = localStorage.getItem(key) ?? '';
    if (!id) {
      id = `dev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem(key, id);
    }
  } catch {
    id = `dev_${Math.random().toString(36).slice(2, 10)}`;
  }
  return id;
}
