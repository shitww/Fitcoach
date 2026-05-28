# FitCoach Fitness Knowledge Layer

## Overview

The Fitness Knowledge Layer is a structured, type-safe repository of exercise and nutrition data designed to power:

- Exercise recommendation and substitution
- AI-driven natural language workout logging
- Training program intelligence
- Fast mobile food logging

This is **not** a traditional action library. It is a **Universal Fitness Knowledge Layer** that encodes relationships, biomechanics, and domain semantics in a machine-readable format.

---

## Architecture

```
src/
├── lib/fitness-taxonomy/     # Classification constants & types
│   ├── muscles.ts
│   ├── equipment.ts
│   ├── movement-patterns.ts
│   ├── exercise-categories.ts
│   └── food-categories.ts
├── types/
│   ├── exercise.ts           # Exercise schema
│   └── food.ts               # Food schema
├── data/
│   ├── exercises/            # Exercise knowledge pack
│   │   ├── chest.ts
│   │   ├── back.ts
│   │   ├── shoulders.ts
│   │   ├── legs.ts
│   │   ├── arms.ts
│   │   ├── core.ts
│   │   ├── cardio.ts
│   │   └── index.ts          # Registry & lookup utilities
│   └── foods/                # Food knowledge pack
│       ├── protein.ts
│       ├── carbs.ts
│       ├── fats.ts
│       ├── drinks.ts
│       ├── meals.ts
│       ├── snacks.ts
│       └── index.ts          # Registry & lookup utilities
├── lib/search/               # Search utilities
│   ├── normalizeSearchTerm.ts
│   └── matchAliases.ts
└── lib/validation/           # Schema validators
    ├── validateExercise.ts
    └── validateFood.ts
```

---

## Taxonomy Philosophy

### Why Structured Knowledge Matters

Raw string names (`"bench press"`) are insufficient for a modern fitness app. Without structure, you cannot:

- Suggest a dumbbell alternative when barbells are unavailable
- Filter exercises by spinal load for users with back pain
- Understand that chin-ups and lat pulldowns target the same primary muscle
- Parse "I did some chest stuff today" into actionable data

### Design Principles

1. **Every exercise has a biomechanical identity**: movement pattern, primary/secondary muscles, equipment, stability demands, axial load, and unilateral flag.
2. **Substitutes are explicit, not inferred**: Each exercise lists ordered substitute IDs. This enables deterministic exercise swapping without AI.
3. **Aliases are first-class**: Rich alias lists (slang, Chinese, brand names, abbreviations) power natural language search.
4. **No magic strings**: All taxonomy values are readonly const arrays with exported union types.

---

## Exercise Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Stable kebab-case identifier |
| `name` | string | Primary English display name |
| `aliases` | string[] | Searchable alternative names |
| `movementPattern` | MovementPattern | Biomechanical classification |
| `primaryMuscles` | Muscle[] | Main targets |
| `secondaryMuscles` | Muscle[] | Stabilizers / synergists |
| `muscleGroups` | MuscleGroup[] | High-level groups for UI filtering |
| `equipment` | EquipmentType[] | Required gear |
| `category` | ExerciseCategory | Training goal alignment |
| `fatigueScore` | 1-10 | Systemic CNS/recovery demand |
| `stabilityDemand` | low/moderate/high | Balance requirement |
| `axialLoad` | none/low/moderate/high | Spinal compression intensity |
| `unilateral` | boolean | True if one-sided by design |
| `substituteExerciseIds` | string[] | Ordered alternatives |
| `progressionModel` | ProgressionModel | How to advance over time |
| `tags` | string[] | Free-form searchable labels |
| `difficulty` | beginner/intermediate/advanced | Entry barrier |
| `isCommon` | boolean | Frequency in user logs |

### Progression Models

- `linear`: Add weight each session (compound lifts)
- `double_progression`: Add reps until target, then add weight (dumbbell work)
- `rep_ranges`: Stay within range, adjust weight (hypertrophy)
- `rpe_based`: Autoregulate by RPE/RIR (advanced)
- `bodyweight_progression`: Progress lever/tempo/add weight (calisthenics)
- `time_under_tension`: Progress via tempo/duration (core)
- `distance_progression`: Progress distance/speed (sleds, carries)

---

## Food Schema

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Stable kebab-case identifier |
| `name` | string | Primary English display name |
| `aliases` | string[] | Chinese names, brands, slang |
| `category` | FoodCategory | Macro group alignment |
| `servingSizes` | ServingSize[] | Preset portions |
| `nutritionPer100g` | NutritionPer100g | Canonical reference |
| `tags` | string[] | Searchable labels |
| `restaurantBrands` | RestaurantBrand[] (optional) | Quick-log shortcuts |
| `isCommon` | boolean | Frequency in user logs |
| `giCategory` | low/medium/high (optional) | Future glycemic use |

### Nutrition Philosophy

- Per-100g canonical values enable scaling to any serving size
- Serving size presets enable one-tap logging on mobile
- Focus on **common real foods** with Chinese/Western mix
- Approximate values are acceptable; this is for fitness tracking, not medical nutrition therapy

---

## Search Foundation

The search layer is intentionally lightweight:

- `normalizeSearchTerm()`: trim, lowercase, collapse spaces
- `matchAliases()`: exact and prefix matching against names and aliases
- `matchByTokens()`: multi-token conjunctive matching

**No vector DB, no fuzzy library, no AI search.** The interface is designed so that a future Levenshtein or Fuse.js implementation can be swapped in without changing consumers.

---

## Validation Utilities

Runtime validators ensure data integrity:

- **Exercise**: Checks required fields, enum membership, taxonomy validity, and substitute link integrity (no dangling IDs, no self-references)
- **Food**: Checks required fields, category validity, nutrition non-negativity, and serving size correctness

Run against the full database:

```ts
import { validateAllExercises } from '@/lib/validation/validateExercise';
import { validateAllFoods } from '@/lib/validation/validateFood';

const exResult = validateAllExercises();
const foodResult = validateAllFoods();
```

---

## Future Recommendation Compatibility

The schema is designed to support future recommendation engines without migration:

- **Equipment filtering**: `equipment` array enables gym-availability filtering
- **Injury-aware filtering**: `axialLoad` and `stabilityDemand` enable back-shoulder-knee-safe recommendations
- **Goal alignment**: `category` and `progressionModel` map to training goals
- **Relationship graph**: `substituteExerciseIds` forms a directed graph for exercise swapping
- **Muscle balancing**: `primaryMuscles` and `movementPattern` enable push/pull and volume balancing logic
- **AI parsing**: Rich `aliases` and `tags` provide grounding data for LLM entity extraction

---

## Success Criteria

After Phase 1, the system can:

- [x] Understand action relationships (movement patterns, muscle targeting)
- [x] Understand substitute actions (explicit substitute chains)
- [x] Classify by training mode, equipment, and muscle group
- [x] Support future recommendation systems (schema-ready)
- [x] Support future AI parsing (aliases + taxonomy)

**Not in scope**: recommendation engine, embeddings, vector search, LLM orchestration.
