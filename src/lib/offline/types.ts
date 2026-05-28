// ─── FitCoach Offline-First Type System ────────────────────────────────────
// Every type here mirrors server schema but adds offline fields.
// These are the ONLY types the offline layer exports.

// ─── Sync Status ───────────────────────────────────────────────────────────
export type SyncStatus = 'pending' | 'synced' | 'conflict' | 'failed'

// ─── Workout (local-first) ────────────────────────────────────────────────
export interface OfflineWorkout {
  /** Local UUID generated on device. Always stable across syncs. */
  id: string
  userId: string
  date: string // ISO date string YYYY-MM-DD
  durationSec: number
  totalVolume: number
  notes: string | null
  /** 'strength' | 'cardio' | 'recovery' | 'free' */
  type: string
  syncStatus: SyncStatus
  /** Filled after successful server sync */
  serverId?: number
  createdAt: number // epoch ms
  updatedAt: number // epoch ms
}

// ─── Workout Set (local-first) ────────────────────────────────────────────
export interface OfflineWorkoutSet {
  id: string
  workoutId: string // FK → OfflineWorkout.id
  exerciseName: string
  exerciseId?: string
  muscleGroup: string
  weight: number
  reps: number
  rir: number
  setNumber: number
  /** 'W' = warmup, 'S' = working, 'C' = cardio */
  type: 'W' | 'S' | 'C'
  isFailure: boolean
  isPR: boolean
  syncStatus: SyncStatus
  createdAt: number
}

// ─── Food Log (local-first) ───────────────────────────────────────────────
export interface OfflineFoodLog {
  id: string
  userId: string
  date: string // ISO date
  foodName: string
  calories: number
  protein: number
  carbs: number
  fat: number
  syncStatus: SyncStatus
  serverId?: number
  createdAt: number
}

// ─── Sync Operation Queue ───────────────────────────────────────────────────
export type OperationType =
  | 'CREATE_WORKOUT'
  | 'UPDATE_WORKOUT'
  | 'DELETE_WORKOUT'
  | 'CREATE_FOOD_LOG'
  | 'UPDATE_DASHBOARD'

export interface SyncOperation {
  /** Auto-increment primary key */
  id: number
  type: OperationType
  /** Local entity ID this operation targets */
  localId: string
  /** Full payload to send to server */
  payload: unknown
  createdAt: number
  retryCount: number
  lastError?: string
}

// ─── App Meta (offline version tracking) ──────────────────────────────────
export interface AppMeta {
  key: string
  value: string
  updatedAt: number
}

// ─── Network Status ───────────────────────────────────────────────────────
export interface NetworkState {
  isOnline: boolean
  lastOnlineAt: number | null
  syncInProgress: boolean
  pendingCount: number
  lastSyncAt: number | null
}
