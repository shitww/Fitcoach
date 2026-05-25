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
  // ── User-driven events ──────────────────────────────────────────────────────
  | 'TRAINING_STARTED'
  | 'TRAINING_PAUSED'
  | 'TRAINING_RESUMED'
  | 'TRAINING_COMPLETED'
  | 'REST_STARTED'
  | 'REST_COMPLETED'
  | 'REST_SKIPPED'
  | 'SET_COMPLETED'
  | 'EXERCISE_CHANGED'
  // ── AI-injectable events (AI is just another event source) ──────────────────
  | 'WORKOUT_ADJUSTED'    // AI modifies overall workout structure
  | 'REST_MODIFIED'       // AI adjusts rest duration mid-session
  | 'SET_TARGET_UPDATED'  // AI updates target reps/weight for a set
  | 'INTENSITY_TUNED';    // AI tunes session intensity

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
