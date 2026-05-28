# FitCoach Predictive Workout Flow

## Overview

The Predictive Workout Flow transforms FitCoach from a **record-keeping app** into a **predictive training runtime**. Instead of starting with a blank search bar, the user is greeted with contextual, one-tap suggestions based on their behavior memory.

> "Not AI coach. Not autonomous planning. Just smart defaults the user can override with one tap."

---

## Philosophy

### Predictive, Not Prescriptive

The system **suggests** — it does not **command**.

- Every prediction has a confidence score and explainable reasoning
- Users can always search manually or override suggestions
- No black-box recommendations

### Deterministic Predictions

All predictions are derived from explicit rules:

| Signal | Source | How It Works |
|--------|--------|--------------|
| Transition Graph | Phase 2 memory | "After bench press, user usually does incline DB press" |
| Recovery State | Phase 2 recovery model | "Chest recovery score = 92 → fully recovered" |
| Frequency | Phase 2 affinity | "User does bench press 3x/week" |
| Time Spacing | Session history | "3 days since last push day" |
| Training Style | Phase 2 style detector | "User is hypertrophy-focused" |

### UI/Logic Decoupling

UI components consume only `src/types/predictive-flow.ts` contracts:

- `PredictiveWorkoutSurface` — the full page surface
- `QuickStartSuggestion` — one-tap cards
- `PredictedExerciseCandidate` — ranked items with reasoning
- `SuggestedExerciseQueue` — complete workout plan

No UI component imports from `src/lib/predictive-flow/` directly.

---

## Architecture

```
src/lib/predictive-flow/
├── session-prediction/       # "What should I train today?"
│   ├── predictWorkoutSession.ts
│   ├── predictWorkoutSplit.ts
│   └── buildWorkoutContext.ts
├── exercise-prediction/      # "What should I do next?"
│   ├── predictNextExercises.ts
│   ├── rankExerciseCandidates.ts
│   └── buildExerciseQueue.ts
├── resume-engine/            # "Continue where I left off"
│   ├── getLastWorkoutSnapshot.ts
│   ├── buildResumeCandidates.ts
│   └── generateResumeSession.ts
├── warmup-engine/            # "How should I warm up?"
│   ├── recommendWarmups.ts
│   └── buildWarmupFlow.ts
├── quick-start/              # "One-tap start"
│   ├── buildQuickStartSuggestions.ts
│   └── generateOneTapWorkout.ts
├── ranking/                  # Context-aware scoring
│   ├── buildContextAwareRanking.ts
│   └── calculatePredictionConfidence.ts
└── runtime/                  # Live workout updates
    ├── onWorkoutStarted.ts
    ├── onExerciseCompleted.ts
    └── updatePredictiveQueue.ts
```

---

## Flow Walkthrough

### 1. Training Page Load

```
User opens /workout
  ↓
System loads BehaviorMemorySnapshot (Phase 2)
  ↓
Builds PredictiveWorkoutSurface:
  - quickStartSuggestions: [Resume Push Day, Pull Day, Quick Session]
  - predictedSession: { split: "pull", confidence: 0.82, reasoning: [...] }
  - muscleRecoverySnapshot: { chest: 95, back: 88, legs: 45 }
  ↓
UI renders suggestion cards + recovery indicators
```

### 2. User Taps "Continue Push Day"

```
OneTapWorkout generated:
  title: "Resume Push Day"
  exercises:
    1. Bench Press — 80kg (suggested +2.5kg from last)
    2. Incline DB Press — 32kg
    3. Cable Fly — 15kg
    4. Tricep Pushdown — 40kg
  warmupFlows:
    - Shoulder activation → Empty bar ramp-up
  ↓
onWorkoutStarted() initializes PredictiveRuntimeState
```

### 3. During the Workout

```
User completes Bench Press
  ↓
onExerciseCompleted() updates runtime state
  ↓
predictNextExercises() fuses:
  - Transition graph: "after bench → incline DB (82%)"
  - Recovery: chest still recovered
  - Muscle balance: chest still has work left
  ↓
UI shows: "Recommended next: Incline DB Press"
```

### 4. Dynamic Re-ranking

```
User skips Cable Fly, does Dips instead
  ↓
updatePredictiveQueue() reorders remaining exercises
  ↓
System updates next predictions based on new current exercise
  ↓
Queue adapts without full rebuild
```

---

## Key Algorithms

### Session Prediction

1. **Recovery scoring**: Calculate average recovery for each split's target muscles
2. **Recency rotation**: If user follows PPL, rotate to the next split in sequence
3. **Style alignment**: Prefer splits matching detected training style
4. **Frequency**: Favor splits done most often in last 30 days

### Exercise Queue Generation

1. **Rank candidates** using Phase 2 affinities + recovery + frequency
2. **Fatigue ordering**: Sort by `fatigueScore` descending (compounds first)
3. **Movement balance**: No more than 2 exercises per movement pattern
4. **Recovery gate**: Skip exercises targeting muscles with recovery < 30
5. **Deduplication**: No duplicate exercises

### Warmup Selection

1. Match exercise target muscles to warmup library
2. Match movement patterns (higher weight)
3. Add activation if `stabilityDemand === 'high'`
4. Add ramp-up if `category === 'strength'`
5. Deduplicate across session

### Confidence Calculation

```
confidence = harmonic_mean(top_3_signals)
isReliable = confidence >= 0.6
```

---

## Future AI Compatibility

The predictive flow is designed so that future AI systems can **enhance** without **replacing** the deterministic core:

| Future Addition | How It Integrates |
|-----------------|-------------------|
| LLM coach | Reads `PredictiveWorkoutSurface` as context, generates motivational copy |
| Advanced recovery model | Replaces Phase 2 recovery scores, same interface |
| Equipment detection | Feeds `availableEquipment` into context |
| Goal-based planning | Adds goal signals to session prediction scoring |

The deterministic layer always remains as the **fallback** and **explainable baseline**.

---

## Success Criteria

After Phase 3, the system can:

- [x] Predict today's likely training split with confidence + reasoning
- [x] Generate "continue previous workout" suggestions
- [x] Suggest a complete exercise queue with warmup
- [x] Predict the next exercise during a live workout
- [x] Re-rank the queue dynamically as the user progresses
- [x] Provide contextual warmup recommendations
- [x] Surface all predictions as one-tap quick starts
- [x] Every prediction has explainable basis signals

**Not in scope**: auto-execution, AI chat coach, autonomous plan modification.
