# FitCoach Runtime Reliability

## Philosophy

> "Users don't care how smart the system is. They care whether they can trust it."

Phase 6 upgrades FitCoach from an intelligent training product to a **production-grade fitness runtime OS**.

### What Users Actually Care About

| What they don't care about | What they DO care about |
|---------------------------|------------------------|
| Algorithm complexity | Data is never lost |
| AI sophistication | Works offline at the gym |
| Feature count | Doesn't get slower over time |
| Smart recommendations | Resumes if app crashes |
| | Predictions don't spam them |

---

## Architecture

```
src/lib/runtime-reliability/
├── persistence/          # Never lose state
│   ├── buildRuntimeSnapshot.ts
│   ├── persistRuntimeState.ts
│   └── restoreRuntimeState.ts
├── offline/              # Gym works without internet
│   ├── buildOfflineQueue.ts
│   ├── persistOfflineActions.ts
│   └── replayOfflineActions.ts
├── recovery/             # Crash → resume transparently
│   ├── detectInterruptedSession.ts
│   ├── recoverWorkoutSession.ts
│   └── restoreRuntimeFlow.ts
├── trust/                # Don't annoy with bad predictions
│   ├── calculatePredictionTrust.ts
│   ├── buildConfidenceCalibration.ts
│   └── detectLowConfidencePredictions.ts
├── monitoring/           # System stays fast long-term
│   ├── monitorRuntimeHealth.ts
│   ├── detectPerformanceDegradation.ts
│   └── trackPredictionAccuracy.ts
├── compression/          # Memory never bloats
│   ├── compressBehaviorMemory.ts
│   ├── archiveOldSessions.ts
│   └── buildBehaviorSummaries.ts
├── sync/                 # Future multi-device readiness
│   ├── buildSyncSnapshot.ts
│   ├── resolveRuntimeConflicts.ts
│   └── mergeBehaviorMemory.ts
└── stability/            # No cascade recomputation
    ├── batchRuntimeUpdates.ts
    ├── preventCascadeRecomputations.ts
    └── stabilizePredictionRuntime.ts
```

---

## Core Principles

### 1. Offline-First

Every feature works with `navigator.onLine === false`.

- Workout logging → offline queue → replays when online
- Predictions → computed from local memory only
- Crash recovery → reads local snapshot, no network required
- Food logging → local food DB, no API calls

### 2. Corruption-Tolerant Persistence

```
Primary snapshot → if corrupted → Backup snapshot → if corrupted → Empty start
```

- Every write rotates: current → backup before overwrite
- Snapshot includes checksum for integrity validation
- Versioned schema with migration support
- Hard size cap (512KB) to prevent storage exhaustion

### 3. Deterministic Recovery

```
App launch → detectInterruptedSession()
           → hasRecoverableSession?
             YES, < 30s elapsed → auto-recover silently
             YES, > 30s elapsed → prompt user
             NO                → normal launch
```

Recovery window: **4 hours** from last interruption.

Recovery prompt example:
```
"Resume Training?"
Bench Press — Set 4
42s rest remaining
  [✓ Resume]  [✗ Start Fresh]
```

### 4. Trust > Intelligence

The trust layer prevents the system from **recommending when it shouldn't**.

#### Calibration Levels

| Level | Samples | Behavior |
|-------|---------|----------|
| `uncalibrated` | < 5 | Show subtly, no reasoning displayed |
| `learning` | 5–14 | Show with lower prominence |
| `calibrated` | ≥ 15, trust ≥ 0.7 | Show with full reasoning |
| `suppressed` | Any, trust < 0.4 | Hidden — only fallback shown |

#### Display Modes

```
full       → prominently shown with reasoning and confidence
subtle     → shown with lower visual weight
fallback   → generic advice, no specific prediction
suppressed → prediction hidden entirely
```

#### Auto-Suppression Triggers

- Acceptance rate < 25% (user keeps changing it)
- Accuracy < 40% (predictions are wrong)
- Override: manual trust override always possible

### 5. Long-Term Performance

Without compression, localStorage grows unboundedly. At 3 sessions/week, a year of data = ~2MB+ before compression.

#### Compression Strategy

```
Full detail: last 30 days (recent sessions stay intact)
Archive: sessions 31–90 days ago → lightweight summary
Discard: sessions > 90 days → only exercise summaries remain
```

#### What's Preserved Forever

- Exercise summaries (best weight, avg volume, trend, frequency)
- Food summaries (frequency, typical meal times)
- Session count and total volume statistics
- All exercise snapshots (no sessions required)

#### What's Compressed

- Set-level data → aggregated into session volume
- Session-level data → archived to 7-field summary
- Raw food logs → compressed to frequency + meal pattern

Compression runs automatically every 30 days (configurable).

---

## Offline Runtime Queue

Every logging action is queued as an `OfflineRuntimeAction`:

```ts
{
  actionId: string;
  type: 'log_set' | 'log_food' | 'start_workout' | ...;
  payload: Record<string, unknown>;
  idempotencyKey: string;  // prevents double-replay
  dependsOn: string[];     // ordering guarantee
  retryCount: number;      // max 3 retries
  status: 'pending' | 'replaying' | 'completed' | 'failed';
}
```

### Replay Ordering

Actions are replayed in topological order based on `dependsOn`. This ensures:
- `start_workout` always before `log_set`
- `log_set` always before `end_workout`
- No orphaned actions

### Idempotency

Every action has a deterministic `idempotencyKey` based on type + payload. Duplicate keys are skipped during replay — network flakiness cannot cause double-logging.

---

## Health Monitoring

The `RuntimeHealthState` tracks system health continuously:

| Metric | Threshold | Impact |
|--------|-----------|--------|
| Prediction accuracy | < 50% | Trigger recalibration |
| Acceptance rate | < 30% | Increase suppression |
| Average latency | > 200ms | Trigger compression |
| Persistence success | < 90% | Storage warning |
| Memory usage | > 4MB | Auto-compress |
| Offline queue depth | > 50 | Sync reminder |

### Degradation Detection

7-day rolling trend analysis detects:
- Latency **worsening** (not just high)
- Acceptance rate **declining** (not just low)
- Memory **growing** (not just large)

### Recommendations

The health monitor produces human-readable recommendations:
- "Run behavior memory compression"
- "Connect to network to sync pending actions"
- "Allow more training sessions to build calibration"

---

## Cross-Device Sync Architecture

**Phase 6 implements the sync architecture — not a live server connection.**

### Design Principles

- **Offline-first**: device is always authoritative during offline
- **Eventual consistency**: conflicts resolve deterministically
- **No central authority**: merge rules are symmetric
- **Deterministic merge**: same inputs → same output, always

### Conflict Resolution Strategy

| Field | Strategy | Reason |
|-------|----------|--------|
| `sessionState` | Last write wins | Recency is authoritative |
| `recoveryState` | Last write wins | Recency is authoritative |
| `pendingInputs` | Merge (union) | Don't lose any input |
| Offline actions | Merge by idempotency key | Idempotent by design |

### Fast-Forward Merge

When remote `syncVersion ≤ local`, no conflicts are possible — local wins directly.

### Future Server Compatibility

The `SyncRuntimeSnapshot` is portable. When a real sync endpoint is added:
1. Serialize `SyncRuntimeSnapshot` to JSON
2. POST to sync API
3. Receive remote `SyncRuntimeSnapshot`
4. Call `mergeBehaviorMemory(local, remote)`
5. Persist merged result

No architectural changes required in Phase 6 code.

---

## Stability: No Cascade Recomputation

### The Problem

Every set logged → update session → update momentum → update prediction → update queue → update UI

Without batching, a single user action could trigger 5+ synchronous recomputations.

### The Solution

#### Update Batching

- Updates are queued into a `RuntimeUpdateBatch`
- Flushed every 50ms (normal) or immediately (critical)
- Deduplication: only the latest update of each type is kept
- Priority order: `critical > high > normal > low`

#### Dependency Isolation

```
session → momentum, prediction, rest_timer
prediction → queue
input → prediction
```

When `session` changes, only its dependents recompute. `rest_timer` changes don't trigger `momentum` recomputation.

#### Prediction Throttling

```
exercise_changed | manual  → immediate recompute
set_logged                 → recompute if ≥ 50ms since last
weight_changed (stable)    → deferred 200ms
```

**Throttle efficiency target**: avoid 40%+ of potential recomputes.

---

## Storage Budget

| Key | Max Size | Purpose |
|-----|----------|---------|
| `fitcoach_runtime_snapshot` | 512 KB | Active + recovery state |
| `fitcoach_runtime_snapshot_backup` | 512 KB | Corruption fallback |
| `fitcoach_offline_queue` | 256 KB | Offline action queue |
| `fitcoach_prediction_outcomes` | ~100 KB | Trust calibration |
| `fitcoach_runtime_metrics` | ~50 KB | Health monitoring |
| `fitcoach_session_archive` | ~200 KB | Compressed old sessions |
| **Total budget** | **~1.7 MB** | Well within 5MB localStorage |

---

## Success Criteria

### Reliability

- [x] Crash → app relaunch → training resumes at correct set
- [x] Network off → all logging continues without interruption  
- [x] App force-quit → recovery prompt on next open (within 4h)
- [x] Corrupt storage → backup recovery without data loss
- [x] Storage full → graceful degradation without crash

### Trust

- [x] Low acceptance rate → predictions auto-suppressed
- [x] Inaccurate predictions → calibration level degraded
- [x] Learning phase → subtle display, no spam
- [x] High confidence → full display with reasoning

### Long-Term Stability

- [x] 6 months of sessions → compression keeps memory < 2MB
- [x] Rapid state changes → batching prevents UI jank
- [x] Single set log → max 1 prediction recompute (throttled)
- [x] Health degradation → actionable recommendations generated

### Sync Readiness

- [x] Local state packageable as `SyncRuntimeSnapshot`
- [x] Deterministic conflict resolution (no random tiebreaks)
- [x] Idempotent offline actions (safe to replay)
- [x] Fast-forward detection (no unnecessary conflict resolution)

---

## The Outcome

After Phase 6, FitCoach is no longer a smart app.

It is a **personal fitness runtime** — one that:

- Never loses your data
- Works at any gym, with or without internet
- Recovers silently from crashes
- Gets smarter without getting louder
- Stays fast no matter how long you use it
- Is ready to sync to any device, any time

**This is the difference between an app you use and a system you trust.**
