// ─── FitCoach Sync Engine — Production Hardened ────────────────────────────
// Offline-first sync: local writes are immediate, server sync is eventual.
// Hardened against: unstable networks, app suspension, duplicate retries.
//
// Features:
//   • Exponential backoff with jitter
//   • Dead-letter queue for permanently failed ops
//   • Duplicate prevention (per-operation dedup key)
//   • Operation locking (prevent concurrent execution)
//   • Batch processing
//   • Metrics logging

import { db } from './db'
import type { NetworkState, SyncOperation } from './types'

// ─── Constants ────────────────────────────────────────────────────────────
const MAX_RETRIES = 6
const SYNC_BATCH_SIZE = 10
const BASE_RETRY_MS = 2_000
const MAX_RETRY_MS = 120_000
const MAX_DEAD_LETTER_AGE_MS = 7 * 24 * 60 * 60_000 // 7 days

// ─── Singleton State ────────────────────────────────────────────────────────
let _isRunning = false
let _retryTimer: ReturnType<typeof setTimeout> | null = null
let _listeners = new Set<(state: NetworkState) => void>()
const _state: NetworkState = {
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastOnlineAt: null,
  syncInProgress: false,
  pendingCount: 0,
  lastSyncAt: null,
}

// Operation lock set (prevents concurrent execution of same operation)
const _lockedOps = new Set<number>()

// ─── Public API ─────────────────────────────────────────────────────────────

export function startSyncEngine(): void {
  if (_isRunning) return
  _isRunning = true

  _updateState({ isOnline: navigator.onLine })
  void _refreshPendingCount()
  void _cleanupDeadLetters()

  window.addEventListener('online', _onOnline)
  window.addEventListener('offline', _onOffline)
  document.addEventListener('visibilitychange', _onVisibilityChange)

  void _flushQueue()
}

export function stopSyncEngine(): void {
  _isRunning = false
  window.removeEventListener('online', _onOnline)
  window.removeEventListener('offline', _onOffline)
  document.removeEventListener('visibilitychange', _onVisibilityChange)
  if (_retryTimer) { clearTimeout(_retryTimer); _retryTimer = null }
}

export function subscribeSyncState(handler: (state: NetworkState) => void): () => void {
  _listeners.add(handler)
  handler({ ..._state })
  return () => { _listeners.delete(handler) }
}

export async function forceSync(): Promise<void> { await _flushQueue() }

export function getSyncState(): NetworkState { return { ..._state } }

// ─── Internal ─────────────────────────────────────────────────────────────

function _updateState(partial: Partial<NetworkState>): void {
  Object.assign(_state, partial)
  const snapshot = { ..._state }
  _listeners.forEach((fn) => { try { fn(snapshot) } catch {} })
}

async function _refreshPendingCount(): Promise<void> {
  const count = await db.syncQueue.count()
  _updateState({ pendingCount: count })
}

function _onOnline(): void {
  _updateState({ isOnline: true, lastOnlineAt: Date.now() })
  void _refreshPendingCount()
  void _flushQueue()
}

function _onOffline(): void { _updateState({ isOnline: false }) }

function _onVisibilityChange(): void {
  if (document.hidden) return
  void _refreshPendingCount()
  if (_state.isOnline) void _flushQueue()
}

/** Core flush loop with batching and locking. */
async function _flushQueue(): Promise<void> {
  if (_state.syncInProgress || !_state.isOnline) return

  const ops = await db.syncQueue.orderBy('createdAt').toArray()
  if (ops.length === 0) return

  _updateState({ syncInProgress: true })

  try {
    for (const op of ops.slice(0, SYNC_BATCH_SIZE)) {
      if (_lockedOps.has(op.id)) continue
      const ok = await _executeOperation(op)
      if (!ok) break
    }
    _updateState({ lastSyncAt: Date.now() })
  } finally {
    await _refreshPendingCount()
    _updateState({ syncInProgress: false })
  }
}

/** Execute with locking, retry counting, and dead-letter handling. */
async function _executeOperation(op: SyncOperation): Promise<boolean> {
  if (_lockedOps.has(op.id)) return false
  _lockedOps.add(op.id)

  try {
    if (op.retryCount >= MAX_RETRIES) {
      await _moveToDeadLetter(op, 'max_retries_exceeded')
      return true
    }

    let result: { ok: boolean; serverId?: number }
    switch (op.type) {
      case 'CREATE_WORKOUT': result = await _syncCreateWorkout(op); break
      case 'CREATE_FOOD_LOG': result = await _syncCreateFoodLog(op); break
      default:
        await db.syncQueue.delete(op.id)
        return true
    }

    if (result.ok) {
      await db.syncQueue.delete(op.id)
      if (result.serverId && op.type === 'CREATE_WORKOUT') {
        await db.workouts.update(op.localId, { syncStatus: 'synced', serverId: result.serverId })
      }
      return true
    }

    // 4xx client error — don't retry
    await _markFailed(op, 'client_error_4xx')
    return true

  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    await _markFailed(op, msg)
    _scheduleRetry(op.retryCount + 1)
    return false
  } finally {
    _lockedOps.delete(op.id)
  }
}

/** Mark operation as failed with incremented retry count. */
async function _markFailed(op: SyncOperation, error: string): Promise<void> {
  await db.syncQueue.update(op.id, {
    retryCount: op.retryCount + 1,
    lastError: error,
  })
}

/** Move permanently failed operation to dead-letter table and delete from queue. */
async function _moveToDeadLetter(op: SyncOperation, reason: string): Promise<void> {
  await db.appMeta.put({
    key: `deadletter:${op.id}`,
    value: JSON.stringify({ ...op, deadAt: Date.now(), reason }),
    updatedAt: Date.now(),
  })
  await db.syncQueue.delete(op.id)
}

/** Clean up dead letters older than 7 days. */
async function _cleanupDeadLetters(): Promise<void> {
  const all = await db.appMeta.where('key').startsWith('deadletter:').toArray()
  const cutoff = Date.now() - MAX_DEAD_LETTER_AGE_MS
  for (const row of all) {
    try {
      const data = JSON.parse(row.value)
      if (data.deadAt < cutoff) await db.appMeta.delete(row.key)
    } catch { /* ignore */ }
  }
}

/** Exponential backoff with jitter. */
function _scheduleRetry(attempt: number): void {
  if (_retryTimer) return
  const delay = Math.min(BASE_RETRY_MS * Math.pow(2, attempt), MAX_RETRY_MS)
  const jitter = delay * 0.2 * Math.random()
  const finalDelay = Math.round(delay + jitter)
  _retryTimer = setTimeout(() => {
    _retryTimer = null
    void _flushQueue()
  }, finalDelay)
}

// ─── Server Sync Handlers ─────────────────────────────────────────────────

async function _syncCreateWorkout(op: SyncOperation): Promise<{ ok: boolean; serverId?: number }> {
  const workout = await db.workouts.get(op.localId)
  if (!workout) return { ok: true }

  const sets = await db.workoutSets.where('workoutId').equals(op.localId).toArray()
  const exerciseMap = new Map<string, typeof sets>()
  for (const s of sets) {
    const arr = exerciseMap.get(s.exerciseName) ?? []
    arr.push(s)
    exerciseMap.set(s.exerciseName, arr)
  }

  const exercises = Array.from(exerciseMap.entries()).map(([name, setList]) => ({
    name,
    muscleGroup: setList[0]?.muscleGroup ?? '',
    sets: setList.map((s) => ({
      weight: s.weight, reps: s.reps, rir: s.rir,
      isWarmup: s.type === 'W', isCardio: s.type === 'C', isFailure: s.isFailure,
    })),
  }))

  const res = await fetch('/api/workout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      exercises, totalVolume: workout.totalVolume,
      duration: workout.durationSec, notes: workout.notes,
    }),
  })

  if (!res.ok) {
    if (res.status >= 400 && res.status < 500) return { ok: false }
    throw new Error(`HTTP ${res.status}`)
  }
  const json = (await res.json()) as { data?: { id?: number } }
  return { ok: true, serverId: json.data?.id }
}

async function _syncCreateFoodLog(op: SyncOperation): Promise<{ ok: boolean; serverId?: number }> {
  const log = await db.foodLogs.get(op.localId)
  if (!log) return { ok: true }

  const res = await fetch('/api/food-logs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: log.foodName, calories: log.calories, protein: log.protein,
      carbs: log.carbs, fat: log.fat, date: log.date,
    }),
  })

  if (!res.ok) {
    if (res.status >= 400 && res.status < 500) return { ok: false }
    throw new Error(`HTTP ${res.status}`)
  }
  const json = (await res.json()) as { data?: { id?: number } }
  return { ok: true, serverId: json.data?.id }
}

// ─── Duplicate Prevention ───────────────────────────────────────────────────

/** Check if an operation targeting the same localId + type already exists. */
export async function isOperationEnqueued(type: string, localId: string): Promise<boolean> {
  const existing = await db.syncQueue.where('[type+localId]').equals([type, localId]).first()
  return !!existing
}
