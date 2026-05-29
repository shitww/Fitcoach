# FitCoach Page Architecture Lock — Phase 1 Spec

> Objective: Lock system boundaries and eliminate cross-page contamination.
> Date: 2026-05-29

---

## A. Page Contract Spec

| Page | System Role | Responsibility (1 sentence) | Allowed Actions | Forbidden Actions |
|------|-------------|------------------------------|-----------------|-------------------|
| **Home** | Portal Layer | Provide lightweight entry points and read-only snapshots from other layers. | Display today's plan name, quick-start CTA, resume active session indicator. | Compute readiness scores, project muscle recovery, show nutrition data, generate insights. |
| **Training** (`/workout`) | Execution Layer | Capture live training data and write workouts to the system. | Start/pause/complete sessions, log sets, edit in-progress workouts, write to `/api/workout`. | Display historical analytics, edit completed workouts, show AI insights. |
| **History** (`/history`) | Memory Layer | Display chronological training records for recall and review. | Fetch and render workout timeline, navigate to individual session detail. | Compute streaks, PRs, milestones, progression arcs, or any analytics. |
| **Growth** (`/analytics`) | Intelligence Layer | Analyze all training data and surface insights, trends, and readiness. | Read from `/api/analysis/*`, compute velocities, readiness, PRs, streaks, achievements. | Write training data, modify workouts, persist UI state, trigger training actions. |
| **Profile** (`/profile`) | Identity + Control Layer | Manage user identity, body metrics, and system control links. | Display avatar/name/email, log body weight/body fat, toggle theme, link to Settings/Goals. | Fetch PRs, compute streaks/level/achievements, display training analytics. |
| **AI Coach** (`/chat`) | Suggestion Layer | Provide stateless conversational coaching without persisting conversation state. | Stream chat via `/api/chat`, display AI responses. | Persist messages to DB, write training data, modify user state. |
| **Nutrition** (`/diet`, `/diet-analysis`) | Input Auxiliary Layer | Log daily food intake and display nutrition summaries. | CRUD food logs, view daily macro summaries, log water. | Edit nutrition goals (owned by Settings), display on primary nav tab. |
| **Settings** (`/settings`) | System Configuration Layer | Manage notification prefs, nutrition targets, and account security. | Save notification toggles, update nutrition goals, change password. | Access training data, compute analytics, modify workout logic. |

---

## B. Navigation Map

### Primary Tabs (BottomTabBar)
| Tab | Route | Role |
|-----|-------|------|
| 首页 | `/` | Portal |
| 训练 | `/workout` | Execution |
| 历史 | `/history` | Memory |
| 成长 | `/analytics` | Intelligence |
| 我的 | `/profile` | Identity + Control |

### Secondary Entry Points
| Entry | Route | Parent Access | Role |
|-------|-------|---------------|------|
| AI Coach | `/chat` | Floating button or Home shortcut | Suggestion |
| 饮食记录 | `/diet` | Home → NutritionCard or Training context | Input Auxiliary |
| 饮食分析 | `/diet-analysis` | `/diet` → 分析 tab or Home | Input Auxiliary |
| 设置 | `/settings` | Profile menu | System Configuration |
| 训练目标 | `/goals` | Profile menu | Control |
| 训练总结 | `/summary` | Post-Training completion redirect | Execution (read-only) |

---

## C. Data Flow Diagram

```
┌─────────────┐     write      ┌─────────────┐     read       ┌─────────────┐
│  Training   │───────────────▶│   History   │───────────────▶│   Growth    │
│  (Execution)│                │  (Memory)   │                │(Intelligence)│
└─────────────┘                └─────────────┘                └──────┬──────┘
       │                                                              │
       │                                                              │ suggest
       │                                                              ▼
       │                                                     ┌─────────────┐
       │                                                     │  AI Coach   │
       │                                                     │(Suggestion) │
       │                                                     └──────┬──────┘
       │                                                            │
       │                    ┌─────────────┐                         │
       │                    │   Profile   │◀────────────────────────┘
       │                    │ (Identity+  │         read-only insight
       │                    │   Control)  │
       │                    └──────┬──────┘
       │                           │
       │              ┌────────────┼────────────┐
       │              ▼            ▼            ▼
       │        ┌─────────┐  ┌─────────┐  ┌─────────┐
       │        │ Settings│  │  Goals  │  │ BodyData│
       │        │(Config) │  │(Control)│  │(Identity)│
       │        └─────────┘  └─────────┘  └─────────┘
       │
       └──────────────────────────────────────────────────────────────▶
                                    Input Auxiliary
                              ┌─────────────────────────┐
                              │      Nutrition            │
                              │  (/diet, /diet-analysis)  │
                              └─────────────────────────┘
```

**Flow Rules:**
1. Training is the **only** write source for workout data.
2. History reads workout data but does **not** compute insights.
3. Growth reads History data and computes all insights (read-only).
4. AI Coach is stateless; it suggests but never writes.
5. Profile manages identity data (body metrics, account) but never touches training logic.
6. Nutrition is a non-core input system; it does not write to training state.
7. Settings owns configuration (nutrition targets, notifications); Nutrition page must not duplicate goal editing.

---

## D. Anti-Pattern List

### Detected Violations

| # | Violation | Location | Severity | Fix |
|---|-----------|----------|----------|-----|
| 1 | **Home computes readiness & muscle recovery** — Intelligence logic in Portal | `src/app/_home/HomeRuntimeIsland.tsx` | High | Remove ReadinessSurface, RecoveryProjection, TodayMomentum, RuntimeFeed. Keep only RuntimeHero with raw bootstrap data. |
| 2 | **Home shows NutritionCard** — Nutrition in Portal | `src/app/_home/ExtendedWidgets.tsx` (unused but present), `NutritionCard` referenced | Medium | Do not render NutritionCard on Home. Nutrition is secondary entry only. |
| 3 | **History generates insights** — streak, PR, milestone, progression arc computed in Memory | `src/app/history/page.tsx` | High | Remove streak/PR/milestone computations. Strip MilestoneStrip and ProgressionArc. Pass only raw `workouts` to TimelineSurface. |
| 4 | **Profile displays training analytics** — PRs, achievements, streak, level from training data | `src/app/profile/page.tsx` | High | Remove PR section, achievement grid, streak badge, level computation. Keep only identity + body metrics + control menu. |
| 5 | **Profile computes streak/level** — Intelligence in Identity | `src/app/profile/page.tsx` | High | Delete `computeStreak`, `computeLevel`, and related fetch of `/api/workout`. |
| 6 | **Summary edits historical workouts** — cross-layer write | `src/app/summary/page.tsx` | Critical | Remove edit mode (`enterEdit`, `saveEdit`, editedSets state). Summary must be read-only. |
| 7 | **Summary embeds AI feedback generation** — AI logic in non-AI page | `src/app/summary/page.tsx` | Medium | Remove `autoGenerate`, `buildPayload`, `aiFeedback` state. Summary shows stats only; AI Coach is the dedicated AI surface. |
| 8 | **Calendar mixes Memory + Nutrition** | `src/app/calendar/page.tsx` | Medium | Remove diet tab, diet data fetching, and diet bottom sheet. Calendar is for training memory only. |
| 9 | **Goals reads training data** — Control layer reads Memory | `src/app/goals/page.tsx` | Medium | Remove `/api/workout` fetch and weekly progress computation. Goals page is for setting targets only. |
| 10 | **Diet duplicates nutrition goal editing** — Input layer writes Config | `src/app/diet/page.tsx` | Medium | Remove goal editor modal and `saveGoals`. Nutrition goals are owned exclusively by Settings. |
| 11 | **Settings nutrition tab + Diet goal editor** — duplicated metric system | `src/app/settings/page.tsx` + `src/app/diet/page.tsx` | Medium | Consolidate: Settings keeps nutrition targets; Diet removes them. |
| 12 | **Growth (Analytics) hardcodes fake muscle readiness** | `src/app/analytics/page.tsx` | Medium | Remove hardcoded `muscles` array with fake data. Display only real computed analytics. |
| 13 | **Diet in primary BottomTabBar** — Nutrition elevated to core system | `src/components/BottomTabBar.tsx` | High | Replace diet tab with Growth tab. Nutrition becomes secondary entry. |
| 14 | **Duplicated achievement/streak/PR systems** — Profile + History both compute same metrics | `src/app/profile/page.tsx` + `src/app/history/page.tsx` | Medium | Centralize all analytics in Growth. Remove duplicates from Profile and History. |

---

## E. Success Criteria Checklist

- [ ] Each page has exactly one system role.
- [ ] No cross-layer writes exist (Training is the only workout write source; Summary read-only).
- [ ] Growth is purely analytical (no UI contamination, no fake data).
- [ ] Training is the only write source for workout data.
- [ ] Navigation is simplified: 5 primary tabs (Home, Training, History, Growth, Profile).
- [ ] AI logic is isolated to `/chat` (Suggestion layer).
- [ ] Nutrition goals are single-owned by Settings.
- [ ] Calendar is training-only.

---

## F. State Ownership Lock

| State | Owner | Access Pattern |
|-------|-------|----------------|
| `trainingState` | Training only | Read/write via `useWorkoutTimer` + `/api/workout` |
| `historyState` | History only | Read-only via `/api/workout?limit=*` |
| `growthState` | Growth only | Read-only via `/api/analysis/*` |
| `profileState` | Profile only | Read/write identity + body data via `/api/body-data`, `/api/auth/me` |
| `aiState` | Stateless | Ephemeral chat messages; no persistence |
| `nutritionState` | Nutrition only | Input-only via `/api/food-logs`, `/api/water-logs` |
| `configState` | Settings only | Write via `/api/nutrition-goals`, `/api/auth/change-password`, localStorage notifications |
