# Workout Runtime Rebuild

## The Shift

> "Training is not a form. It's a flow state."

Phase 8 transforms FitCoach from a workout logger into a **Runtime-Driven Fitness Experience System**.

### Before vs After

| Before | After |
|--------|-------|
| Fill in weight input | System shows prediction, user confirms |
| Tap RIR dropdown (5 options) | Eliminated — inferred from progression |
| Navigate to exercise search page | Inline quick-select, never leaves workout |
| Rest = waiting for timer | Rest = continuation with next-set preview |
| "Workout Saved" completion card | Chapter reflection narrative |
| "训练" tab → training log | "训练" tab → workout (runtime-first) |

---

## Architecture

```
src/lib/workout-runtime/
├── state-machine/    → Formal runtime phase management
├── queue/            → Exercise queue with adaptive reordering
├── motion/           → Transition + animation config system
├── rest/             → Adaptive rest experience
└── mobile/           → Thumb-flow + one-hand ergonomics

src/app/workout/
├── HeroExerciseSurface.tsx     → Single-focus exercise surface (replaces form card)
├── RuntimeQueueRail.tsx        → Horizontal animated exercise queue
├── RuntimeLoggingPanel.tsx     → Predictive confirmation panel

src/components/workout/
├── ChapterCompletionSurface.tsx → Emotional completion (replaces metric dump)
├── RestOverlay.tsx              → Upgraded: next-set preview + insights
```

---

## Runtime-First UX Philosophy

### Forms Should Disappear

The most friction-free workout experience is one where the user **never types**.

Traditional model:
```
User → types weight → types reps → selects RIR → taps confirm
= 4 interactions per set
```

Runtime model:
```
System → shows "82.5kg × 8 ?" → user taps ✓
= 1 interaction per set
```

The system learns from the last set, the last session, and the progression trend. By the second set, it can predict the next set with >90% accuracy.

### State Machine Workout Design

The workout is not a page flow. It's a **state machine**:

```
idle
  └─► pre_workout      (session starting, exercise selection)
       └─► warmup       (pre-activation, optional)
            └─► active_set  (user is performing a set)
                 ├─► rest        (between sets — timer running)
                 │    └─► active_set (back to next set)
                 ├─► transition  (moving to next exercise)
                 │    └─► active_set
                 └─► completion  (all exercises done)
                      └─► reflection (post-workout narrative)
                           └─► idle
```

Each phase has:
- A specific UI configuration (what to show/hide)
- A specific interaction surface (what the primary CTA does)
- A specific motion profile (how transitions feel)

### Predictive Interaction Model

The system predicts, the user confirms.

**Set prediction priority:**
1. Last completed set of this session (same weight/reps)
2. Historical last session record (from DB)
3. No prediction → prompt user to input once, then track

**Adjustment model:**
- `+2.5kg` / `-2.5kg` step buttons (large, thumb-friendly)
- `+1 rep` / `-1 rep` step buttons
- Tap number → opens number pad (rare case)

**RIR removed from primary flow:**
- RIR is now inferred from logged performance
- Users don't think about RIR during a set
- System derives it from weight × reps progression analysis

---

## Motion Runtime Philosophy

> "Motion should communicate state, not perform."

### Principles

**Continuity**: The session never feels like it ends and restarts between sets.
- Rest phase: exercise name stays visible
- Transition: queue rail shows progress, next exercise fades in
- Completion: narrative slides up from bottom (not modal popup)

**Responsiveness**: Touch targets respond immediately to input.
- Press scale: 0.95 (standard) → 0.93 (high momentum)
- Confirm button glow follows session energy
- Queue rail highlights current position

**Calm**: Motion never demands attention.
- No confetti. No achievement explosions.
- No jarring cuts between phases.
- All transitions are `ease-out` with natural spring on key elements.

### Phase Transitions

| Transition | Duration | Easing |
|-----------|---------|-------|
| idle → pre_workout | 350ms | ease-out + translateY(16px) |
| pre_workout → active_set | 380ms | spring(0.34,1.56,0.64,1) + scale |
| active_set → rest | 300ms | ease-out + scale(0.97) |
| rest → active_set | 380ms | spring + translateY(20px) |
| completion | 500ms | ease-out + translateY(32px) |
| reflection | 600ms | ease-out — cinematic pace |

---

## Calm Premium Fitness UX

### What it looks like

**Home screen:**
- MomentumBand shows "过去 2 周训练节奏稳定" — no numbers, just narrative
- QuickWorkoutEntry CTA is immediately tappable
- Training tab shows live "进行中" label when session active

**Workout screen:**
- Exercise name fills top third of screen — it IS the focus
- Weight × reps steppers are the only interactive elements above the CTA
- Completed sets shown as compact chips (not a table)
- Queue rail at top shows "where I am" without cognitive overhead

**Rest screen:**
- Full-screen breathing glow (adaptive to rest duration)
- Timer ring drains calmly — not urgently
- Next set prediction shown at top: "下一组：82.5kg × 8"
- Form tip shown at bottom: one sentence
- "跳过" is there — not prominent

**Completion:**
- Slides up from bottom (feels like an ending chapter, not a popup)
- Session headline: "今天胸部训练完成"
- Reflection line: "强度高于近期平均 12%"
- Strength trends: "卧推 ↑ +2.5kg"
- Recovery estimate: "预计胸部恢复：48–72 小时"

---

## Mobile Gym Ergonomics

### Real Gym Constraints

- Phone in one hand
- Possibly gloves or chalk
- Loud environment
- Mental load from training
- Interruptions (rest, spotter, music)

### Solutions

**Thumb Zone Layout:**
- Primary CTA: bottom-center, 64px tall minimum
- Step controls: bottom half of screen, 48px minimum target
- Exercise name: top third (read, not interactive)
- Queue rail: compact strip, 44px tall

**One-Hand Interactions:**
- All primary actions reachable with right thumb from bottom
- No precision taps required (no tiny checkboxes, dropdowns)
- Confirm CTA: full width, thumb-tap anywhere succeeds
- Skip rest: tap anywhere in rest zone (not just a small button)

**Fast Resume:**
- Session survives lock screen (timer stored as epoch ms endAt)
- On resume: completion surface shows "继续训练" if session was active
- No re-login required during a session (offline-first)

**Haptic Feedback:**
- Set confirm: light tap [10ms]
- PR achieved: subtle double [10, 60, 20ms]
- Rest end nudge: gentle [15, 40ms]
- All other actions: no haptic (avoids noise)

---

## Why Workout Should Feel Continuous

Traditional apps feel like this:
```
[Start] → [Log Set 1] → [Wait] → [Log Set 2] → [Wait] → [Next Exercise] → [Done]
          (form)         (idle)    (form)         (idle)   (navigation)    (modal)
```

The user experiences **stop-start-stop-start** — cognitive load resets each time.

The runtime model feels like this:
```
[In flow] ←→ [Set] ←→ [Rest] ←→ [Set] ←→ [Transition] ←→ [Set] ←→ [Reflect]
```

The session is a continuous arc. The UI is always "in it with you."

**Technical implementation:**
- Phase state machine prevents dead-end states
- Queue rail gives persistent spatial awareness
- Rest overlay shows what's coming (not just time remaining)
- Completion surface slides up from below (in-page, not a page change)

---

## Success Criteria

### Interaction Model

- Sets logged with 1 tap (when prediction is correct)
- Exercise change: 1 tap from quick rail (never navigates away)
- Rest skip: tap anywhere (not a precise small button)
- Workout complete: automatic detection + slide-up surface

### Motion Experience

- No abrupt state changes
- No modal interruptions during active training
- Queue rail always visible during active phase
- Rest ring breathes, not ticks

### Emotional Feel

After Phase 8, users should feel:

> "The system is tracking my training with me, not waiting for me to enter data."

FitCoach is no longer a workout logger.
It is a **Runtime-Driven Fitness Experience System**.
