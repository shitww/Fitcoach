// ─── Offline Data Access Helpers ───────────────────────────────────────────
// Thin wrapper over Dexie. All offline writes go through here.
// No business logic — just CRUD + query helpers.

import { db } from './db'
import type {
  OfflineWorkout,
  OfflineWorkoutSet,
  OfflineFoodLog,
  SyncOperation,
  OperationType,
  AppMeta,
} from './types'

// ─── UUID ─────────────────────────────────────────────────────────────────
function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// ─── Workouts ─────────────────────────────────────────────────────────────
export async function saveWorkoutLocal(
  workout: Omit<OfflineWorkout, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>,
): Promise<string> {
  const now = Date.now()
  const id = uuid()
  const record: OfflineWorkout = {
    ...workout,
    id,
    syncStatus: 'pending',
    createdAt: now,
    updatedAt: now,
  }
  await db.workouts.add(record)
  return id
}

export async function updateWorkoutLocal(
  id: string,
  patch: Partial<Omit<OfflineWorkout, 'id' | 'createdAt'>>,
): Promise<void> {
  await db.workouts.update(id, {
    ...patch,
    updatedAt: Date.now(),
    syncStatus: 'pending',
  })
}

export async function getWorkoutLocal(id: string): Promise<OfflineWorkout | undefined> {
  return db.workouts.get(id)
}

export async function getWorkoutsByUserLocal(
  userId: string,
  opts?: { fromDate?: string; toDate?: string; limit?: number },
): Promise<OfflineWorkout[]> {
  let collection = db.workouts.where('[userId+date]').between(
    [userId, opts?.fromDate ?? ''],
    [userId, opts?.toDate ?? '\uffff'],
  )
  if (opts?.limit) collection = collection.limit(opts.limit)
  return collection.reverse().sortBy('date')
}

export async function getUnsyncedWorkouts(): Promise<OfflineWorkout[]> {
  return db.workouts.where('syncStatus').equals('pending').toArray()
}

export async function markWorkoutSynced(
  localId: string,
  serverId: number,
): Promise<void> {
  await db.workouts.update(localId, {
    syncStatus: 'synced',
    serverId,
    updatedAt: Date.now(),
  })
}

// ─── Workout Sets ─────────────────────────────────────────────────────────
export async function saveSetsLocal(
  workoutId: string,
  sets: Omit<OfflineWorkoutSet, 'id' | 'workoutId' | 'createdAt' | 'syncStatus'>[],
): Promise<void> {
  const now = Date.now()
  const records: OfflineWorkoutSet[] = sets.map((s) => ({
    ...s,
    id: uuid(),
    workoutId,
    syncStatus: 'pending',
    createdAt: now,
  }))
  await db.workoutSets.bulkAdd(records)
}

export async function getSetsByWorkoutLocal(
  workoutId: string,
): Promise<OfflineWorkoutSet[]> {
  return db.workoutSets.where('workoutId').equals(workoutId).sortBy('setNumber')
}

export async function getUnsyncedSets(): Promise<OfflineWorkoutSet[]> {
  return db.workoutSets.where('syncStatus').equals('pending').toArray()
}

export async function markSetsSynced(workoutId: string): Promise<void> {
  const sets = await db.workoutSets.where('workoutId').equals(workoutId).toArray()
  await db.workoutSets.bulkUpdate(
    sets.map((s) => ({ key: s.id, changes: { syncStatus: 'synced' as const } })),
  )
}

// ─── Food Logs ────────────────────────────────────────────────────────────
export async function saveFoodLogLocal(
  log: Omit<OfflineFoodLog, 'id' | 'createdAt' | 'syncStatus'>,
): Promise<string> {
  const now = Date.now()
  const id = uuid()
  const record: OfflineFoodLog = { ...log, id, syncStatus: 'pending', createdAt: now }
  await db.foodLogs.add(record)
  return id
}

export async function getFoodLogsByUserLocal(
  userId: string,
  date: string,
): Promise<OfflineFoodLog[]> {
  return db.foodLogs.where('[userId+date]').equals([userId, date]).toArray()
}

// ─── Sync Queue ─────────────────────────────────────────────────────────────
export async function enqueueOperation(
  type: OperationType,
  localId: string,
  payload: unknown,
): Promise<number> {
  return db.syncQueue.add({
    type,
    localId,
    payload,
    createdAt: Date.now(),
    retryCount: 0,
  })
}

export async function getPendingOperations(): Promise<SyncOperation[]> {
  return db.syncQueue.orderBy('createdAt').toArray()
}

export async function markOperationComplete(id: number): Promise<void> {
  await db.syncQueue.delete(id)
}

export async function markOperationFailed(
  id: number,
  error: string,
): Promise<void> {
  const op = await db.syncQueue.get(id)
  if (!op) return
  await db.syncQueue.update(id, {
    retryCount: op.retryCount + 1,
    lastError: error,
  })
}

export async function getPendingCount(): Promise<number> {
  return db.syncQueue.count()
}

// ─── App Meta ─────────────────────────────────────────────────────────────
export async function setMeta(key: string, value: string): Promise<void> {
  await db.appMeta.put({ key, value, updatedAt: Date.now() })
}

export async function getMeta(key: string): Promise<string | undefined> {
  const row = await db.appMeta.get(key)
  return row?.value
}

// ─── Danger Zone ──────────────────────────────────────────────────────────
export async function clearAllLocalData(): Promise<void> {
  await Promise.all([
    db.workouts.clear(),
    db.workoutSets.clear(),
    db.foodLogs.clear(),
    db.syncQueue.clear(),
  ])
}
