# Runtime Core — Event-Sourced Training Runtime OS

## Why This Exists

FitCoach was originally built as a page-driven workout logger:
- UI component holds `useState({ exercises, currentExercise, weight, reps })`
- User taps "Log Set" → `setExercises([...])` → state mutated
- Session saves to localStorage via `useEffect`

This model has fundamental problems:

| Problem | Consequence |
|---------|------------|
| State scattered across 3+ locations | Crash = data loss |
| No audit trail | Can't reconstruct "what happened" |
| UI owns training truth | Lock screen = session lost |
| No undo | Mis-logged set = permanent |
| No replay | Can't analyze training patterns |
| Brittle sync | Legacy stores often desync |

**Phase 9 solves all of this** with a single architectural shift:

> Every training interaction is an append-only Event.
> State is always derived deterministically from events.
> UI reads from snapshot. UI dispatches events. UI owns nothing.

---

## Architecture

```
User Action (tap, swipe)
         ↓
  dispatch(type, payload)          ← UI's ONLY write path
         ↓
  createRuntimeEvent()             ← immutable event object
         ↓
  appendRuntimeEvent()             ← append-only log
         ↓
  reduceWorkoutRuntime(events)     ← pure reducer
         ↓
  WorkoutRuntimeSnapshot           ← single truth source
         ↓
  UI Surfaces                      ← read-only views
```

---

## Event-Sourcing Philosophy

### Append-Only Runtime

The event log is **never mutated**. Every user action produces a new event appended to the end.

```typescript
// ✅ Correct: append a new event
dispatch('SET_LOGGED', { exerciseName: '卧推', weight: 82.5, reps: 8 })

// ❌ Wrong: mutate state directly
setExercises([...exercises, newSet])
```

### Deterministic Reconstruction

Given the same sequence of events, `reduceWorkoutRuntime()` always produces the same snapshot.

```typescript
const snapshot = reduceWorkoutRuntime(events)
// snapshot is always identical for identical events — no hidden state
```

This enables:
- **Replay**: travel back to any point in time
- **Debug**: reproduce any user's exact session state
- **AI analysis**: simulate "what if" scenarios without touching live state
- **Crash recovery**: rebuild from event log after any interruption

### Undo Without Deletion

Traditional undo: delete the bad event.  
Runtime Core undo: append a `SET_CORRECTED` event.

```typescript
// User logged 100kg × 8, meant 80kg × 8
// ❌ Wrong: delete the SET_LOGGED event
// ✅ Correct: append a correction
dispatch('SET_CORRECTED', {
  targetEventId: wrongSetEventId,
  exerciseName: '卧推',
  correctedWeight: 80,
  reason: 'typo',
})
```

The reducer handles `SET_CORRECTED` by patching the affected set in the rebuilt snapshot. The original event is preserved.

---

## Event Types

### Session Lifecycle
| Event | When | Key Payload |
|-------|------|-------------|
| `SESSION_STARTED` | Training begins | sessionType, planId, exerciseQueue |
| `SESSION_PAUSED` | User pauses | — |
| `SESSION_RESUMED` | User resumes | — |
| `SESSION_COMPLETED` | Training done | elapsedSec, totalVolume, totalSets |
| `SESSION_RECOVERED` | Crash recovery | recoveryType, originalSessionId |

### Exercise Queue
| Event | When | Key Payload |
|-------|------|-------------|
| `EXERCISE_ADDED` | Exercise enters queue | name, targetSets, restTime |
| `EXERCISE_QUEUE_SET` | Bulk queue load (plan day) | exerciseNames[] |
| `EXERCISE_CHANGED` | Focus switches | name |
| `EXERCISE_COMPLETED` | All sets done | exerciseName, setsLogged |
| `EXERCISE_SKIPPED` | User removes | exerciseName |

### Set Events (Core Training Truth)
| Event | When | Key Payload |
|-------|------|-------------|
| `SET_LOGGED` | Set completed | exerciseName, weight, reps, rir, isBodyweight, setIndex |
| `SET_CORRECTED` | Correction/undo | targetEventId, correctedWeight, correctedReps |

`SET_LOGGED` is the most important event in the system. It carries the full truth of what happened in a set. The reducer builds `exercises[]` entirely from `SET_LOGGED` events.

### Rest Events
| Event | When | Key Payload |
|-------|------|-------------|
| `REST_STARTED` | Rest period begins | duration (seconds) |
| `REST_COMPLETED` | Timer reaches 0 | — |
| `REST_SKIPPED` | User taps skip | — |

### Prediction Events
| Event | When | Key Payload |
|-------|------|-------------|
| `PREDICTION_ACCEPTED` | User confirms predicted values | exerciseName, predictedWeight, predictedReps |
| `PREDICTION_REJECTED` | User adjusts predicted values | exerciseName, actualWeight, actualReps |

---

## WorkoutRuntimeSnapshot

The snapshot is the **only** object UI surfaces read from.

```typescript
interface WorkoutRuntimeSnapshot {
  sessionId: string | null
  sessionPhase: 'idle' | 'active' | 'paused' | 'done'
  sessionType: 'strength' | 'cardio' | 'free' | null
  startTime: number | null
  elapsedSec: number

  exercises: RuntimeExercise[]       // full set history with weights/reps
  exerciseQueue: string[]            // ordered names
  activeExerciseName: string | null
  completedExerciseNames: string[]

  isRestActive: boolean
  restDuration: number
  restEndAt: number | null

  totalSets: number
  totalVolume: number
  prResults: RuntimePRResult[]

  trainingNotes: string
  lastPrediction: { ... } | null

  eventCount: number
  lastEventId: string | null
}
```

---

## Reducer Design

`reduceWorkoutRuntime(events)` is a **pure function**:

```typescript
// Pure: same input always produces same output
// No side effects: no store mutations, no network calls, no timers
// No hidden state: all inputs are explicit

function reduceWorkoutRuntime(
  events: readonly RuntimeCoreEvent[],
  asOf: number = Date.now()
): WorkoutRuntimeSnapshot
```

The reducer processes events in sequence, applying each to a running snapshot state. It handles:
- Session lifecycle transitions
- Exercise queue mutations (add, remove, reorder)
- Set accumulation (SET_LOGGED builds `exercises[].sets[]`)
- SET_CORRECTED patches (applied on rebuild)
- Rest state derived from REST_STARTED timestamps

---

## Zustand Store — `useRuntimeCore`

```typescript
const { snapshot, dispatch, startSession, pauseSession, resumeSession, completeSession } = useRuntimeCore()
```

### dispatch()

The ONLY write path:

```typescript
dispatch('SET_LOGGED', {
  exerciseName: '卧推',
  setIndex: 2,
  weight: 82.5,
  reps: 8,
  rir: 2,
  isBodyweight: false,
  isWarmup: false,
  isFailure: false,
  estimated1RM: 107.25,
  predictionSource: 'session',
})
```

Internally:
1. Creates an immutable `RuntimeCoreEvent`
2. Appends to in-memory event log
3. Bridges to legacy event bus (backward compat)
4. Runs `reduceWorkoutRuntime(events)` → new snapshot
5. Persists snapshot to localStorage

### Reading state

```typescript
// ✅ Always read from snapshot
const { snapshot } = useRuntimeCore()
const activeEx = snapshot.activeExerciseName

// Or use targeted selectors
const phase = useRuntimeCore(selectRTPhase)
const isRest = useRuntimeCore(selectRTIsRestActive)
```

---

## Timeline Architecture

Training is not a list of completed sets. It's a continuous temporal story arc.

The timeline is built from the event log:

```
Session Start    ────────────────────────────────────────►
                 │
  [exercise_chapter: 卧推]
  ├── work_set: 80kg × 8
  ├── rest: 90s
  ├── work_set: 82.5kg × 8   ← peak_moment (PR)
  ├── rest: 90s
  └── work_set: 82.5kg × 7   ← fatigue_signal (RIR 1)
                 │
  [exercise_chapter: 哑铃飞鸟]
  ├── work_set: 18kg × 12
  └── ...
                 │
  Session Complete ──► reflection
```

Consumers:
- `buildWorkoutTimeline(sessionId)` → `TimelineMoment[]`
- `buildTimelineMoments` → semantic moment detection (peaks, fatigue, consistency)
- `groupTimelineEvents` → chapter grouping for display

---

## Replay Model

### Full Replay

```typescript
const replay = replayWorkoutSession(sessionId)
// replay.snapshot = identical to what snapshot would have been at session end
// replay.isDeterministic = always true (pure reducer)
```

### Scrub to Point in Time

```typescript
const snapshotAt10min = replayUpToTime(sessionId, sessionStart + 10 * 60 * 1000)
```

### Step-by-Step Playback

```typescript
const frames = simulateRuntimePlayback(sessionId)
// frames[i].snapshot = state after event i
// Useful for AI analysis and debug
```

### AI Hypothetical Simulation

```typescript
const hypothetical = simulateHypotheticalEvents(sessionId, [
  createRuntimeEvent('REST_STARTED', sessionId, { duration: 120 }),
])
// What would state look like if we added 120s rest here?
```

---

## Undo Strategy

1. User taps "Undo last set"
2. `getUndoCandidates(sessionId)` → finds last `SET_LOGGED` event
3. Build correction: `buildSetUndoPayload(targetEventId, exerciseName)`
4. Dispatch: `dispatch('SET_CORRECTED', payload)`
5. `rebuildRuntimeAfterUndo(sessionId)` → runs reducer with correction in log
6. Snapshot now reflects corrected state

The original `SET_LOGGED` event is **preserved forever** in the log. Only the reducer output changes.

---

## Continuous Session Presence

Training session is independent of browser/app page lifecycle:

```
User starts training
    ↓
beginSessionPresence(sessionId)    ← track foreground/background
registerPresenceListeners()         ← visibilitychange, focus, blur
    ↓
User locks phone (PWA)
    ↓
onSessionBackground()               ← background time tracked
restEndAt (epoch ms) in snapshot    ← rest timer survives lock screen
    ↓
User unlocks phone
    ↓
onSessionForeground()               ← background duration recorded
restoreRuntimePresence()            ← rebuild snapshot from event log
SESSION_RECOVERED event dispatched  ← extends timeline
    ↓
Session continues — no data lost
```

The rest timer uses `endAt` (epoch ms) not a running countdown, so it survives any suspension.

---

## Integrity Layer

Every runtime snapshot is:
1. **Checksummed**: FNV-1a over sessionId + totalSets + totalVolume + eventCount
2. **Validated**: `validateRuntimeEventLog()` checks ordering, orphan events, duplicate starts
3. **Corruption-detected**: `detectRuntimeCorruption()` checks snapshot vs event log agreement
4. **Repairable**: `repairRuntimeSnapshot()` rebuilds from event log when corruption detected

---

## RuntimeCoreAdapter — Legacy Bridge

During the transition period, `useRuntimeCoreAdapter()` keeps legacy stores in sync:

```
runtime-core snapshot
    ↓
RuntimeCoreAdapter
    ↓
workoutTimer store    ← read-only mirror
workoutSession store  ← read-only mirror
    ↓
Legacy UI components  ← continue to work unchanged
```

Legacy components still read from `useWorkoutTimer()` and `useWorkoutSession()`. The adapter ensures these stores always reflect the runtime-core snapshot. No legacy component changes needed during the migration window.

---

## Why UI Cannot Own Truth

### The Problem With UI State

```typescript
// ❌ Component-owned truth
const [exercises, setExercises] = useState([])

// When user navigates away: exercises = []
// When tab crashes: exercises = []
// When PWA suspends: exercises = []
// When user shares screen: other instance doesn't see exercises
```

### The Runtime-Core Solution

```typescript
// ✅ Event-sourced truth
dispatch('SET_LOGGED', { exerciseName: '卧推', weight: 82.5, reps: 8 })

// When user navigates away: event log persisted ✓
// When tab crashes: snapshot in localStorage ✓
// When PWA suspends: restEndAt in snapshot, recoverable ✓
// Multi-surface: all surfaces read same snapshot ✓
```

---

## Success Criteria (Phase 9)

| Criterion | Status |
|-----------|--------|
| All set logging emits `SET_LOGGED` event | ✅ |
| Reducer builds full snapshot from events | ✅ |
| UI reads snapshot only | ✅ (via adapter) |
| Session survives lock screen | ✅ (restEndAt + presence) |
| Crash recovery works | ✅ (hydrateRuntimeSnapshot) |
| Undo is append-only | ✅ (SET_CORRECTED) |
| Timeline reconstruction | ✅ (buildWorkoutTimeline) |
| Replay is deterministic | ✅ (pure reducer) |
| Integrity validation | ✅ (validateRuntimeEventLog) |
| Legacy stores remain functional | ✅ (RuntimeCoreAdapter) |

---

## Future Migration Path

- **Phase 10**: Remove `WorkoutController` UI-owned state; direct `dispatch()` calls from interaction handlers
- **Phase 11**: Remove `workoutSession.ts` store entirely; UI reads `useRuntimeCore(s => s.snapshot.exercises)` directly
- **Phase 12**: Cross-device sync via event log replication (event IDs are stable, order is deterministic)
