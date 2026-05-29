# FitCoach Adaptive Training Surface

## Overview

The Adaptive Training Surface is Phase 4 of the FitCoach intelligence stack. It does not add new algorithms — it transforms Phase 1-3 intelligence into tangible, low-friction user experiences.

> "The user should never see a blank page. The app should always know what to suggest next."

---

## Philosophy

### Predictive-First UX

The system **surfaces** intelligence; it does not **hide** it behind menus.

- Home page → "Push Day" hero card, not a grid of features
- Training page → "Continue Bench Press 80kg", not an empty log form
- Between exercises → "Next: Incline DB Press", not a search bar

### One-Tap Actions

Every suggestion must be actionable with a single tap:

- **Hero card**: "Start Push Day" → begins session instantly
- **Next exercise**: "Do This Next" → adds to queue and proceeds
- **Weight suggestion**: "80kg" → pre-fills the weight field
- **Finish exercise**: "Done" → completes and advances

### Explainable by Default

Every recommendation shows its reasoning:

- Confidence badge: High / Medium / Exploratory
- Reasoning panel: "After bench press, you usually do incline DB press"
- Top signal highlight: "Back recovery: 94%"

### No Empty States

The system guarantees a meaningful surface for every context:

| Context | Empty State |
|---------|-------------|
| First visit | "Welcome — pick a focus area and start" |
| No workout history | "No workouts yet — start your first session" |
| All recovered | "Fully recovered — train anything today" |
| Long gap | "Welcome back — resume where you left off" |

---

## Architecture

```
src/lib/adaptive-surface/
├── home-surface/             # Adaptive home page
│   ├── buildAdaptiveHomeSurface.ts
│   ├── buildTodayFocus.ts
│   └── buildHomePredictions.ts
├── training-surface/         # Live training page
│   ├── buildTrainingSurface.ts
│   ├── buildExerciseActionPanel.ts
│   └── buildSessionContext.ts
├── recommendation-ui/        # Explainable cards
│   ├── buildExerciseRecommendationCard.ts
│   ├── buildPredictionReasoning.ts
│   ├── buildConfidenceBadge.ts
│   └── prioritization/
│       ├── prioritizeRecommendations.ts
│       └── calculateInteractionPriority.ts
├── empty-state/              # Never-blank states
│   ├── buildAdaptiveEmptyState.ts
│   ├── buildColdStartSurface.ts
│   └── buildNoHistoryFallback.ts
├── session-runtime/          # In-workout live updates
│   ├── buildRuntimeWorkoutFlow.ts
│   ├── updateSessionUIState.ts
│   └── buildLivePredictionState.ts
└── runtime-ui/               # One-tap surfaces
    ├── buildOneTapWorkoutSurface.ts
    ├── buildInstantStartFlow.ts
    ├── generateFastWorkoutEntry.ts
    └── mobile/
        ├── optimizeRuntimeUpdates.ts
        └── batchPredictionUpdates.ts
```

---

## UI Contracts

All UI components consume only `src/types/adaptive-surface.ts`:

| Contract | Purpose |
|----------|---------|
| `AdaptiveHomeSurface` | Complete home screen data |
| `AdaptiveTrainingSurface` | Complete training page data |
| `ExerciseRecommendationCard` | Rich, explainable suggestion card |
| `OneTapWorkoutSurface` | Instant-start hero + quick options |
| `LiveWorkoutRuntime` | Real-time session state |
| `AdaptiveEmptyState` | Meaningful fallback for any context |

---

## Key Flows

### Home Surface Flow

```
BehaviorMemorySnapshot
  → predictWorkoutSession (Phase 3)
  → buildQuickStartSuggestions (Phase 3)
  → buildAdaptiveHomeSurface (Phase 4)
    → todayFocus: Hero card
    → quickStarts: 3-4 action cards
    → recoveryBadges: Muscle group status
    → todayPrediction: Split + confidence
```

### One-Tap Start Flow

```
User opens app
  → buildOneTapWorkoutSurface
    → heroSuggestion: "Continue Push Day" or "Pull Day — Start"
    → quickOptions: 3-4 secondary starts
    → recentOptions: Last splits
  → User taps hero
  → buildInstantStartFlow
    → OneTapWorkout ready to begin
  → onWorkoutStarted (Phase 3 runtime)
```

### In-Session Flow

```
User completes Set 3 of Bench Press
  → onExerciseCompleted (Phase 3)
  → predictNextExercises (Phase 3)
  → buildLivePredictionState (Phase 4)
    → "Next: Incline DB Press (confidence: 0.82)"
  → updateSessionUIState (Phase 4)
    → Updates current exercise context
    → Refreshes smart actions
    → Reorders queue if needed
```

---

## Surface Elements

### Home Surface

| Element | Prominence | Data Source |
|---------|-----------|-------------|
| Today Focus (hero) | Hero | predictedSession + recovery |
| Quick Start cards | Primary/Secondary | quickStarts |
| Recovery badges | Subtle | recoverySnapshot |
| Prediction strip | Subtle | frequency + trend signals |

### Training Surface

| Element | Prominence | Data Source |
|---------|-----------|-------------|
| Current exercise context | Hero | exerciseSnapshots |
| Next exercise prediction | Primary | transitionGraph + context |
| Smart actions | Secondary | fatigue + PR status |
| Session progress | Subtle | elapsed + completed |
| Exercise queue | Subtle | queue state |

### Recommendation Cards

| Field | Description |
|-------|-------------|
| scoreLabel | "Top Pick", "Great Match", "Good Fit", "Try This" |
| confidenceBadge | Green/Yellow/Orange/Red with tooltip |
| reasoning | Array of explainable reasons |
| metadata | Last weight, frequency, recovery, transition probability |
| actions | Primary (Start) + Secondary (Preview) |

---

## Mobile Optimizations

### Update Throttling

- Prediction updates: throttled to 2s intervals
- Surface updates: batched to 500ms intervals
- Critical updates (exercise complete): immediate

### Predictive Preload

When the user is on the last set of an exercise:
- Pre-calculate next predictions
- Pre-render next exercise card
- Reduce perceived latency to <100ms

### Batch Coalescing

Multiple rapid state changes are merged into a single UI update:
- `score_changed` + `queue_reorder` → one re-render
- `fatigue_update` + `set_complete` → one re-render

---

## Empty State Matrix

| Condition | Surface | Headline |
|-----------|---------|----------|
| First visit | `first_workout` | "Welcome to FitCoach" |
| No history | `no_history` | "No workouts yet" |
| >7 days gap | `no_active_session` | "Welcome Back" |
| All recovered | `all_recovered` | "Fully Recovered" |
| Active session | — | Resume flow |

---

## Future Compatibility

The adaptive surface is designed to absorb future intelligence without UI changes:

| Future Addition | Integration Point |
|-----------------|-------------------|
| Goal-based planning | `TodayFocus` goal-aware labeling |
| Equipment detection | `availableEquipment` in context |
| Social features | `hasUnreadContext` badge expansion |
| AI coach (Phase 5) | `reasoning` array enrichment |

The contract layer (`AdaptiveHomeSurface`, `AdaptiveTrainingSurface`) remains stable.

---

## Success Criteria

After Phase 4, the system can:

- [x] Home page shows predictive hero + quick starts, not feature grid
- [x] Training page shows current context + next prediction, not empty form
- [x] Every recommendation has explainable reasoning
- [x] One-tap starts exist for all common flows
- [x] No blank pages — adaptive empty states for all contexts
- [x] In-session UI updates dynamically without full rebuilds
- [x] Mobile updates are throttled, batched, and smooth
- [x] UI is fully decoupled from algorithm internals

**Not in scope**: UI component implementation (React), styling, animations.
