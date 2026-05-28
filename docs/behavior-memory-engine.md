# FitCoach Behavior Memory Engine

## Overview

The Behavior Memory Engine is a **deterministic, explainable, local-first** system that observes and records how a user trains and eats. It does not make recommendations — it builds the **intelligence foundation** that future recommendation systems will query.

> "Not AI coach. Not auto-planning. Just memory."

---

## Architecture

```
src/lib/behavior-memory/
├── workout-memory/           # Session history → aggregated intelligence
│   ├── buildWorkoutMemory.ts
│   ├── calculateWorkoutStats.ts
│   ├── getRecentExercises.ts
│   ├── getMostFrequentExercises.ts
│   └── getMuscleRecoveryState.ts
├── exercise-graph/           # Action transition patterns
│   ├── buildTransitionGraph.ts
│   ├── getNextLikelyExercises.ts
│   └── calculateExerciseAffinity.ts
├── habit-engine/             # User preference detection
│   ├── calculateExerciseAffinity.ts
│   ├── calculateEquipmentAffinity.ts
│   └── calculateWorkoutStyle.ts
├── food-memory/              # Eating habit memory
│   ├── buildFoodMemory.ts
│   ├── getRecentFoods.ts
│   ├── getFrequentMeals.ts
│   └── calculateMealPatterns.ts
├── analytics/                # Ranking and scoring
│   ├── calculateRecencyScore.ts
│   ├── calculateFrequencyScore.ts
│   └── buildPersonalizedRanking.ts
├── storage/                  # Persistence layer
│   ├── memoryStorage.ts
│   ├── serializeMemory.ts
│   └── deserializeMemory.ts
├── runtime/                  # Event hooks
│   ├── onWorkoutCompleted.ts
│   ├── onFoodLogged.ts
│   └── updateBehaviorMemory.ts
└── validation/               # Integrity checks
    ├── validateBehaviorMemory.ts
    └── detectCorruptedMemory.ts
```

---

## Philosophy

### Deterministic, Not Predictive

All calculations follow explicit mathematical rules:

- **Recency**: Exponential decay with configurable half-life
- **Frequency**: Time-decayed weighted count with saturation
- **Recovery**: Muscle-group-specific daily recovery rate minus volume penalty
- **Transitions**: Count-based probability with recency weighting

No neural networks. No embeddings. No probability distributions learned from data.

### Explainable Outputs

Every score can be decomposed:

```
Recommendation basis for "Bench Press":
- frequency: 0.82 (used in 8 of last 10 sessions)
- recency: 0.65 (last used 5 days ago)
- affinity: 0.90 (user's #1 most-used exercise)
- recovery: 0.95 (chest fully recovered)
- pattern: 0.70 (consistent Monday pattern)
→ totalScore: 0.81
```

### Incremental Updates

When a user logs a workout or food, the system updates incrementally rather than rebuilding everything:

- **Workout**: Append session, update affected exercise snapshots, rebuild recovery
- **Food**: Append log, update food snapshot, check for new meal patterns

---

## Core Models

### Workout Session Memory

```typescript
interface WorkoutSessionMemory {
  workoutId: string;
  date: string;
  durationSec: number;
  exercises: MemoryWorkoutExercise[];
  totalVolume: number;
  muscleGroups: string[];
  estimatedFatigueScore: number; // 0-100
}
```

Built from raw `Workout` + `WorkoutSet[]` data.

### Exercise Performance Snapshot

Aggregated per-exercise history:

| Field | Description |
|-------|-------------|
| `lastWeight` / `lastReps` | Most recent performance |
| `bestWeight` / `best1RMEstimate` | All-time bests |
| `averageVolume` | Rolling average across sessions |
| `recentFrequency` | Sessions in last 30 days |
| `volumeTrend` | `up` / `down` / `stable` / `insufficient_data` |

### Muscle Recovery State

Deterministic model per muscle group:

```
recoveryScore = min(100, daysSince * dailyRate - volumePenalty)
```

- **legs**: 25%/day recovery (4 days to full)
- **back**: 30%/day
- **chest**: 35%/day
- **shoulders**: 40%/day
- **arms**: 50%/day
- **core**: 60%/day

Volume penalty: every 5000 volume units above 3000 baseline = 1 extra "recovery day" subtracted.

---

## Transition Graph

### How It Works

For every workout session, consecutive exercises form directed edges:

```
Bench Press → Incline Dumbbell Press (0.82)
            → Cable Fly (0.64)
            → Dips (0.41)
```

Edge weight = count × recencyDecay, where recencyDecay = 0.5^(daysAgo / 30).

### Query Patterns

- `getNextLikelyExercises(currentId, limit)` — immediate successors
- `getLikelyExercisesAtPosition(starterId, depth)` — BFS walk for planning
- `getCommonStarters(limit)` — exercises most often done first

---

## User Affinity Engine

### Training Style Detection

Rules-based classification:

| Style | Trigger |
|-------|---------|
| strength_focused | >40% sets ≤6 reps, ≤5 exercises/session |
| hypertrophy_focused | >40% sets in 8-15 rep range |
| high_volume | >20 sets/session, >7 exercises/session |
| minimalist | ≤4 exercises/session |
| compound_heavy | >50% compound movement names |
| machine_heavy | >50% machine/cable exercises |
| cardio_focused | >30% sessions include cardio |

Confidence = gap between primary and secondary style scores.

### Equipment Affinity

Inferred from exercise name patterns, scored by usage ratio.

---

## Food Memory

### Meal Pattern Detection

Foods logged under the same `date + mealType` are grouped. Patterns with 2-6 items that appear ≥2 times are stored.

### Pattern Score (Herfindahl Index)

Measures how "repetitive" a meal type is:

```
patternScore = Σ(share_i²)
```

- High (~0.9): User eats the same breakfast every day
- Low (~0.1): User varies meals widely

---

## Ranking Engine

### Personalized Exercise Ranking

Blends 5 factors with configurable weights:

```typescript
const DEFAULT_WEIGHTS = {
  frequency: 0.30,
  recency: 0.25,
  affinity: 0.20,
  recovery: 0.15,
  pattern: 0.10,
};
```

Each factor produces a 0-1 score and an explanation string.

### Personalized Food Ranking

Simpler 2-factor model:

```typescript
score = frequency * 0.5 + recency * 0.4 + mealTypeMatchBonus * 0.1
```

---

## Persistence

### Storage Format

```typescript
interface BehaviorMemorySnapshot {
  version: number;   // schema version for migration
  userId: string;
  createdAt: string;
  updatedAt: string;
  workoutMemory: UserWorkoutMemory;
  foodMemory: UserFoodMemory;
}
```

### localStorage

- Key: `fitcoach:behavior_memory:v1`
- Size: typically <50KB even for 100+ workouts
- SSR-safe: returns null on server

### Serialization

- JSON for localStorage
- Base64 for URL sharing or embedding
- Version field enables future schema migrations

---

## Runtime Hooks

### onWorkoutCompleted

1. Append session to timeline
2. Incrementally update affected exercise snapshots
3. Rebuild recovery snapshot
4. Merge new transitions into graph

### onFoodLogged

1. Append to recent logs (trim to 30 days, 200 entries max)
2. Update food snapshot
3. Check if this log completes a known meal pattern

---

## Validation

### Structural Checks

- Duplicate workout IDs
- Exercise order consistency
- Negative weight/reps
- Recovery score bounds (0-100)
- Frequency ≤ total logs

### Corruption Detection

Returns severity level:

- **critical**: version mismatch, null snapshot
- **warning**: data inconsistency, negative values
- **info**: minor anomalies

---

## Future Compatibility

The memory engine is designed as a **queryable knowledge base** for future systems:

| Future System | What It Queries |
|---------------|-----------------|
| Predictive Workout Flow | `getNextLikelyExercises`, recovery state, recent context |
| Quick Resume | `exerciseSnapshots` → last weight/reps |
| Smart Search Ranking | `buildPersonalizedRanking` scores |
| AI Coach (Phase 5+) | Full memory snapshot as grounding context |
| Meal Suggestions | `mealPatterns`, `getUsualFoodsForMealType` |

No changes needed to the memory engine — it only stores and serves data.

---

## Success Criteria

After Phase 2, the system can:

- [x] Recall recent exercises and their last performance
- [x] Rank exercises by frequency, recency, and affinity
- [x] Predict next likely exercise from transition graph
- [x] Assess muscle recovery state deterministically
- [x] Detect user's training style from patterns
- [x] Remember recent foods and meal patterns
- [x] Provide explainable basis for every score
- [x] Persist and reload from localStorage
- [x] Validate its own data integrity

**Not in scope**: recommendation engine, auto-planning, AI reasoning.
