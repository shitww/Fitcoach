# FitCoach Frictionless Input Runtime

## Philosophy

> "The user should not feel like they are recording data. They should feel like the system already understands their training — and they are simply confirming it."

Phase 5 eliminates the last source of friction in FitCoach: **manual input**.

### The Old Flow (❌ High friction)

1. Finish set
2. Open log form
3. Type weight
4. Type reps
5. Tap save
6. Repeat 30× per session

### The New Flow (✅ Zero friction)

1. Finish set
2. System shows: **"82.5kg × 8 — +2.5kg from last session"**
3. Tap ✓ to confirm
4. Done

---

## Architecture

```
src/lib/frictionless-runtime/
├── set-prediction/          # Predictive load suggestion
│   ├── predictNextSet.ts    # Top-level entry point
│   ├── buildSetSuggestion.ts
│   └── calculateProgressiveLoad.ts
├── quick-log/               # One-tap set logging
│   ├── buildQuickSetActions.ts
│   ├── generateRepeatSet.ts
│   ├── generateDropSet.ts
│   ├── generateWarmupSet.ts
│   └── meal/
│       ├── buildMealQuickActions.ts
│       ├── generateRecentMealSuggestions.ts
│       └── generateFrequentMealPatterns.ts
├── momentum/                # Session flow detection
│   ├── calculateWorkoutMomentum.ts
│   ├── detectWorkoutDropoff.ts
│   └── buildMomentumActions.ts
├── rest-runtime/            # Smart rest timer
│   ├── calculateRestTime.ts
│   ├── buildRestTimer.ts
│   └── detectRestCompletion.ts
├── food-parsing/            # NLP food parsing
│   ├── parseFoodText.ts
│   ├── extractFoodCandidates.ts
│   └── estimateFoodServing.ts
└── input-runtime/           # Real-time intent prediction
    ├── predictInputIntent.ts
    ├── buildInlineSuggestions.ts
    ├── detectLoggingIntent.ts
    └── mobile/
        ├── batchInputPredictions.ts
        ├── optimizeKeyboardFlow.ts
        └── throttleInputUpdates.ts
```

---

## UI Contracts

All UI components consume only `src/types/frictionless-runtime.ts`:

| Contract | Purpose |
|----------|---------|
| `PredictedSetSuggestion` | Next set prediction with reasoning |
| `QuickSetAction` | One-tap set log action |
| `QuickSetActionPanel` | Primary + secondary action panel |
| `WorkoutMomentumState` | Real-time session flow score |
| `WorkoutDropoffSignal` | Inactivity / dropoff detection |
| `RestRecommendation` | Smart rest time suggestion |
| `RestTimerState` | Live countdown state |
| `ParsedFoodCandidate` | Parsed food from natural language |
| `FoodParseResult` | Full parse result with confidence |
| `QuickMealSuggestion` | One-tap meal repeat option |
| `InputIntentPrediction` | Real-time input type prediction |
| `InlineInputSuggestion` | Autocomplete suggestion |

---

## Set Prediction Model

### Inputs (all from Phase 2 memory)

| Signal | Source | Weight |
|--------|--------|--------|
| Last session weight × reps | `ExercisePerformanceSnapshot` | High |
| Current session sets (intra-session fatigue) | Live session state | High |
| Volume trend (up/down/stable) | Phase 2 memory | Medium |
| Fatigue estimate (0-100) | Session runtime | Medium |
| Workout style (strength/hypertrophy) | User preference | Low |

### Progression Logic

```
if (last_session_clean AND trend_up):
  → +2.5kg (progressive overload)
elif (last_session_clean AND trend_stable):
  → +1 rep (double progression)
elif (last_session_failure):
  → same weight (consolidate)
elif (fatigue > 70):
  → -10% (deload)
else:
  → same as last session
```

### Output Example

```
suggestedWeight: 82.5
suggestedReps: 8
confidence: 0.87
progressionType: "progressive_overload"
delta: { label: "+2.5kg from last session" }
reasoning: [
  { type: "recent_history", text: "Last session: 80kg × 8" },
  { type: "training_style", text: "Volume trending up — time to progress" }
]
```

---

## One-Tap Set Logging

Every set presents **one primary action** + **3 alternatives**:

| Action | Label | Condition |
|--------|-------|-----------|
| Primary | `✓ 82.5kg × 8 (+2.5kg)` | System prediction |
| Heavy | `+2.5kg → 85kg × 8` | Alternative |
| Light | `-2.5kg → 80kg × 8` | Alternative |
| Custom | keyboard input | Always available |

Warmup sets are auto-generated using the standard protocol:

```
Set 1: 40% × 12 (Activation)
Set 2: 60% × 8  (Ramp Up)
Set 3: 80% × 3  (Heavy Warmup)
```

---

## Session Momentum

The momentum engine prevents session abandonment by monitoring inactivity.

### Status Levels

| Status | Threshold | UI Response |
|--------|-----------|-------------|
| `flowing` | < 1.5× expected rest | No prompt |
| `slowing` | 1.5-2.5× expected rest | Gentle: "Ready early?" |
| `stalled` | 2.5-4× expected rest | Prompt: "Skip to next?" |
| `dropped` | > 4× expected rest | Alert: "Still training?" |

### Dropoff Risk

A score from 0-1 representing the probability of session abandonment:

- High rest time ratio → higher risk
- Few sets completed → higher risk (cold exit)
- Progressive completion → lower risk

---

## Smart Rest Timer

Rest recommendations are exercise-aware:

| Context | Recommended Rest |
|---------|-----------------|
| Strength (compound) | 3-5 min |
| Hypertrophy | 60-90s |
| Endurance | 30-45s |
| Near failure | +50% |
| PR attempt | Maximum |
| High fatigue | +20% |

The timer tracks:
- `urgency: waiting → ready_soon → ready → overdue`
- `completionType: timer_expired | user_ready | auto_advance`
- Whether the user rested early/late vs recommendation

---

## Natural Language Food Parsing

### Deterministic, No AI

The parser uses a local food database with aliases — no external API calls.

### Example

```
Input: "中午吃了牛肉面和奶茶"

Tokenization: ["中午", "吃了", "牛肉面", "和", "奶茶"]
Stop words removed: ["牛肉面", "奶茶"]
Alias matching:
  "牛肉面" → 牛肉面 (exact) → 550 kcal
  "奶茶"   → 珍珠奶茶 (alias) → 350 kcal

Result:
  candidates: [{ name: "牛肉面", cal: 550 }, { name: "珍珠奶茶", cal: 350 }]
  totalCalorieEstimate: 900
  parseConfidence: 0.9
```

### Supported Languages

- Chinese (Simplified): full support with aliases
- English: full support
- Mixed: both resolved simultaneously

### Serving Size Detection

Patterns: `1碗`, `2杯`, `100g`, `1 bowl`, `large`, `小份`, etc.
Calories adjust proportionally: `1碗 牛肉面 = 550 kcal`, `大碗 = 770 kcal`

---

## Input Intent Prediction

The system detects what type of data the user is entering **in real time**.

### Examples

| Input | Context | Detected Intent | Confidence |
|-------|---------|-----------------|-----------|
| `80` | In workout | `weight_kg` | 0.80 |
| `8` | In workout | `reps` | 0.75 |
| `@8` | In workout | `rpe` | 0.90 |
| `牛肉面` | Food log | `food_name` | 0.85 |
| `bench` | Exercise search | `exercise_name` | 0.75 |
| `80kg` | Anywhere | `weight_kg` | 0.95 |

### Auto-fill

When `intentConfidence ≥ 0.9` AND `bestMatch.confidence ≥ 0.9`:
- Best suggestion is applied automatically
- User can still override with keyboard

---

## Mobile Input Optimization

### Keyboard Configuration

Each field automatically gets the correct keyboard type:

| Field | Input Mode | Behavior |
|-------|-----------|----------|
| Weight | `decimal` | Select-all on focus |
| Reps | `numeric` | Select-all on focus |
| RIR/RPE | `decimal` | Select-all on focus |
| Exercise | `text` | Search mode |
| Food | `text` | Clear on submit |

### Throttle / Batch Strategy

- Predictions throttled to max 1 per **150ms**
- Rapid keystrokes batched — only **latest** processed
- Critical actions (log set, log food) process **immediately**
- Keyboard dismissed **200ms** after logging

### Field Transition

Weight field → [Enter] → Reps field → [Enter] → (RIR if enabled) → Done

Eliminates need for manual field-tapping between weight and reps.

---

## Quick Meal Capture

Three entry points for food logging:

### 1. Repeat Yesterday
One tap to log the same meal as yesterday at the same time:
`"Yesterday's Lunch → 牛肉面 · 珍珠奶茶 · ~900 kcal"`

### 2. Recent Meals
Sorted by recency, filtered by current meal time:
`"Today's meal → 燕麦 · ~158 kcal"`

### 3. Frequent Patterns
Combinations appearing ≥2× in history:
`"Breakfast Habit → 燕麦 + 鸡蛋 · ~236 kcal · 5×"`

---

## Future Compatibility

The frictionless runtime is designed to accept richer signals without API changes:

| Future Feature | Integration Point |
|----------------|-------------------|
| Heart rate monitor | `fatigueEstimate` enrichment |
| Wearable rest detection | `detectRestCompletion` signal |
| Voice logging | `parseFoodText` input pipe |
| Barcode scan | `extractFoodCandidates` bypass |
| Vision calorie estimate | `ParsedFoodCandidate.confidence` |

The type contracts remain stable — only algorithm inputs change.

---

## Success Criteria

After Phase 5, the system delivers:

### Workout Logging
- [x] Auto-predicts next set weight + reps
- [x] One-tap repeat / increase / drop set
- [x] Warmup sets auto-filled
- [x] Progressive overload calculated automatically

### Session Flow
- [x] Real-time momentum score
- [x] Inactivity detection with typed warnings
- [x] Smart rest recommendations per exercise type
- [x] Live countdown timer with urgency states

### Food Logging
- [x] Chinese + English NLP parsing
- [x] Calorie estimation from local database
- [x] Repeat yesterday's meal in one tap
- [x] Frequent pattern suggestions

### Input Runtime
- [x] Real-time intent detection per keystroke
- [x] Autocomplete from session history
- [x] Auto-fill for high-confidence values
- [x] Mobile keyboard optimized per field
- [x] Batched predictions — no UI jank

### Definition of Done

> The user no longer feels like they are "recording training data."
> They feel like the system already understood their workout —
> and they are simply confirming what it knows.
