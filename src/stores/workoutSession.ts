import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logAndEmit, getCurrentSessionId } from '@/lib/workout/eventLog';

// ── Types ───────────────────────────────────────────────────────────────────

export interface SessionSet {
  id: string;
  weight: number;
  reps: number;
  rir: number | null;
  isBodyweight: boolean;
  isFailure: boolean;
  estimated1RM: number;
  completed: boolean;
  isWarmup?: boolean;
  createdAt: number;
}

export interface SessionExercise {
  id: string;
  name: string;
  sets: SessionSet[];
  restTime: number;
  totalVolume: number;
  startedAt?: string;
}

export type PRType = 'weight' | 'reps' | 'volume';

export interface PRResult {
  type: PRType;
  display: string;
}

export interface LastRecord {
  weight: number;
  reps: number;
  date: string;
}

// ── State ─────────────────────────────────────────────────────────────────────

interface WorkoutSessionState {
  // Identity (for user-isolation on rehydrate)
  storedUserId: string | null;

  // Session data
  exercises: SessionExercise[];
  activeExerciseName: string;
  savedExercises: string[];
  customExercises: string[];
  trainingNotes: string;
  lastExerciseRecord: LastRecord | null;

  // Current set inputs (UI state — ephemeral but persisted for crash recovery)
  weight: string;
  reps: string;
  rir: string;
  restTime: string;
  isBodyweight: boolean;

  // Feedback / PR
  prResult: PRResult | null;
  setFeedback: string | null;

  // Offline
  pendingWorkout: { exercises: SessionExercise[]; trainingNotes: string; trainingDuration: number } | null;

  // ── Actions ──────────────────────────────────────────────────────────────────
  setStoredUserId: (userId: string | null) => void;
  setActiveExercise: (name: string) => void;
  addSavedExercise: (name: string) => void;
  removeSavedExercise: (name: string) => void;
  addCustomExercise: (name: string) => void;
  setLastExerciseRecord: (record: LastRecord | null) => void;

  updateInput: (field: 'weight' | 'reps' | 'rir' | 'restTime', value: string) => void;
  toggleBodyweight: () => void;

  /** Log a completed set for the current active exercise. */
  logSet: () => { ok: true; feedback: string; pr: PRResult | null } | { ok: false; error: string };

  /** Copy the last completed set of the active exercise into inputs. */
  copyLastSet: () => boolean;

  /** Reset inputs to defaults (e.g. after exercise change). */
  resetInputs: (opts?: { weight?: string; reps?: string; rir?: string; restTime?: string; isBodyweight?: boolean }) => void;

  /** Set training notes. */
  setTrainingNotes: (notes: string) => void;

  /** Clear the entire session (done / cancelled). */
  clearSession: () => void;

  /** Restore from a hydration snapshot (page reload). */
  restoreSnapshot: (snapshot: Partial<Pick<WorkoutSessionState, 'exercises' | 'activeExerciseName' | 'weight' | 'reps' | 'rir' | 'restTime' | 'isBodyweight' | 'trainingNotes' | 'savedExercises' | 'customExercises'>>) => void;

  /** Detect PR against history (current session + last DB record). */
  detectPR: (lastRecord?: LastRecord | null) => PRResult | null;

  /** Set pending workout for offline retry. */
  setPendingWorkout: (payload: WorkoutSessionState['pendingWorkout']) => void;
  clearPendingWorkout: () => void;

  /** Clear PR and feedback after display. */
  clearFeedback: () => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function detectPRInternal(
  currentSets: SessionSet[],
  lastRecord: LastRecord | null,
  weight: number,
  reps: number,
  isBodyweight: boolean
): PRResult | null {
  if (isBodyweight || weight <= 0 || reps <= 0) return null;
  const allSets = [
    ...currentSets.filter(s => !s.isWarmup && s.completed),
    ...(lastRecord ? [{ weight: lastRecord.weight, reps: lastRecord.reps, id: 'db' }] : []),
  ];
  if (allSets.length === 0) return null;
  const maxWeight = Math.max(...allSets.map(s => s.weight));
  const maxVolume = Math.max(...allSets.map(s => s.weight * s.reps));
  const vol = weight * reps;
  if (weight > maxWeight) {
    return { type: 'weight', display: `${weight}kg` };
  }
  if (vol > maxVolume) {
    return { type: 'volume', display: `${vol}kg` };
  }
  const sameWeight = allSets.filter(s => s.weight === weight);
  if (sameWeight.length > 0) {
    const maxReps = Math.max(...sameWeight.map(s => s.reps));
    if (reps > maxReps) {
      return { type: 'reps', display: `${reps}次` };
    }
  }
  return null;
}

// ── Store ───────────────────────────────────────────────────────────────────────

export const useWorkoutSession = create<WorkoutSessionState>()(
  persist(
    (set, get) => ({
      // Initial state
      storedUserId: null,
      exercises: [],
      activeExerciseName: '',
      savedExercises: [],
      customExercises: [],
      trainingNotes: '',
      lastExerciseRecord: null,
      weight: '',
      reps: '',
      rir: '1',
      restTime: '90',
      isBodyweight: false,
      prResult: null,
      setFeedback: null,
      pendingWorkout: null,

      setStoredUserId: (userId) => set({ storedUserId: userId }),

      setActiveExercise: (name) => {
        set({ activeExerciseName: name });
        const sessionId = getCurrentSessionId();
        if (sessionId && name) {
          logAndEmit({ type: 'EXERCISE_CHANGED', ts: Date.now(), payload: { name } }, sessionId);
        }
      },

      addSavedExercise: (name) =>
        set((state) => {
          if (state.savedExercises.includes(name)) return state;
          return { savedExercises: [name, ...state.savedExercises].slice(0, 10) };
        }),

      removeSavedExercise: (name) =>
        set((state) => ({
          savedExercises: state.savedExercises.filter((n) => n !== name),
        })),

      addCustomExercise: (name) =>
        set((state) => {
          if (state.customExercises.includes(name)) return state;
          return { customExercises: [...state.customExercises, name] };
        }),

      setLastExerciseRecord: (record) => set({ lastExerciseRecord: record }),

      updateInput: (field, value) =>
        set((state) => ({
          ...state,
          [field]: value,
        })),

      toggleBodyweight: () => set((state) => ({ isBodyweight: !state.isBodyweight })),

      logSet: () => {
        const state = get();
        const { activeExerciseName, weight, reps, rir, isBodyweight, restTime, exercises } = state;
        if (!activeExerciseName || !reps) {
          return { ok: false, error: '请填写所有字段' };
        }
        if (!isBodyweight && !weight) {
          return { ok: false, error: '请填写所有字段' };
        }

        const rirValue = rir ? Number(rir) : null;
        const w = isBodyweight ? 0 : Number(weight);
        const r = Number(reps);
        const newSet: SessionSet = {
          id: generateId(),
          weight: w,
          reps: r,
          rir: rirValue,
          isFailure: rirValue === 0,
          estimated1RM: isBodyweight ? 0 : w * (1 + r / 30),
          isBodyweight,
          completed: true,
          createdAt: Date.now(),
        };

        const setVolume = isBodyweight ? 0 : w * r;
        const existingIndex = exercises.findIndex((e) => e.name === activeExerciseName);
        let nextExercises: SessionExercise[];
        if (existingIndex >= 0) {
          const existing = exercises[existingIndex];
          nextExercises = exercises.map((e, i) =>
            i === existingIndex
              ? {
                  ...e,
                  sets: [...e.sets, newSet],
                  totalVolume: e.totalVolume + setVolume,
                }
              : e
          );
        } else {
          nextExercises = [
            ...exercises,
            {
              id: generateId(),
              name: activeExerciseName,
              sets: [newSet],
              restTime: Number(restTime),
              totalVolume: setVolume,
              startedAt: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }),
            },
          ];
        }

        // PR detection
        const currentSets = exercises.find((e) => e.name === activeExerciseName)?.sets ?? [];
        const pr = detectPRInternal(currentSets, state.lastExerciseRecord, w, r, isBodyweight);
        const prevCount = currentSets.length;
        const feedback = `✓ 第 ${prevCount + 1} 组完成`;

        set({
          exercises: nextExercises,
          prResult: pr,
          setFeedback: feedback,
        });

        // Emit SET_LOGGED event — runtime-core reducer uses this as truth source
        const sessionId = getCurrentSessionId();
        if (sessionId) {
          logAndEmit({
            type: 'SET_LOGGED',
            ts: newSet.createdAt,
            payload: {
              exerciseName:      activeExerciseName,
              setIndex:          prevCount,
              weight:            w,
              reps:              r,
              rir:               rirValue,
              isBodyweight,
              isWarmup:          false,
              isFailure:         rirValue === 0,
              estimated1RM:      newSet.estimated1RM,
              predictionSource:  'session',
            },
          }, sessionId);
        }

        return { ok: true, feedback, pr };
      },

      copyLastSet: () => {
        const state = get();
        const current = state.exercises.find((e) => e.name === state.activeExerciseName);
        if (!current || current.sets.length === 0) return false;
        const last = current.sets[current.sets.length - 1];
        set({
          isBodyweight: last.isBodyweight,
          weight: last.isBodyweight ? '' : String(last.weight),
          reps: String(last.reps),
          rir: String(last.rir ?? 1),
        });
        return true;
      },

      resetInputs: (opts) =>
        set((state) => ({
          weight: opts?.weight ?? '',
          reps: opts?.reps ?? '',
          rir: opts?.rir ?? '1',
          restTime: opts?.restTime ?? state.restTime,
          isBodyweight: opts?.isBodyweight ?? false,
        })),

      setTrainingNotes: (notes) => set({ trainingNotes: notes }),

      clearSession: () =>
        set({
          exercises: [],
          activeExerciseName: '',
          savedExercises: [],
          customExercises: [],
          trainingNotes: '',
          lastExerciseRecord: null,
          weight: '',
          reps: '',
          rir: '1',
          restTime: '90',
          isBodyweight: false,
          prResult: null,
          setFeedback: null,
          pendingWorkout: null,
        }),

      restoreSnapshot: (snapshot) =>
        set((state) => ({
          exercises: snapshot.exercises ?? state.exercises,
          activeExerciseName: snapshot.activeExerciseName ?? state.activeExerciseName,
          weight: snapshot.weight ?? state.weight,
          reps: snapshot.reps ?? state.reps,
          rir: snapshot.rir ?? state.rir,
          restTime: snapshot.restTime ?? state.restTime,
          isBodyweight: snapshot.isBodyweight ?? state.isBodyweight,
          trainingNotes: snapshot.trainingNotes ?? state.trainingNotes,
          savedExercises: snapshot.savedExercises ?? state.savedExercises,
          customExercises: snapshot.customExercises ?? state.customExercises,
        })),

      detectPR: (lastRecord) => {
        const state = get();
        const current = state.exercises.find((e) => e.name === state.activeExerciseName);
        const w = Number(state.weight);
        const r = Number(state.reps);
        if (!w || !r || state.isBodyweight) return null;
        return detectPRInternal(current?.sets ?? [], lastRecord ?? state.lastExerciseRecord, w, r, state.isBodyweight);
      },

      setPendingWorkout: (payload) => set({ pendingWorkout: payload }),
      clearPendingWorkout: () => set({ pendingWorkout: null }),
      clearFeedback: () => set({ prResult: null, setFeedback: null }),
    }),
    {
      name: 'fitcoach:v2:workout-session',
      // Persist everything except ephemeral feedback and pendingWorkout (handled separately)
      partialize: (state) => ({
        storedUserId: state.storedUserId,
        exercises: state.exercises,
        activeExerciseName: state.activeExerciseName,
        savedExercises: state.savedExercises,
        customExercises: state.customExercises,
        trainingNotes: state.trainingNotes,
        lastExerciseRecord: state.lastExerciseRecord,
        weight: state.weight,
        reps: state.reps,
        rir: state.rir,
        restTime: state.restTime,
        isBodyweight: state.isBodyweight,
        pendingWorkout: state.pendingWorkout,
      }),
    }
  )
);

// ── Derived Selectors (use with useShallow for stable references) ─────────────

export function selectTotalVolume(state: { exercises: SessionExercise[] }): number {
  return state.exercises.reduce((sum, e) => sum + e.totalVolume, 0);
}

export function selectCompletedSetCount(state: { exercises: SessionExercise[] }): number {
  return state.exercises.reduce((s, e) => s + e.sets.filter(st => !st.isWarmup && st.completed).length, 0);
}

export function selectExerciseCount(state: { exercises: SessionExercise[] }): number {
  return state.exercises.filter(e => e.sets.some(s => !s.isWarmup && s.completed)).length;
}

export function selectTotalPRs(state: { exercises: SessionExercise[] }): number {
  let prCount = 0;
  for (const ex of state.exercises) {
    const completed = ex.sets.filter(s => !s.isWarmup && s.completed);
    if (completed.length === 0) continue;
    const maxW = Math.max(...completed.map(s => s.weight));
    const maxV = Math.max(...completed.map(s => s.weight * s.reps));
    let hasPR = false;
    for (const s of completed) {
      const vol = s.weight * s.reps;
      if (s.weight === maxW || vol === maxV) {
        hasPR = true;
      }
    }
    if (hasPR) prCount++;
  }
  return prCount;
}

export function selectActiveExerciseSets(state: {
  exercises: SessionExercise[];
  activeExerciseName: string;
}): SessionSet[] {
  return state.exercises.find(e => e.name === state.activeExerciseName)?.sets ?? [];
}

export function selectActiveExerciseVolume(state: {
  exercises: SessionExercise[];
  activeExerciseName: string;
}): number {
  return state.exercises.find(e => e.name === state.activeExerciseName)?.totalVolume ?? 0;
}
