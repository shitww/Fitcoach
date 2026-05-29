# FitCoach Feature Registry

> Version: 1.3
> Phase: Architecture Self-Healing Layer Phase 5
> Source: Automated scan of `src/app/` and `src/components/`

---

## Legend

- **Entry**: Official entry point for the feature
- **Core**: Production-stable components/hooks/lib modules
- **Experimental**: Unstable or duplicated modules (flagged for review)
- **Deprecated**: Modules scheduled for removal
- **Canonical** `(✓)`: Primary, authoritative implementation
- **Secondary** `(~)`: Valid but non-canonical; may be merged or renamed in future
- **Replaced by**: Path to the canonical successor module

---

## Feature: Home / Dashboard

| Field | Value |
|-------|-------|
| **Entry** | `src/app/page.tsx` |
| **Core Components** | `src/app/_home/HomeShell.tsx`, `src/app/_home/HomeHero.tsx`, `src/app/_home/QuickWorkoutEntry.tsx`, `src/app/_home/ConsistencyRhythmCard.tsx`, `src/app/_home/MomentumBand.tsx`, `src/app/_home/RecoveryStatus.tsx`, `src/app/_home/TodayProgressRing.tsx`, `src/app/_home/LiveWorkoutResume.tsx`, `src/app/_home/RecentExercisesStrip.tsx`, `src/app/_home/SessionReflectionCard.tsx`, `src/app/_home/ProgressNarrativeSurface.tsx`, `src/app/_home/ExtendedWidgets.tsx`, `src/app/_home/CriticalBWidgets.tsx`, `src/components/StreakCard.tsx`, `src/components/TodayWorkoutCard.tsx` |
| **Island Wrappers** | `src/app/_home/HomeCriticalIsland.tsx`, `src/app/_home/HomeDeferredIsland.tsx`, `src/app/_home/HomeHeroIsland.tsx`, `src/app/_home/StreakCardIsland.tsx` |
| **Skeletons** | `src/app/_home/CriticalBSkeleton.tsx` |
| **Experimental** | — |
| **Deprecated** | — |
| **Enforcement Status** | Active. Island wrappers must not multiply beyond 4 per page. Card-like components must compose design-system/Card. |
| **Duplication Risk** | Medium — high card-like component count; island wrapper proliferation risk. |
| **Allowed Secondary Components** | Local `_components/` scoped to page only. No new global card components without justification. |

---

## Feature: Authentication

| Field | Value |
|-------|-------|
| **Entry** | `src/app/auth/page.tsx` (or relevant auth route) |
| **Core** | `src/lib/auth.ts`, `src/components/SessionProvider.tsx`, `src/app/providers.tsx`, `src/hooks/useRequireAuth.ts` |
| **Proxy** | `src/proxy.ts` (NextAuth v5 `auth()` wrapper — Next.js 16 convention) |
| **Experimental** | — |
| **Deprecated** | — |
| **Enforcement Status** | Active. No secondary auth providers. |
| **Duplication Risk** | Low — single system. |
| **Allowed Secondary Components** | None. |

---

## Feature: Workout Session (Active)

| Field | Value |
|-------|-------|
| **Entry** | `src/app/workout/page.tsx` |
| **Core Components** | `src/app/workout/WorkoutController.tsx`, `src/app/workout/HeroExerciseSurface.tsx`, `src/app/workout/RuntimeQueueRail.tsx`, `src/app/workout/RuntimeLoggingPanel.tsx`, `src/components/workout/ActiveExerciseCard.tsx`, `src/components/workout/SetRow.tsx`, `src/components/workout/NumberPad.tsx`, `src/components/workout/RestBar.tsx`, `src/components/workout/RestOverlay.tsx`, `src/components/workout/RestTimerPill.tsx`, `src/components/workout/TrainingStatusBar.tsx`, `src/components/workout/VolumeChartMini.tsx`, `src/components/workout/WorkoutCompletionCard.tsx`, `src/components/workout/ChapterCompletionSurface.tsx`, `src/components/workout/ExerciseHistoryStrip.tsx`, `src/components/workout/ShareWorkoutCard.tsx`, `src/components/workout/SessionRecoveryDialog.tsx` |
| **Intelligence Subsystem** | `src/components/workout/intelligence/WorkoutIntelligenceLayer.tsx`, `src/components/workout/intelligence/ContextualTipPill.tsx`, `src/components/workout/intelligence/FatigueBanner.tsx`, `src/components/workout/intelligence/InsightRow.tsx`, `src/components/workout/intelligence/ProgressionBadge.tsx`, `src/components/workout/intelligence/RecoveryStatusPill.tsx`, `src/components/workout/intelligence/WarmupCard.tsx` |
| **Canonical WarmupCard** | `src/components/workout/intelligence/WarmupCard.tsx` — consumes structured `WarmupPlan`, part of intelligence layer |
| **Secondary WarmupCard** | `src/components/workout/WarmupCard.tsx` — standalone UI with self-generated suggestions; used by `WorkoutController` and `ActiveExerciseCard` directly |
| **OS Subsystem** | `src/components/workout/os/OSBadge.tsx`, `src/components/workout/os/OSDisplay.tsx`, `src/components/workout/os/OSNarrativeBanner.tsx`, `src/components/workout/os/OSStatusLine.tsx`, `src/components/workout/os/OSSuggestionChip.tsx` |
| **Hooks** | `src/hooks/useWorkoutUI.ts`, `src/hooks/useWorkoutEffects.ts`, `src/hooks/useWorkoutHint.ts`, `src/hooks/useWorkoutDebug.ts`, `src/hooks/useTrainingOS.ts` |
| **Lib** | `src/lib/workout-service.ts`, `src/lib/workout-runtime/`, `src/lib/workout-pr.ts`, `src/lib/workout/`, `src/lib/frictionless-runtime/`, `src/lib/runtime-core/`, `src/lib/runtime-reliability/` |
| **Experimental** | — |
| **Deprecated** | — |
| **Enforcement Status** | Active. WarmupCard duplication under migration watch. No new standalone warmup UI. |
| **Duplication Risk** | High — WarmupCard duplicate exists; many card-like surfaces; intelligence subsystem boundary must be respected. |
| **Allowed Secondary Components** | ExerciseQuickLauncher (delegates to canonical picker). Intelligence-layer pills/banners. |

---

## Feature: Diet & Nutrition

| Field | Value |
|-------|-------|
| **Entry (Logging)** | `src/app/diet/page.tsx` — canonical for **Food Logging** (meal entry, CRUD, daily tracking) |
| **Entry (Insights)** | `src/app/diet-analysis/page.tsx` — canonical for **Diet Insights** (analytics, trends, AI analysis, read-only) |
| **Core Components** | `src/components/FoodSearch.tsx`, `src/components/MyFoodsPanel.tsx`, `src/components/NutritionCard.tsx`, `src/app/diet-analysis/_components/DietAiHeavy.tsx`, `src/app/diet-analysis/_components/DietClient.tsx`, `src/app/diet-analysis/_components/QuickStats.tsx`, `src/app/diet-analysis/_components/WeeklyTrendsCharts.tsx` |
| **Island Wrappers** | `src/app/diet-analysis/_components/DietClientIsland.tsx`, `src/app/diet-analysis/_components/QuickStatsIsland.tsx` |
| **Lib** | `src/lib/diet-analysis.ts`, `src/lib/behavior-memory/food-memory/`, `src/lib/health/` |
| **Boundary Rule** | `diet/` = input only; `diet-analysis/` = output only. No shared UI components exist today; any future shared components must live in `src/components/diet/` |
| **Experimental** | — |
| **Deprecated** | — |
| **Enforcement Status** | Active. `diet/` and `diet-analysis/` must not merge. |
| **Duplication Risk** | Medium — FoodSearch is large; potential for second search/picker. |
| **Allowed Secondary Components** | None today. Future: `src/components/diet/` shared primitives only. |

---

## Feature: Profile & Body Metrics

| Field | Value |
|-------|-------|
| **Entry** | `src/app/profile/page.tsx` |
| **Core Components** | `src/app/profile/_components/BodyKpiCard.tsx`, `src/app/profile/_components/IdentityCard.tsx`, `src/app/profile/_components/MetricEditorSheet.tsx`, `src/components/TrainingIdentityCard.tsx` |
| **Secondary Component** | `src/app/profile/_components/MetricCard.tsx` — profile-specific metric tile (`valueText` + `timeText` + `onClick`). **Not canonical**; collision with `src/components/layout/MetricCard.tsx`. Future rename candidate: `BodyMetricTile` |
| **Lib** | `src/lib/body-metrics.ts`, `src/lib/user-storage.ts`, `src/lib/get-db-user.ts` |
| **Experimental** | — |
| **Deprecated** | — |
| **Enforcement Status** | Active. MetricCard (profile) flagged for rename. No new metric display outside layout/MetricCard. |
| **Duplication Risk** | High — MetricCard filename collision; BodyKpiCard and TrainingIdentityCard both display identity metrics. |
| **Allowed Secondary Components** | None. Use layout/MetricCard variants or compose them. |

---

## Feature: Exercise Catalog

| Field | Value |
|-------|-------|
| **Entry** | `src/app/exercises/page.tsx` (or `src/app/exercise/page.tsx`) |
| **Canonical Component** | `src/components/ExercisePicker.tsx` — full modal exercise selection with search, categories, muscle groups, custom exercise CRUD, DB integration |
| **Secondary Component** | `src/app/workout/components/ExerciseQuickLauncher.tsx` — muscle-group scoped quick chips; valid shortcut that delegates to ExercisePicker via `onOpenSearch` or selects directly |
| **Lib** | `src/lib/exercise-constants.ts`, `src/lib/fitness-taxonomy/`, `src/lib/muscle-keywords.ts`, `src/lib/validation/validateExercise.ts` |
| **Experimental** | — |
| **Deprecated** | — |
| **Enforcement Status** | Active. ExercisePicker is the one true picker. |
| **Duplication Risk** | High — ExerciseQuickLauncher must not grow into a second picker. |
| **Allowed Secondary Components** | ExerciseQuickLauncher (shortcut only). No new picker/selector. |

---

## Feature: Calendar

| Field | Value |
|-------|-------|
| **Entry** | `src/app/calendar/page.tsx` |
| **Core Components** | `src/components/WorkoutMonthCalendar.tsx` |
| **Lib** | `src/lib/date-range.ts` |
| **Experimental** | — |
| **Deprecated** | — |
| **Enforcement Status** | Active. |
| **Duplication Risk** | Low — single calendar component. |
| **Allowed Secondary Components** | None. |

---

## Feature: History & Logs

| Field | Value |
|-------|-------|
| **Entry** | `src/app/history/page.tsx`, `src/app/training-log/page.tsx`, `src/app/summary/page.tsx`, `src/app/muscle-history/page.tsx` |
| **Lib** | `src/lib/workout-summary.ts`, `src/lib/behavior-memory/workout-memory/` |
| **Experimental** | — |
| **Deprecated** | — |
| **Enforcement Status** | Active. |
| **Duplication Risk** | Low — read-only surfaces. |
| **Allowed Secondary Components** | None. |

---

## Feature: Plans & Goals

| Field | Value |
|-------|-------|
| **Entry** | `src/app/plans/page.tsx`, `src/app/goals/page.tsx` |
| **Lib** | `src/lib/training/`, `src/lib/predictive-flow/`, `src/lib/adaptive-surface/` |
| **Experimental** | — |
| **Deprecated** | — |
| **Enforcement Status** | Active. |
| **Duplication Risk** | Low — plan generation and goal tracking are distinct. |
| **Allowed Secondary Components** | None. |

---

## Feature: Analytics

| Field | Value |
|-------|-------|
| **Entry** | `src/app/analytics/volume/page.tsx`, other analytics subroutes |
| **Lib** | `src/lib/dashboard.ts`, `src/lib/dashboard-bootstrap.ts` |
| **Experimental** | — |
| **Deprecated** | — |
| **Enforcement Status** | Active. Metric display MUST use layout/MetricCard variants. |
| **Duplication Risk** | Medium — analytics pages tend to spawn custom metric cards. |
| **Allowed Secondary Components** | None. Compose HeroMetricCard / TrendMetricCard. |

---

## Feature: AI Coaching

| Field | Value |
|-------|-------|
| **Entry** | `src/app/chat/page.tsx` (chat interface), `src/app/api/chat/route.ts` (API) |
| **Core Components** | `src/components/ai-coaching/FatigueScore.tsx`, `src/components/ai-coaching/MuscleHeatmap.tsx`, `src/components/ai-coaching/ProgressiveOverloadPanel.tsx`, `src/components/ai-coaching/SmartWorkoutSuggestion.tsx` |
| **Hooks** | `src/hooks/useAdaptiveIntelligence.ts`, `src/hooks/useTrainingIntelligence.ts` |
| **Lib** | `src/lib/ai/`, `src/lib/emotional-runtime/` |
| **Experimental** | — |
| **Deprecated** | — |
| **Enforcement Status** | Active. |
| **Duplication Risk** | Low — AI coaching components are domain-specific. |
| **Allowed Secondary Components** | None. |

---

## Feature: PWA / Offline

| Field | Value |
|-------|-------|
| **Entry** | `src/app/manifest.ts`, `src/app/layout.tsx` (registers PWA logic) |
| **Core Components** | `src/components/PWAInstallPrompt.tsx`, `src/components/PWARegister.tsx`, `src/components/PWAUpdateBanner.tsx`, `src/components/OfflineStatusBar.tsx`, `src/components/OfflineToast.tsx`, `src/components/SyncEngineInit.tsx` |
| **Lib** | `src/lib/offline/`, `src/lib/pwa-utils.ts`, `src/lib/sw-reload.ts` |
| **Experimental** | — |
| **Deprecated** | — |
| **Enforcement Status** | Active. |
| **Duplication Risk** | Low — PWA components are stable. |
| **Allowed Secondary Components** | None. |

---

## Feature: Design System

| Field | Value |
|-------|-------|
| **Entry** | `src/components/design-system/index.ts` |
| **Core Components** | `src/components/design-system/Card.tsx`, `src/components/design-system/StateBadge.tsx`, `src/components/design-system/Typography.tsx` |
| **shadcn/ui** | `src/components/ui/badge.tsx`, `src/components/ui/button.tsx`, `src/components/ui/card.tsx`, `src/components/ui/dialog.tsx`, `src/components/ui/input.tsx`, `src/components/ui/label.tsx`, `src/components/ui/select.tsx`, `src/components/ui/textarea.tsx` |
| **Layout (Canonical)** | `src/components/layout/MetricCard.tsx` — canonical metric card family (`HeroMetricCard`, `CompactMetricCard`, `InlineMetricCard`, `TrendMetricCard`). Used by analytics/health pages. |
| **Layout** | `src/components/layout/PageShell.tsx` |
| **Experimental** | — |
| **Deprecated** | — |
| **Enforcement Status** | Active. Card primitive must not be duplicated. MetricCard family is canonical. |
| **Duplication Risk** | High — every feature eventually needs cards, inputs, badges; these must extend, not duplicate. |
| **Allowed Secondary Components** | shadcn/ui primitives are canonical low-level. design-system/Card is canonical high-level wrapper. New components must compose, not replace. |

---

## Feature: Settings

| Field | Value |
|-------|-------|
| **Entry** | `src/app/settings/page.tsx` |
| **Lib** | `src/lib/themes.ts` |
| **Experimental** | — |
| **Deprecated** | — |
| **Enforcement Status** | Active. |
| **Duplication Risk** | Low — settings are declarative. |
| **Allowed Secondary Components** | None. |

---

---

## Phase 2 Convergence Decisions

### Canonical Decisions List

| Module | Canonical | Ownership | Replaced By | Notes |
|--------|-----------|-----------|-------------|-------|
| `src/components/layout/MetricCard.tsx` | **YES** | design-system / layout | — | Generic metric card family with 4 variants (Hero, Compact, Inline, Trend). Serves analytics and any feature needing a metric display. |
| `src/app/profile/_components/MetricCard.tsx` | **NO** | profile | `src/components/layout/MetricCard.tsx` (conceptually) | Profile-specific metric tile with `timeText` and `onClick`. Same filename causes cognitive hazard. **Migration**: rename to `BodyMetricTile.tsx` in a future refactor phase. |
| `src/components/workout/intelligence/WarmupCard.tsx` | **YES** | workout / intelligence | — | Consumes structured `WarmupPlan`, integrates with intelligence layer, shows `% of work weight`. This is the authoritative warmup UI. |
| `src/components/workout/WarmupCard.tsx` | **NO** | workout | `src/components/workout/intelligence/WarmupCard.tsx` | Standalone UI card with self-generated default suggestions. Imported by `WorkoutController` and `ActiveExerciseCard`. **Migration**: migrate callers to use intelligence-layer version with a generated `WarmupPlan`; then remove. |
| `src/components/ExercisePicker.tsx` | **YES** | exercise-catalog | — | Full exercise selection system. The one true exercise picker. |
| `src/app/workout/components/ExerciseQuickLauncher.tsx` | **NO** | workout | — (complementary) | Quick-launcher shortcut. Does not replace ExercisePicker; it accelerates access to it. Allowed secondary context. No migration needed, but must not grow into a duplicate picker. |
| `src/app/diet/page.tsx` | **YES** | diet / logging | — | Canonical entry for food logging and meal entry. |
| `src/app/diet-analysis/page.tsx` | **YES** | diet / insights | — | Canonical entry for diet analytics and read-only insights. |

### Migration Map

```
Phase 3+ (NOT NOW — do not execute):

1. MetricCard (profile)
   → Rename src/app/profile/_components/MetricCard.tsx
   → Target: src/app/profile/_components/BodyMetricTile.tsx
   → Update imports in src/app/profile/page.tsx
   → Verify no other callers exist

2. WarmupCard (workout standalone)
   → In WorkoutController.tsx: replace import of workout/WarmupCard
   → With: intelligence/WarmupCard (requires generating WarmupPlan wrapper)
   → In ActiveExerciseCard.tsx: same migration
   → After both callers migrated: move workout/WarmupCard to deprecated/

3. ExerciseQuickLauncher
   → No migration needed
   → Rule: if it ever needs search/custom-exercise features, it MUST delegate to ExercisePicker
   → Guardrail: keep under 200 lines; if it grows, split or merge
```

### Boundaries Enforced

- **Diet**: `diet/` = write/entry; `diet-analysis/` = read/insight. No shared components yet; future shared diet components must live in `src/components/diet/`.
- **Exercise Selection**: `ExercisePicker` is the one primary system. `ExerciseQuickLauncher` is the one allowed secondary shortcut.

---

## Phase 5 Convergence Metrics

> Source: `/docs/ARCHITECTURE_SELF_HEALING_ENGINE.md` §6
> These metrics measure convergence velocity and structural entropy reduction.

### C1: Canonical Convergence Ratio (CCR)

| Field | Value |
|-------|-------|
| **Definition** | Ratio of canonical module usage to total similar-component usage |
| **Formula** | `canonical_import_count / (canonical_import_count + duplicate_import_count)` |
| **Current** | TBD — requires static analysis of import graph |
| **Target** | `>= 0.90` for all high-risk domains |
| **Status** | Not yet measured |

### C2: Duplication Half-Life (DHL)

| Field | Value |
|-------|-------|
| **Definition** | Average sprints from first L3 flag to canonical merge completion |
| **Formula** | `sum(sprints_to_resolve_each_L3) / total_L3_resolved` |
| **Current** | N/A — no L3s resolved yet (Phase 5 just activated) |
| **Target** | `<= 2 sprints` |
| **Status** | Baseline to be established |

### C3: Structural Entropy Index (SEI)

| Field | Value |
|-------|-------|
| **Definition** | Measure of UI system fragmentation across domains |
| **Formula** | `(total_unique_components / total_feature_domains) / total_canonical_components` |
| **Current** | TBD — requires registry + source scan |
| **Target** | Decrease by `>= 5%` per quarter |
| **Status** | Not yet measured |

### C4: Refactor Pressure Score (RPS)

| Field | Value |
|-------|-------|
| **Definition** | Cumulative unresolved L2/L3 violation debt |
| **Formula** | `(unresolved_L2 * 1) + (unresolved_L3 * 3) + (unresolved_L4 * 10)` |
| **Current** | Baseline: 2 L2 (island/card proliferation observations) + 2 L3 (WarmupCard + MetricCard duplicates) = `2*1 + 2*3 = 8` |
| **Target** | `< 10` at all times; drive toward `0` |
| **Status** | 🟡 8 — within threshold but requires active consolidation |

### Active Self-Healing Tickets

| Ticket ID | Trigger | Domain | Recommended Action | Sprint Target | Status |
|-----------|---------|--------|-------------------|---------------|--------|
| (pending) | T1 Repeated L3 | workout | Merge WarmupCard duplicates | Sprint N+1 | `proposed` |
| (pending) | T1 Repeated L3 | profile | Rename MetricCard -> BodyMetricTile | Sprint N+1 | `proposed` |
| (pending) | T2 Pattern Sprawl | home | Evaluate card-like component canonical | Sprint N+2 | `proposed` |

### Convergence Scorecard (Sprint N)

```
Phase 4 Health (Prevent)
  Canonical systems ................. 24    🟢
  Secondary systems ................. 3     🟢
  Duplication risk score ............ 12    🟡
  Orphan modules .................... 2     🔴
  Similarity violations (L3/L4) ..... 2     🔴
  Registry drift index .............. 4.2%  🟢

Phase 5 Convergence (Heal)
  Canonical Convergence Ratio ...... TBD   ⬜
  Duplication Half-Life ............ N/A   ⬜
  Structural Entropy Index ......... TBD   ⬜
  Refactor Pressure Score .......... 8     🟡
  Open self-healing tickets ........ 3     🟡
  Sprints since last promotion ..... N/A   ⬜
```

---

## Architecture Document Index

| Phase | Document | Purpose |
|-------|----------|---------|
| 1 | `ARCHITECTURE_CONSTITUTION.md` | Foundational rules |
| 2 | `ARCHITECTURE_DRIFT_REPORT.md` | Analysis-only drift detection |
| 2 | `FEATURE_REGISTRY.md` | Canonical + secondary registry |
| 3 | `ARCHITECTURE_ENFORCEMENT.md` | Governance layer |
| 4 | `ARCHITECTURE_EXECUTION_PROTOCOL.md` | Execution mechanisms |
| 4 | `ARCHITECTURE_OVERRIDE_LOG.md` | Exception log |
| 4 | `scripts/architecture-validation.md` | Validation pipeline spec |
| 5 | `ARCHITECTURE_SELF_HEALING_ENGINE.md` | Convergence + repair engine |
| 5 | `CANONICAL_CONSOLIDATION_REPORT.md` | Consolidation report template |

*Last updated: Architecture Self-Healing Layer Phase 5*
