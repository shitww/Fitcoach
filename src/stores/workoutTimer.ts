import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logAndEmit, beginSession, setCurrentSessionId } from '@/lib/workout/eventLog';

export type SessionPhase = 'idle' | 'active' | 'paused' | 'done';

export interface RestTimer {
  phase: 'idle' | 'running';
  /** Total seconds of this rest period */
  duration: number;
  /** Epoch ms when rest ends — used for lock-screen / PWA suspend recovery */
  endAt: number | null;
}

const REST_IDLE: RestTimer = { phase: 'idle', duration: 0, endAt: null };

// ── Single global ticker ────────────────────────────────────────────────────
// One interval for the whole app; components never create their own intervals.
let _tickerRef: ReturnType<typeof setInterval> | null = null;

function _startTicker(): void {
  if (typeof window === 'undefined') return; // SSR guard
  if (_tickerRef !== null) return;           // already running
  _tickerRef = setInterval(() => {
    useWorkoutTimer.setState({ now: Date.now() });
  }, 500);
}

function _stopTicker(): void {
  if (_tickerRef !== null) {
    clearInterval(_tickerRef);
    _tickerRef = null;
  }
}

/** Start or stop the ticker based on whether there is live activity. */
function _autoTicker(phase: SessionPhase, restPhase: 'idle' | 'running'): void {
  if (phase === 'active' || restPhase === 'running') {
    _startTicker();
  } else {
    _stopTicker();
  }
}

// ── State interface ─────────────────────────────────────────────────────────
interface WorkoutTimerState {
  // ── Primary state ──────────────────────────────────────────────────────────
  /** Monotonic wall-clock tick (epoch ms). Updated every 500 ms by the global ticker.
   *  NOT persisted — excluded from partialize. Components derive all countdowns from this. */
  now: number;
  sessionPhase: SessionPhase;
  trainingStartTime: number | null;
  trainingDuration: number;
  restTimer: RestTimer;
  currentExercise: string | null;
  nextExercise: string | null;
  totalSets: number;
  sessionType: string | null;
  cardioSpeed: number;
  cardioIncline: number;
  cardioLevel: number;

  // ── Backward-compat booleans (kept in sync with primary state) ─────────────
  isTrainingActive: boolean;
  isPaused: boolean;
  isRestActive: boolean;
  isCardioSession: boolean;
  isFreeSession: boolean;

  /** Stable ID for the current or last training session. Persisted. */
  sessionId: string | null;

  // ── Actions ────────────────────────────────────────────────────────────────
  startTraining: () => void;
  pauseTraining: () => void;
  resumeTraining: () => void;
  stopTraining: () => { duration: number; startTime: number | null };
  resetSession: () => void;
  addDuration: (seconds: number) => void;
  startRest: (seconds: number) => void;
  /** Natural completion (timer reached 0) */
  completeRest: () => void;
  /** User-initiated skip */
  skipRest: () => void;
  /** Legacy alias — prefer completeRest / skipRest */
  stopRest: () => void;
  setCurrentExercise: (name: string | null) => void;
  setNextExercise: (name: string | null) => void;
  incrementSets: () => void;
  setSessionType: (type: string | null) => void;
  setCardioParams: (speed: number, incline: number, level: number) => void;
  /** Legacy compat */
  setCardioSession: (v: boolean) => void;
  /** Legacy compat */
  setFreeSession: (v: boolean) => void;
}

export const useWorkoutTimer = create<WorkoutTimerState>()(
  persist(
    (set, get) => ({
      now: Date.now(),
      sessionPhase: 'idle',
      trainingStartTime: null,
      trainingDuration: 0,
      restTimer: REST_IDLE,
      currentExercise: null,
      nextExercise: null,
      totalSets: 0,
      sessionType: null,
      sessionId: null,
      cardioSpeed: 0,
      cardioIncline: 0,
      cardioLevel: 0,
      isTrainingActive: false,
      isPaused: false,
      isRestActive: false,
      isCardioSession: false,
      isFreeSession: false,

      startTraining: () => {
        const { sessionPhase } = get();
        if (sessionPhase === 'active' || sessionPhase === 'paused') return;
        const newSessionId = beginSession();
        set({
          sessionPhase: 'active', isTrainingActive: true, isPaused: false,
          trainingStartTime: Date.now(), trainingDuration: 0,
          sessionId: newSessionId,
        });
        _autoTicker('active', get().restTimer.phase);
        logAndEmit({ type: 'TRAINING_STARTED', ts: Date.now() }, newSessionId);
      },

      pauseTraining: () => {
        const { sessionPhase, trainingDuration, trainingStartTime } = get();
        if (sessionPhase !== 'active') return;
        const elapsed = trainingStartTime ? Math.floor((Date.now() - trainingStartTime) / 1000) : 0;
        set({
          sessionPhase: 'paused', isTrainingActive: false, isPaused: true,
          trainingDuration: trainingDuration + elapsed, trainingStartTime: null,
        });
        _autoTicker('paused', get().restTimer.phase);
        logAndEmit({ type: 'TRAINING_PAUSED', ts: Date.now() }, get().sessionId ?? '');
      },

      resumeTraining: () => {
        if (get().sessionPhase !== 'paused') return;
        set({ sessionPhase: 'active', isTrainingActive: true, isPaused: false, trainingStartTime: Date.now() });
        _autoTicker('active', get().restTimer.phase);
        logAndEmit({ type: 'TRAINING_RESUMED', ts: Date.now() }, get().sessionId ?? '');
      },

      stopTraining: () => {
        const { trainingDuration, trainingStartTime, sessionPhase } = get();
        let total = trainingDuration;
        if (sessionPhase === 'active' && trainingStartTime) {
          total += Math.floor((Date.now() - trainingStartTime) / 1000);
        }
        set({
          sessionPhase: 'done', isTrainingActive: false, isPaused: false,
          trainingStartTime: null, trainingDuration: 0,
          currentExercise: null, totalSets: 0,
          sessionType: null, isCardioSession: false, isFreeSession: false,
          cardioSpeed: 0, cardioIncline: 0, cardioLevel: 0,
          restTimer: REST_IDLE, isRestActive: false,
        });
        _autoTicker('done', 'idle');
        logAndEmit({ type: 'TRAINING_COMPLETED', ts: Date.now(), payload: { duration: total } }, get().sessionId ?? '');
        return { duration: total, startTime: trainingStartTime };
      },

      resetSession: () => {
        set({
          sessionPhase: 'idle', isTrainingActive: false, isPaused: false,
          trainingStartTime: null, trainingDuration: 0,
          restTimer: REST_IDLE, isRestActive: false,
          currentExercise: null, totalSets: 0,
          sessionType: null, isCardioSession: false, isFreeSession: false,
          cardioSpeed: 0, cardioIncline: 0, cardioLevel: 0,
        });
        _autoTicker('idle', 'idle');
      },

      addDuration: (seconds) => set(state => ({ trainingDuration: state.trainingDuration + seconds })),

      startRest: (seconds) => {
        set({
          restTimer: { phase: 'running', duration: seconds, endAt: Date.now() + seconds * 1000 },
          isRestActive: true,
        });
        _autoTicker(get().sessionPhase, 'running');
        logAndEmit({ type: 'REST_STARTED', ts: Date.now(), payload: { duration: seconds } }, get().sessionId ?? '');
      },

      completeRest: () => {
        set({ restTimer: REST_IDLE, isRestActive: false });
        _autoTicker(get().sessionPhase, 'idle');
        logAndEmit({ type: 'REST_COMPLETED', ts: Date.now() }, get().sessionId ?? '');
      },
      skipRest: () => {
        set({ restTimer: REST_IDLE, isRestActive: false });
        _autoTicker(get().sessionPhase, 'idle');
        logAndEmit({ type: 'REST_SKIPPED', ts: Date.now() }, get().sessionId ?? '');
      },
      stopRest: () => {
        set({ restTimer: REST_IDLE, isRestActive: false });
        _autoTicker(get().sessionPhase, 'idle');
      },

      setCurrentExercise: (name) => {
        set({ currentExercise: name });
        if (name !== null) logAndEmit({ type: 'EXERCISE_CHANGED', ts: Date.now(), payload: { name } }, get().sessionId ?? '');
      },
      setNextExercise: (name) => set({ nextExercise: name }),
      incrementSets: () => {
        set(s => ({ totalSets: s.totalSets + 1 }));
        logAndEmit({ type: 'SET_COMPLETED', ts: Date.now() }, get().sessionId ?? '');
      },

      setSessionType: (type) => set({
        sessionType: type,
        isCardioSession: type !== null && type !== 'strength' && type !== 'free',
        isFreeSession: type === 'free',
      }),

      setCardioParams: (speed, incline, level) => set({ cardioSpeed: speed, cardioIncline: incline, cardioLevel: level }),

      setCardioSession: (v) => { if (v) set({ isCardioSession: true, isFreeSession: false }); },
      setFreeSession: (v) => { if (v) set({ isFreeSession: true, isCardioSession: false }); },
    }),
    {
      name: 'fitcoach:v1:timer',
      // Restart ticker after persist hydration if there is a live session / rest
      onRehydrateStorage: () => (state) => {
        if (state) {
          _autoTicker(state.sessionPhase, state.restTimer.phase);
          if (state.sessionId) setCurrentSessionId(state.sessionId);
        }
      },
      // `now` is a transient runtime value — never write it to localStorage
      partialize: (state) => ({
        sessionPhase: state.sessionPhase,
        isTrainingActive: state.isTrainingActive,
        isPaused: state.isPaused,
        trainingStartTime: state.trainingStartTime,
        trainingDuration: state.trainingDuration,
        restTimer: state.restTimer,
        isRestActive: state.isRestActive,
        currentExercise: state.currentExercise,
        totalSets: state.totalSets,
        isCardioSession: state.isCardioSession,
        isFreeSession: state.isFreeSession,
        sessionType: state.sessionType,
        sessionId: state.sessionId,
        cardioSpeed: state.cardioSpeed,
        cardioIncline: state.cardioIncline,
        cardioLevel: state.cardioLevel,
      }),
    }
  )
);

// ── WorkoutPhase state machine ────────────────────────────────────────────────
//
// High-level UI phase derived entirely from existing store signals.
// Components subscribe to this instead of testing multiple booleans.
//
// Phase ladder:
//   idle → exercise ──► rest ──► exercise (cycle)
//          exercise ──► cardio (when isCardioSession)
//          any      ──► completed (when sessionPhase === 'done')
//
// Phases that require page-level UI state (prepare, activation, exercise_switch,
// summary) are handled in the page component, not the timer store, because they
// depend on UI transitions (modal open, exercise picker visible, etc.).

export type WorkoutPhase =
  | 'idle'
  | 'exercise'
  | 'rest'
  | 'cardio'
  | 'completed';

// ── Derived selectors (stable, importable by any component) ─────────────────

/** Current high-level workout phase — drives UI layout switching. */
export const selectWorkoutPhase = (s: WorkoutTimerState): WorkoutPhase => {
  if (s.sessionPhase === 'done') return 'completed';
  if (s.sessionPhase === 'idle') return 'idle';
  if (s.restTimer.phase === 'running') return 'rest';
  if (s.isCardioSession) return 'cardio';
  return 'exercise';
};

/** Total training seconds elapsed, derived from store.now (live when active). */
export const selectTrainingSeconds = (s: WorkoutTimerState): number => {
  if (!s.isTrainingActive || !s.trainingStartTime) return s.trainingDuration;
  return s.trainingDuration + Math.floor((s.now - s.trainingStartTime) / 1000);
};

/** Whole seconds remaining in the current rest period (0 when idle). */
export const selectRestSecondsRemaining = (s: WorkoutTimerState): number => {
  if (s.restTimer.phase !== 'running' || !s.restTimer.endAt) return 0;
  return Math.max(0, Math.ceil((s.restTimer.endAt - s.now) / 1000));
};
