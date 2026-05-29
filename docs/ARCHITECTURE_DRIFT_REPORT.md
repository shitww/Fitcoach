# Architecture Drift Report

> Version: 1.0
> Phase: Architecture Stabilization Phase 1
> Status: ANALYSIS ONLY — NO REFACTOR PERMITTED

---

## 1. Duplicate Component Candidates

### 1.1 `MetricCard` (exact filename duplication)

| File | Purpose | Risk |
|------|---------|------|
| `src/app/profile/_components/MetricCard.tsx` | Profile page metric tile (editable body metrics) | **HIGH** |
| `src/components/layout/MetricCard.tsx` | Generic layout metric card with sparklines | **HIGH** |

**Finding**: Same filename, different purposes. Both are exported as default. No naming collision today because they live in different directories, but this is a cognitive hazard.

---

### 1.2 `WarmupCard` (exact filename duplication)

| File | Purpose | Risk |
|------|---------|------|
| `src/components/workout/WarmupCard.tsx` | Workout session warmup UI | **HIGH** |
| `src/components/workout/intelligence/WarmupCard.tsx` | Intelligence-layer warmup suggestion card | **HIGH** |

**Finding**: Same filename within the same feature domain (`workout`). One is in the base `workout/` components, the other is inside `intelligence/`. They likely render similar warmup content but may have different data sources.

---

### 1.3 `Card` naming cluster (many "Card"-suffixed components)

| Component | Location | Purpose |
|-----------|----------|---------|
| `Card` | `src/components/design-system/Card.tsx` | Design-system generic card wrapper |
| `card` | `src/components/ui/card.tsx` | shadcn/ui primitive (lowercase export convention) |
| `NutritionCard` | `src/components/NutritionCard.tsx` | Diet summary card |
| `StreakCard` | `src/components/StreakCard.tsx` | Streak display card |
| `TodayWorkoutCard` | `src/components/TodayWorkoutCard.tsx` | Today's workout preview card |
| `TrainingIdentityCard` | `src/components/TrainingIdentityCard.tsx` | Training identity card |
| `BodyKpiCard` | `src/app/profile/_components/BodyKpiCard.tsx` | Profile body KPI card |
| `IdentityCard` | `src/app/profile/_components/IdentityCard.tsx` | Profile identity card |
| `ShareWorkoutCard` | `src/components/workout/ShareWorkoutCard.tsx` | Workout share card |
| `WorkoutCompletionCard` | `src/components/workout/WorkoutCompletionCard.tsx` | Post-workout completion card |
| `WarmupCard` | `src/components/workout/WarmupCard.tsx` | Workout warmup card |
| `ActiveExerciseCard` | `src/components/workout/ActiveExerciseCard.tsx` | Active exercise card |
| `ChapterCompletionSurface` | `src/components/workout/ChapterCompletionSurface.tsx` | Chapter completion (surface, not card) |
| `ConsistencyRhythmCard` | `src/app/_home/ConsistencyRhythmCard.tsx` | Home rhythm card |
| `SessionReflectionCard` | `src/app/_home/SessionReflectionCard.tsx` | Home reflection card |
| `QuickStats` | `src/app/diet-analysis/_components/QuickStats.tsx` | Diet stats (no "Card" suffix) |

**Finding**: Heavy proliferation of `*Card` components. No strict duplicates, but the pattern suggests an under-utilized shared `Card` primitive. The design-system `Card` and shadcn `card` may be competing for the same role.

---

### 1.4 `Skeleton` naming cluster

| Component | Location | Purpose |
|-----------|----------|---------|
| `CriticalBSkeleton` | `src/app/_home/CriticalBSkeleton.tsx` | Home critical boundary skeleton |
| `PageSkeleton` | `src/components/PageSkeleton.tsx` | Generic page skeleton |
| `Skeleton` | `src/components/Skeleton.tsx` | Generic skeleton primitives |

**Finding**: `PageSkeleton` and `Skeleton` may overlap in scope. `CriticalBSkeleton` is domain-specific.

---

## 2. Suspicious Naming Patterns

### 2.1 "Island" suffix (Next.js loading/streaming wrappers)

| File | Parent | Purpose |
|------|--------|---------|
| `HomeCriticalIsland.tsx` | `src/app/_home/` | Critical island wrapper |
| `HomeDeferredIsland.tsx` | `src/app/_home/` | Deferred island wrapper |
| `HomeHeroIsland.tsx` | `src/app/_home/` | Hero island wrapper |
| `StreakCardIsland.tsx` | `src/app/_home/` | Streak card island wrapper |
| `DietClientIsland.tsx` | `src/app/diet-analysis/_components/` | Diet client island wrapper |
| `QuickStatsIsland.tsx` | `src/app/diet-analysis/_components/` | Quick stats island wrapper |

**Finding**: The "Island" suffix is a known Next.js 16 / React Server Components pattern (async boundaries / `unstable_after` / streaming wrappers). Not a forbidden pattern per se, but **must be documented** in the Feature Registry because it is an architectural convention. Current registry entry added.

---

### 2.2 "Client" suffix

| File | Parent | Purpose |
|------|--------|---------|
| `DietClient.tsx` | `src/app/diet-analysis/_components/` | Diet analysis client component |
| `DietClientIsland.tsx` | `src/app/diet-analysis/_components/` | Island wrapper for DietClient |
| `ClientProviders.tsx` | `src/components/` | Global client-side providers |

**Finding**: `DietClient` + `DietClientIsland` pair suggests a manual client/server split. The naming is descriptive, but `Client` alone is vague. Not flagged as violation, but noted for future standardization.

---

### 2.3 Forbidden pattern scan (V2, copy, new, final, enhanced)

**Result**: No file or folder names matching `V2`, `v2`, `V3`, `v3`, `Copy`, `copy`, `New`, `new`, `Final`, `final`, `Enhanced`, `enhanced` were found in `src/`.

> The grep scan did find many occurrences of the **words** `new`, `final`, etc. inside code bodies (e.g., `new Date()`, variable names like `finalSet`). These are **NOT naming-pattern violations** because they are not in filenames, folder names, or exported symbol names.

---

## 3. Orphan-like Modules (low or unclear inbound references)

| Module | Location | Suspicion |
|--------|----------|-----------|
| `src/components/AmbientGlow.tsx` | Shared components | Appears to be a visual effect component. Need to verify if referenced by any page. |
| `src/components/FloatingTimer.tsx` | Shared components | Large file (12KB). May be referenced by workout or a global timer feature. Verify if still in use. |
| `src/components/EmptyState.tsx` | Shared components | Generic empty state. Verify all call sites. |
| `src/components/PullToRefresh.tsx` | Shared components | Mobile gesture component. Verify integration. |
| `src/components/Toast.tsx` | Shared components | Custom toast system. Check if it coexists with a third-party toast library. |
| `src/lib/dashboard-bootstrap.ts` | Lib | 4.7KB. May be a one-time setup script that ran and is now dead code. |
| `src/lib/sw-reload.ts` | Lib | Service-worker reload utility. Verify if still invoked. |
| `src/lib/kv/` | Lib | Key-value store wrapper. Verify usage. |
| `src/lib/search/` | Lib | Search utilities. Verify if used by ExercisePicker or FoodSearch. |
| `src/lib/rate-limit.ts` | Lib | Rate limiting. Verify if used by API routes. |

**Action**: Each of the above should be verified with `grep` for import references. If unreferenced, flag for deprecation review in Phase 2.

---

## 4. Overlapping UI Components

### 4.1 `ExercisePicker` vs `ExerciseQuickLauncher`

| Component | Location | Purpose |
|-----------|----------|---------|
| `ExercisePicker` | `src/components/ExercisePicker.tsx` (39KB) | Full exercise selection UI |
| `ExerciseQuickLauncher` | `src/app/workout/components/ExerciseQuickLauncher.tsx` (5.7KB) | Workout-page quick launcher |

**Finding**: Both allow exercise selection. `ExercisePicker` is large and shared; `ExerciseQuickLauncher` is workout-local. Risk of divergent selection UX.

---

### 4.2 `FoodSearch` vs `MyFoodsPanel`

| Component | Location | Purpose |
|-----------|----------|---------|
| `FoodSearch` | `src/components/FoodSearch.tsx` (57KB) | Global food search |
| `MyFoodsPanel` | `src/components/MyFoodsPanel.tsx` (12KB) | User's saved foods |

**Finding**: These likely work together, but `FoodSearch` is very large (57KB). May contain inline logic that should be in `lib/`.

---

### 4.3 `diet/` vs `diet-analysis/`

| Route | Entry | Purpose |
|-------|-------|---------|
| `src/app/diet/page.tsx` | Diet logging | Log meals |
| `src/app/diet-analysis/page.tsx` | Diet analysis | View analysis, trends, AI insights |

**Finding**: Two distinct but related diet features. No duplicate components detected, but the domain split should be explicit in documentation. If they ever share UI, that shared UI must be extracted to `src/components/`.

---

### 4.4 `BottomTabBar` vs `AppShell`

| Component | Location | Purpose |
|-----------|----------|---------|
| `AppShell` | `src/components/AppShell.tsx` | High-level app shell wrapper |
| `BottomTabBar` | `src/components/BottomTabBar.tsx` | Mobile bottom tab navigation |

**Finding**: `AppShell` may or may not include `BottomTabBar`. Verify parent-child relationship. If `AppShell` is just a wrapper around `BottomTabBar`, consider merging or clarifying roles.

---

## 5. Summary Table

| Risk Category | Count | Severity |
|---------------|-------|----------|
| Exact filename duplicates | 2 (`MetricCard`, `WarmupCard`) | 🔴 High |
| Naming cluster (`*Card`) | 15+ components | 🟡 Medium |
| Naming cluster (`*Skeleton`) | 3 components | 🟡 Medium |
| Island wrappers undocumented | 6 files | 🟡 Medium |
| Orphan-like modules | 10 modules | 🟡 Medium |
| Overlapping UI domains | 4 pairs | 🟡 Medium |
| Forbidden naming patterns | 0 found | 🟢 Low |

---

## 6. Recommendations for Phase 2

1. **Resolve `MetricCard` duplication** — Decide which is canonical; rename or merge.
2. **Resolve `WarmupCard` duplication** — Merge or namespace under `workout/warmup/`.
3. **Audit `*Card` proliferation** — Evaluate if design-system `Card` can absorb more usage.
4. **Verify orphan modules** — Run import-reference checks on the 10 flagged modules.
5. **Document Island convention** — Add a short ADR (Architecture Decision Record) explaining the Island suffix pattern.

---

*Generated during Architecture Stabilization Phase 1. No production code was modified.*
