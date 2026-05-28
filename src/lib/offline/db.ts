import Dexie, { type EntityTable } from 'dexie'
import type {
  OfflineWorkout,
  OfflineWorkoutSet,
  OfflineFoodLog,
  SyncOperation,
  AppMeta,
} from './types'

const DB_NAME = 'FitCoachOffline'

// ─── Typed Dexie instance ─────────────────────────────────────────────────
const db = new Dexie(DB_NAME) as Dexie & {
  workouts: EntityTable<OfflineWorkout, 'id'>
  workoutSets: EntityTable<OfflineWorkoutSet, 'id'>
  foodLogs: EntityTable<OfflineFoodLog, 'id'>
  syncQueue: EntityTable<SyncOperation, 'id'>
  appMeta: EntityTable<AppMeta, 'key'>
}

// ─── Version 1 schema (legacy — kept for migration path) ──────────────────
db.version(1).stores({
  workouts: 'id, [userId+date], syncStatus, [syncStatus+updatedAt]',
  workoutSets: 'id, workoutId, [workoutId+setNumber]',
  foodLogs: 'id, [userId+date], syncStatus',
  syncQueue: '++id, createdAt, [type+localId]',
  dashboardCache: 'userId, fetchedAt',
  historyCache: 'id, [userId+date]',
  exerciseCache: 'id, muscleGroup, isCommon',
  appMeta: 'key',
})

// ─── Version 2 — drop unused offline cache tables ─────────────────────────
db.version(2).stores({
  dashboardCache: null,
  historyCache: null,
  exerciseCache: null,
})

// ─── Singleton export ─────────────────────────────────────────────────────
export { db }

// ─── Debug helper (dev only) ──────────────────────────────────────────────
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  ;(window as unknown as Record<string, unknown>).__fitcoachDb = db
}
