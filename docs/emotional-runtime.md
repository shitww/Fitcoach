# Emotional Runtime

## Philosophy

> "The system doesn't just record training. It accompanies long-term growth."

Phase 7 upgrades FitCoach from a reliable fitness OS to an **emotionally adaptive fitness system**.

### Core Principle: Calm Motivation

| Forbidden | Required |
|-----------|---------|
| Noisy gamification | Calm motivation |
| Fake dopamine | Subtle progress feedback |
| Badge spam | Long-term growth visibility |
| XP systems | Emotional continuity |
| Childish reward UI | Non-intrusive encouragement |
| Streak punishment | Training identity reinforcement |

---

## Architecture

```
src/lib/emotional-runtime/
├── momentum/      → Training rhythm state detection
├── achievement/   → Micro achievements + milestone tracking
├── reflection/    → Post-workout session analysis
├── encouragement/ → Adaptive, spam-free encouragement
├── streak/        → Non-punishing consistency tracking
├── progress/      → Long-term strength + volume trends
├── identity/      → Training style observation
└── retention/     → Gentle re-engagement detection
```

---

## TASK 1 — Adaptive Momentum Engine

### Momentum Phases

| Phase | Description | UI Tone |
|-------|-------------|---------|
| `rising` | Frequency increasing, performance up | Affirming |
| `consistent_flow` | Stable, well-paced rhythm | Quiet positive |
| `fatigue_risk` | Over-training signals | Recovery-care |
| `recovery_phase` | Deliberate lighter period | Supportive |
| `re_entry` | Returning after extended gap | Warm welcome |
| `building` | Early-stage or new trainee | Encouraging |

### Momentum Score (0–100)

```
Frequency component  (40pts): sessions / 14 days vs 8 ideal
Recency component    (30pts): penalize gap since last session
Consistency         (20pts): rhythm stability score
Recent bonus        (10pts): active in last 7 days
```

### Hero Upgrade

Before: "继续训练"

After (examples):
- "过去 3 周训练稳定性非常高"
- "恢复节奏很好，今天适合轻量训练"
- "欢迎回来" (re-entry)

---

## TASK 2 — Achievement Runtime

### Micro Achievement Types

No trophy walls. No badge spam. **Subtle, inline recognition only.**

| Type | Example |
|------|---------|
| `consistency` | 过去 2 周完成 8 次训练，节奏非常稳定 |
| `strength_trend` | 卧推稳定提升 |
| `recovery_discipline` | 恢复节奏改善 |
| `volume_milestone` | 完成第 50 次训练 |
| `re_entry` | 重新开始训练 |
| `frequency_pb` | 本周完成 5 次训练 |

### Display Modes

- `inline` — tiny chip in card header (non-intrusive)
- `card` — single summary row for major milestones

### Anti-Spam Rules

- Achievements are persisted to localStorage
- `isNew: true` only fires once per achievement ID
- No modals. No confetti. No pop-up interruptions.

---

## TASK 3 — Post-Workout Reflection Layer

Every completed session generates a calm analytical card:

```
训练小结
────────────────────────────────
今天胸部训练强度高于近期平均 15%
· 上斜卧推表现稳定提升
· 今天训练时长较长，注意恢复

预计胸部恢复：48–72 小时
```

### Tone Principles

- Analytical, not celebratory
- Factual observations only
- Never: "🔥 AMAZING WORKOUT 🔥"

---

## TASK 4 — Smart Encouragement System

### Encouragement Tones

| Tone | Trigger | Example |
|------|---------|---------|
| `re_entry_warm` | Gap ≥ 14 days | "很高兴看到你重新开始训练" |
| `recovery_care` | Fatigue risk phase | "最近训练频率偏高，建议增加恢复" |
| `consistency_note` | 2-week consistent | "你的训练节奏正在变得很稳定" |
| `analytical_good` | Rising momentum | "训练频率持续上升，节奏很好" |
| `quiet_positive` | Low activity return | "今天的训练很有价值" |

### Spam Prevention

- Each tone suppressed for **24 hours** after display
- Returns `null` when nothing meaningful to say
- No notification spam. No push alerts.

### Burnout Risk Detection

Signals monitored:
- Two-week frequency ≥ 12 sessions
- Last 7 days: 6+ consecutive sessions
- No rest days in last week
- Fatigue score ≥ 70

---

## TASK 5 — Adaptive Streak Engine

### Philosophy

> "过去 14 天完成 9 次训练" > "连续 9 天打卡"

| Old System | Adaptive System |
|------------|----------------|
| Consecutive days | 14-day completion rate |
| Rest day = ❌ penalty | Rest day = ✅ valued |
| Anxiety-inducing | Calm and realistic |
| Binary (broken/not) | Gradient (consistency %) |

### Protected Streak

- High fatigue: 3 consecutive off-days allowed before "reset"
- Normal: 2 consecutive off-days allowed
- Explicit rest days never counted against streak

### ConsistencyRhythmCard

Replaces or augments the traditional StreakCard:
- Shows `X / 14 days` completion rate
- Actual day-by-day bars (green = done, dimmed = rest/skip)
- Grade label: Excellent / Good / Building / Returning
- Trend arrow: ↑ / → / ↓

---

## TASK 6 — Long-Term Progress Narrative

### Output Example

```
过去 8 周整体稳定上升

过去 14 天完成了 9 次训练
与上周相比，训练频率增加 20%
卧推、硬拉力量稳定提升中

胸部训练容量 ↑ 18%
背部训练容量 ↑ 12%
```

### Design Principle

- Trend + narrative, not data tables
- 2–3 story sentences max
- Tone adapts: positive / neutral / analytical

---

## TASK 7 — Training Identity Layer

### What It Is

Observational pattern recognition — not personality labeling.

```
你的训练风格：训练稳定性高，偏向复合动作训练，渐进超负荷型
```

### Detected Traits

| Trait | Detection Signal |
|-------|----------------|
| `high_consistency` | ≥8 sessions / 14 days |
| `compound_heavy` | Squat/deadlift/bench in history |
| `progressive_overload` | Has weights + ≥15 total workouts |
| `recovery_aware` | ≥2 rest days/week + low fatigue |
| `minimalist` | Short sessions + high frequency |

### Privacy Principle

- Observational only
- Never says "你是X型人"
- Always says "你的训练风格偏向..."
- Requires ≥5 workouts before any identity is shown

---

## TASK 8 — Retention Runtime Layer

### Risk Levels

| Level | Trigger | Action |
|-------|---------|--------|
| `none` | Active training | No message |
| `mild` | 2+ signals (frequency drop) | No message shown |
| `moderate` | 7–13 days absent | Subtle single line |
| `high` | ≥14 days absent | Re-engagement suggestion |

### Re-Engagement Messages (Examples)

- "距上次训练 10 天，随时可以重新开始"
- "7 天未训练，今天轻量开始也很好"

### Never Shown

- "快回来训练！！！"
- Notification badges
- Aggressive prompts

### Predicted Return Window

Uses day-of-week frequency analysis from `last14Days`:
- "你通常在周三恢复训练节奏"
- Confidence: low / medium / high

---

## TASK 9 — Emotional Runtime UI Upgrade

### Home Hero Changes

#### Before
```
[继续训练]
```

#### After
```
[MomentumBand: 过去 3 周训练稳定性非常高 · 14天内完成 9 次训练 | 稳定节奏]

[QuickWorkoutEntry]
  Title: 今日训练
  Insight: 稳定是长期进步的核心

[ConsistencyRhythmCard]
  9 / 14 天  · 今日待训练
  ████████░░░░░░  (14-day bars)
  过去 14 天完成 9 次训练  ↑ 训练节奏稳定
```

### Session Reflection Card

Shown after workout completion:
```
训练小结
今天胸部训练强度高于近期平均 15%
· 上斜卧推表现稳定提升
─────────────────────────────
预计胸部恢复：48–72 小时   +1.5kg (稳定提升)
```

### Progress Narrative Surface

For profile / history pages:
```
过去 8 周成长
────────────────
过去几周训练频率和强度持续上升
过去 14 天完成了 9 次训练
卧推、深蹲力量稳定提升中

↑ 卧推  +5kg (稳定提升)
↑ 深蹲  +7.5kg (稳定提升)
```

### Training Identity Card

For profile page:
```
训练风格
───────────────
你的训练风格：训练稳定性高，偏向复合动作训练，渐进超负荷型

[高稳定性] [渐进超负荷] [复合动作为主]

训练时长: 中等时长    训练强度: 中等强度
```

### Empty State Upgrade

Rest day / recovery messaging:
- "恢复也是训练的一部分"
- "充分休息有助于明天更好的表现"

---

## UI Design Rules

### Allowed

- Soft gradients for trend surfaces
- Subtle progress bars (height 6px, not 20px)
- Confidence/consistency bars with dot indicators
- Phase-labeled badges (small, pill-shaped)
- Trend arrows (↑ → ↓)
- Muted glow on active state

### Forbidden

- Neon gaming UI
- Giant achievement modals
- Confetti or animation explosions
- Loud color schemes
- "AMAZING!" copy
- Streak shame or loss aversion UI

---

## Data Flow

```
DashboardBootstrap (progress + recovery + recentExercises)
    ↓
buildMomentumSurface(progress, recovery)
    → TrainingMomentumState
    → MomentumBand (home hero strip)
    → momentumInsight → QuickWorkoutEntry subheadline

calculateAdaptiveStreak(progress, recovery)
generateConsistencyScore(progress)
    → ConsistencyRhythmCard (14-day rhythm view)

detectMicroAchievements({ progress, recovery })
    → AchievementSurface (new + recent + milestones)

generateProgressNarrative({ progress, recovery, trends })
    → ProgressNarrativeSurface (profile page)

detectTrainingIdentity({ progress, recovery, exercises })
    → TrainingIdentityCard (profile page)

buildRetentionSurface(progress, recovery)
    → RetentionSurface (subtle re-engagement, when applicable)
```

---

## Success Criteria

### Emotional UX

- Users feel long-term growth (not just session-by-session)
- System acknowledges re-entry warmly, not urgently
- Fatigue signals are surfaced as care, not criticism
- Identity is observed, never labeled

### Reflection System

- Post-session: calm analytical card with strength + recovery data
- Rest day: recovery insight, not empty state
- Long-term: narrative trend visible in profile

### Retention

- No aggressive re-engagement messaging
- Adaptive streak never punishes rest days
- Re-engagement window predicted from personal patterns

### UI

- Home hero has clear emotional context (MomentumBand)
- Consistency shown as rhythm, not streak anxiety
- Progress page tells a story, not a spreadsheet

---

## The Outcome

After Phase 7, users feel:

> "This system doesn't just record my training.  
> It understands my rhythm, acknowledges my progress,  
> and supports my long-term growth."

FitCoach is no longer a fitness tracker.  
It is an **emotionally adaptive fitness companion**.
