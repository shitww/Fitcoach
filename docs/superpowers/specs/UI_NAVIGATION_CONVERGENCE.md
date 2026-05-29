# FitCoach UI / Navigation Convergence — Phase 2 Spec

**Status:** Complete  
**Goal:** Eliminate residual semantic ambiguity so users infer page purpose without reading code, and no page visually suggests cross-domain functionality.

---

## A. UI Layer Mapping Table

| Page | System Layer | Allowed UI Patterns | Forbidden UI Patterns |
|------|--------------|---------------------|----------------------|
| **Home** (`/`) | Portal / Entry Surface | One headline, one subheadline, one primary CTA (Start Training), session resume indicator | Readiness rings, fatigue badges, muscle recovery metrics, analytics preview, AI insights, streak counters, macro cards |
| **Training** (`/workout`) | Execution Core | High-contrast interactive surfaces, set logging, rest timers, real-time feedback, active-state animations | PR displays, streak counters, trend charts, AI feedback generation, analytics previews |
| **History** (`/history`) | Memory Layer | Neutral timeline list, date grouping, raw workout cards, pagination | Streak computation, milestone strips, PR analytics, progress arcs, readiness scores |
| **Calendar** (`/calendar`) | Memory Layer | Month grid, day dots for muscle groups, range selection, day detail bottom sheet | Diet tab/indicators, nutrition legend, macro breakdowns, readiness overlay |
| **Growth** (`/analytics`) | Intelligence Layer | Charts, trend analysis, 1RM progression, velocity metrics, search/filter, AI explanations | Data input forms, training controls (Start Training), execution CTAs, direct workout editing |
| **Summary** (`/summary`) | Execution (Read-Only) | Workout recap card, exercise list, volume display, notes, PR badge | Edit mode for sets, AI feedback generation, coaching recommendations, readiness computation |
| **Profile** (`/profile`) | Identity + Control | Identity header, body metric trend cards (read-only sparklines), settings menu entries, theme toggle, logout | PR logic, achievement grids, level/streak badges, body metric editors, training analytics |
| **Goals** (`/goals`) | Control Layer | Target value inputs (weekly workouts, duration, volume), goal persistence | Weekly progress computation from workout data, progress bars derived from Memory layer, training data fetching |
| **Diet** (`/diet`) | Input Auxiliary | Food logging, meal picker, macro progress bars (read-only goals), water counter | Nutrition goal editor, target calorie/macro inputs |
| **Settings** (`/settings`) | Control Layer | Form inputs, toggles, preference selectors, account controls | Analytics displays, training data, insights |
| **Chat** (`/chat`) | Suggestion Layer | AI coach conversation, message bubbles, suggestion chips | Workout recording, data input, direct execution triggers |

---

## B. Navigation UX Spec

### Primary Tabs (BottomTabBar)

| Tab | Label | Icon | Route | Auto-Detection Prefix | Allowed State Indicator |
|-----|-------|------|-------|----------------------|------------------------|
| Home | 首页 | Home | `/` | `/` | None |
| Training | 训练 | Dumbbell | `/workout` | `/workout` | **Dot only** — a 2px breathing dot when a session is active. No label change to "进行中". |
| History | 历史 | Clock | `/history` | `/history` | None |
| Growth | 成长 | TrendingUp | `/analytics` | `/analytics` | None |
| Profile | 我的 | User | `/profile` | `/profile` | None |

### Tab Behavior Rules

1. **Static Labels** — Tab text must never change based on runtime state (no "进行中", no counts, no percentages).
2. **No Preview Data** — Tab icons must not display mini-metrics, sparklines, or badges other than the single binary training-active dot.
3. **No Cross-Layer Hints** — Tab icons must not suggest analytics (e.g., no chart icon on History, no brain icon on Home).
4. **One Active Layer** — Only one tab is active at a time. No split-focus states.

### What Appears in Tab vs Inside Page

- **In Tab:** Layer icon + layer name only.
- **Inside Page:** Layer-specific content (charts in Growth, timeline in History, forms in Settings).
- **Never in Tab:** Partial data, status text, AI indicators, readiness percentages.

---

## C. Visual Language Rules

Defined in `src/styles/runtime-semantic.css` under **Layer Visual Language Lock**.

### Execution (Training)
- **Surface:** Elevated with active glow (`--rvl-active-glow`)
- **Border:** Accent-colored (`--rvl-active`)
- **Motion:** Pulse animations (`rvl-pulse-active`)
- **CTA:** Gradient fill, glow shadow, kinetic tap feedback
- **Typography:** Bold, high-contrast, action-oriented

### Memory (History / Calendar)
- **Surface:** Neutral, flat (`--rvl-surface-1`)
- **Border:** Subtle (`--rvl-border-subtle`)
- **Motion:** None (static, chronological)
- **Indicators:** Dot markers, timeline left-borders, date labels
- **Typography:** Regular weight, muted timestamps

### Intelligence (Growth)
- **Surface:** Flat, analytical (`--rvl-surface-1`)
- **Border:** Subtle (`--rvl-border-subtle`)
- **Accent:** Data blue (`#60A5FA`) — distinct from execution green
- **Motion:** None (calm, analytical)
- **Charts:** Contained in `layer-chart` cards with subtle borders
- **Typography:** Monospaced numbers for metrics, regular for explanations

### Identity (Profile)
- **Surface:** Minimal cards (`--rvl-surface-1`)
- **Border:** Subtle (`--rvl-border-subtle`)
- **Motion:** None (static)
- **Portrait:** Rounded avatars, identity header blocks
- **Typography:** Personal name prominent, metrics secondary

### Control (Settings / Goals / Diet)
- **Surface:** Input-ready (`--rvl-surface-2`)
- **Border:** Subtle (`--rvl-border-subtle`)
- **Motion:** None
- **Inputs:** Explicit bordered fields, toggle switches
- **Typography:** Label + value pairs, form hierarchy

---

## D. Residual Risk Report

### Risk 1: Dead Home Widget Components
**Files:** `src/app/_home/HomeHero.tsx`, `QuickWorkoutEntry.tsx`, `HeroMetricsRow.tsx`, `RecentExercisesStrip.tsx`, `MomentumBand.tsx`, `HomeCriticalIsland.tsx`, `HomeHeroIsland.tsx`  
**Risk:** These files contain rich dashboard widgets with `coachInsight`, `momentumInsight`, fatigue badges, and analytics previews. They are not currently imported by the active home page (`page.tsx`), but if accidentally reactivated, they would immediately reintroduce cross-layer contamination.  
**Mitigation:** Code is orphaned but present. Recommend deletion in a future cleanup pass or guard with a feature-flag that defaults to off.

### Risk 2: Workout Detail Page (`/workout/[id]`)
**File:** `src/app/workout/[id]/page.tsx`  
**Status:** AI feedback section removed in Phase 2.  
**Remaining:** The page still fetches and displays full workout data. It is borderline between Execution (active recording) and Memory (post-hoc viewing). The route naming (`/workout/[id]`) overlaps with the Execution layer (`/workout`).  
**Mitigation:** Consider renaming to `/record/[id]` or `/history/detail/[id]` to make the Memory role explicit. This is a routing change, not a UI change.

### Risk 3: Dashboard Bootstrap API
**File:** `src/lib/dashboard-bootstrap.ts`  
**Risk:** The bootstrap object still contains `recovery` and `progress` fields with fatigue scores, streaks, and 14-day activity arrays. The active home page (`HomeRuntimeIsland`) no longer consumes them, but the API still computes and transmits them. Any future developer could reintroduce analytics on Home by simply destructuring `recovery` from bootstrap.  
**Mitigation:** Split the bootstrap endpoint into `getPortalBootstrap` (only `quickEntry`) and `getAnalyticsBootstrap` (everything else), so the Portal layer cannot accidentally access Intelligence data.

### Risk 4: Analytics Local Heuristics
**File:** `src/app/analytics/page.tsx`  
**Risk:** `overallReadiness`, `consistencyScore`, and `fatigueTrend` are computed locally from record counts using crude heuristics (`Math.min(1, 0.3 + records.length * 0.02)`). These are not real AI analytics and could mislead users.  
**Mitigation:** Replace with server-computed intelligence from a real analytics engine, or remove and replace with raw data visualizations only.

### Risk 5: AI References in Dead Routes
**Files:** `src/app/diet-analysis/**`, `src/app/training-log/**`, `src/lib/ai/**`  
**Risk:** Multiple pages and libraries still reference "AI" heavily. They are not linked from the primary navigation, but direct URL access or search indexing could expose them.  
**Mitigation:** Ensure these routes are either behind auth + feature flags, or rename branding to "Smart Coach" / "Intelligent Analysis" to align with the converged visual language.

### Risk 6: BottomTabBar Training Dot
**File:** `src/components/BottomTabBar.tsx`  
**Risk:** The breathing dot on the Training tab is a binary state indicator. It is currently the only exception to the "no preview data in tabs" rule.  
**Mitigation:** Acceptable as a binary on/off signal without quantitative data. If ambiguity increases, replace with a static badge (no animation).

---

## E. Changes Applied

### Task A — Navigation UI Refinement
- `BottomTabBar.tsx`: Removed dynamic "进行中" label override on Training tab. Label is now static. Kept the binary breathing dot as the only allowed state indicator.

### Task B — Home Page UI Convergence
- `HomeRuntimeIsland.tsx`: Removed `recovery` from subheadline logic. `getSubheadline` now derives text purely from `quickEntry` (rest day, today done, plan day, default). No fatigue, no readiness, no AI insights.
- `HomeShell.tsx`: Replaced "AI Coach" tagline with "Training System".
- `page.tsx`: Simplified `RuntimeSkeleton` to headline + subheadline + CTA blocks only (removed 120px circular readiness-ring skeleton).
- `loading.tsx`: Aligned loading skeleton to converged home structure.
- `UnauthenticatedContent.tsx`: Removed "AI" from landing tagline.

### Task C — Growth Page UI Isolation
- Verified `analytics/page.tsx` and sub-pages (`volume`, `health`, `strength`) contain no data input, no training controls, and no execution navigation triggers.

### Task D — Profile UI Purification
- `profile/page.tsx`: Removed `MetricEditorSheet` import and usage. Removed `activeMetric`, `editorOpen`, `openEditor`, `handleSave` state/handlers. Made `TrendCard` a static `<div>` (non-interactive). Cleaned unused imports (`METRICS`, `MetricConfig`, `findRecordByLocalDay`, `startOfLocalDay`, `formatTimeText`). Body metrics are now strictly read-only trends.

### Task E — Visual Language Separation
- `runtime-semantic.css`: Added `.layer-execution`, `.layer-memory`, `.layer-intelligence`, `.layer-identity`, `.layer-control` CSS variable sets and utility classes.

### Global AI Branding Cleanup
- `manifest.ts`: App name changed to "XFITX - 智能健身系统". Shortcut renamed from "AI 教练" to "智能教练".
- `layout.tsx`: `<title>` changed to "XFITX - 智能健身系统".
- `profile/page.tsx`: Footer changed from "AI 健身私人教练" to "智能健身系统".
- `auth/signin/page.tsx` & `auth/signup/page.tsx`: Tagline changed from "AI FITNESS COACH" to "SMART FITNESS SYSTEM".
- `workout/[id]/page.tsx`: Removed AI Coach Feedback section (state, useEffect, `generateFeedback`, JSX block).
