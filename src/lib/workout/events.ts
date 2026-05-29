/**
 * Workout Domain Event Bus
 *
 * Lightweight synchronous dispatcher — store actions emit events, the
 * effect layer (useWorkoutEffects) subscribes to execute all UI side-effects.
 *
 * Rules:
 *  - Only store actions may call emit()
 *  - Handlers must not mutate store state; they execute pure side-effects only
 *  - Bus is module-level: no React context, no Zustand, zero overhead
 */

export type WorkoutEventType =
  // ── Session lifecycle ────────────────────────────────────────────────────────
  | 'TRAINING_STARTED'       // legacy alias — use SESSION_STARTED for new code
  | 'TRAINING_PAUSED'
  | 'TRAINING_RESUMED'
  | 'TRAINING_COMPLETED'
  | 'SESSION_STARTED'        // full session start with metadata
  | 'SESSION_PAUSED'         // alias for TRAINING_PAUSED (new events use this)
  | 'SESSION_RESUMED'
  | 'SESSION_COMPLETED'      // alias for TRAINING_COMPLETED
  | 'SESSION_RECOVERED'      // crash / lock-screen recovery restart
  // ── Exercise queue events ───────────────────────────────────────────────────
  | 'EXERCISE_ADDED'         // single exercise enters the queue
  | 'EXERCISE_QUEUE_SET'     // bulk queue assignment (plan day load)
  | 'EXERCISE_CHANGED'       // active exercise focus changed
  | 'EXERCISE_COMPLETED'     // all target sets for exercise are done
  | 'EXERCISE_SKIPPED'       // exercise removed from queue
  // ── Set events (the core training truth) ───────────────────────────────────
  | 'SET_STARTED'            // user begins a set (optional, best-effort)
  | 'SET_LOGGED'             // complete set logged — full payload is truth source
  | 'SET_COMPLETED'          // legacy alias for SET_LOGGED (thin payload)
  | 'SET_CORRECTED'          // append-only correction (never overwrites SET_LOGGED)
  // ── Rest events ─────────────────────────────────────────────────────────────
  | 'REST_STARTED'
  | 'REST_COMPLETED'
  | 'REST_SKIPPED'
  // ── Prediction events ───────────────────────────────────────────────────────
  | 'PREDICTION_ACCEPTED'    // user confirmed predicted set values
  | 'PREDICTION_REJECTED'    // user adjusted predicted values
  // ── Session metadata events ─────────────────────────────────────────────────
  | 'CARDIO_PARAMS_UPDATED'  // speed / incline / level changed
  | 'SESSION_NOTES_UPDATED'  // training notes updated
  // ── AI-injectable events ─────────────────────────────────────────────────────
  | 'WORKOUT_ADJUSTED'
  | 'REST_MODIFIED'
  | 'SET_TARGET_UPDATED'
  | 'INTENSITY_TUNED';

/** Who originated the event — preserved in LoggedEvent.origin. */
export type EventOrigin = 'user' | 'ai' | 'system';

/**
 * Replay execution mode.
 * - 'normal':  standard replay; effects silenced
 * - 'ai':      AI event injection allowed; effects silenced
 * - 'debug':   event log frozen; pure deterministic projection
 * - 'explain': like debug + exposes causality chain + decision traces
 */
export type ReplayMode = 'normal' | 'ai' | 'debug' | 'explain';

export interface WorkoutEvent {
  type: WorkoutEventType;
  ts: number;
  payload?: Record<string, unknown>;
}

type Handler = (event: WorkoutEvent) => void;

const _handlers = new Set<Handler>();

/** Emit a workout domain event. Called exclusively by store actions. */
export function emit(event: WorkoutEvent): void {
  _handlers.forEach(h => {
    try { h(event); } catch (err) { console.error('[WorkoutBus]', err); }
  });
}

/**
 * Subscribe to all workout domain events.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 */
export function subscribe(handler: Handler): () => void {
  _handlers.add(handler);
  return () => { _handlers.delete(handler); };
}
