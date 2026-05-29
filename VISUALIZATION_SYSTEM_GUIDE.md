# FitCoach Visualization System Guide

**Scope:** How to define, extend, and consume domain-specific colors without polluting the theme system.

---

## Core Principle

Visualization colors carry **business meaning**. Theme colors carry **structural meaning**. Never confuse the two.

| Aspect | Theme | Visualization |
|--------|-------|---------------|
| Purpose | UI readability | Data expression |
| Examples | bg-card, text-foreground | fatigue orange, intensity lime |
| Adapt to theme? | Yes (dark/light) | No (domain-fixed) |
| Allowed in primitives? | Yes | No |
| Business logic? | No | Yes |

---

## Existing Visualization Modules

### 1. Fatigue (`src/design-system/visualization/fatigue.ts`)

```ts
import { fatiguePalette, fatigueStates, fatigueClasses } from "@/design-system/visualization/fatigue";

// Surface colors
fatiguePalette.base      // "#FF9940"
fatiguePalette.dim       // "rgba(255, 153, 64, 0.08)"
fatiguePalette.glow      // "rgba(255, 153, 64, 0.18)"
fatiguePalette.background // "rgba(255, 153, 64, 0.05)"

// State levels
fatigueStates.low       // well-recovered
fatigueStates.medium    // moderate fatigue
fatigueStates.high      // high fatigue
fatigueStates.critical  // overreaching
```

### 2. Intensity (`src/design-system/visualization/intensity.ts`)

```ts
import { intensityPalette, intensityStates, intensityClasses } from "@/design-system/visualization/intensity";

intensityPalette.base     // "#B8FF2B"
intensityStates.low       // warm-up / easy
intensityStates.medium    // moderate
intensityStates.high      // hard
intensityStates.critical  // max effort / PR
```

### 3. Heart Rate (`src/design-system/visualization/heart-rate.ts`)

```ts
import { heartRatePalette, heartRateZones, restingHeartRate } from "@/design-system/visualization/heart-rate";

heartRateZones.low      // Zone 1: Recovery (< 60% maxHR)
heartRateZones.medium   // Zone 2: Aerobic (60–70%)
heartRateZones.high     // Zone 3: Threshold (70–80%)
heartRateZones.critical // Zone 4: Anaerobic (80–90%)
heartRateZones.optimal  // Zone 5: VO2 Max (90–100%)
```

### 4. Recovery (`src/design-system/visualization/recovery.ts`)

```ts
import { recoveryPalette, recoveryStates, restTimerPalette, recoveryClasses } from "@/design-system/visualization/recovery";

recoveryPalette.base    // "#00E5CC"
recoveryStates.low      // poor recovery
recoveryStates.medium   // adequate
recoveryStates.high     // good recovery
recoveryStates.optimal  // fully recovered

// Rest timer urgency levels
restTimerPalette.normal   // "#00E5CC"
restTimerPalette.urgent   // "#FF9940"
restTimerPalette.critical // "#FF3B5C"
```

---

## How to Define a New State

### Step 1: Choose the right module

Does the state relate to an existing domain?
- Muscle strain → `fatigue.ts`
- Workout effort → `intensity.ts`
- Cardio zone → `heart-rate.ts`
- Readiness → `recovery.ts`

If none fit, create a new module:

```ts
// src/design-system/visualization/hydration.ts
import type { VizPalette, StatePalette } from "./contract";

export const HYDRATION_BASE = "#3B82F6";

export const hydrationPalette: VizPalette = {
  base: HYDRATION_BASE,
  dim: "rgba(59, 130, 246, 0.08)",
  glow: "rgba(59, 130, 246, 0.18)",
  background: "rgba(59, 130, 246, 0.05)",
  foreground: "#3B82F6",
};

export const hydrationStates: StatePalette = {
  low: "rgba(59, 130, 246, 0.30)",
  medium: "rgba(59, 130, 246, 0.55)",
  high: "rgba(59, 130, 246, 0.80)",
};
```

### Step 2: Export from index

```ts
// src/design-system/visualization/index.ts
export * from "./hydration";
```

### Step 3: Consume in UI components (via props)

```tsx
// ❌ WRONG: direct import in primitive
import { hydrationPalette } from "@/design-system/visualization/hydration";

// ✅ CORRECT: passed as prop from parent
function HydrationWidget({ palette }: { palette: VizPalette }) {
  return <div style={{ background: palette.background }}>...</div>;
}
```

---

## How NOT to Pollute the Theme System

### Forbidden Patterns

```tsx
// ❌ Using viz color as a UI button color
<button className="bg-orange-500">Start</button>

// ❌ Importing viz into a primitive component
import { fatiguePalette } from "@/design-system/visualization/fatigue";
function Card() { return <div style={{ borderColor: fatiguePalette.base }}>...</div>; }

// ❌ Using viz hex in theme-adjacent logic
const statusColor = isFatigued ? "#FF9940" : "#00E5CC";
<div className={`bg-[${statusColor}]`}>...</div>

// ❌ Hardcoding viz color in inline style
<div style={{ color: '#B8FF2B' }}>Intensity</div>
```

### Correct Patterns

```tsx
// ✅ Pass color via props from a domain-aware parent
function WorkoutSurface({ intensity }: { intensity: 'low' | 'medium' | 'high' }) {
  const color = intensityStates[intensity];
  return <div style={{ background: color }}>...</div>;
}

// ✅ Use semantic tokens for structure, viz for data overlay
<div className="bg-card border border-border p-4">
  <IntensityChart color={intensityPalette.base} />
</div>

// ✅ Use CSS custom properties for runtime theming
<div style={{ '--intensity-color': intensityPalette.base } as React.CSSProperties}>
  <div className="text-[var(--intensity-color)]">...</div>
</div>
```

---

## Extending Palettes

If a new state level is needed (e.g., "extreme" between high and critical):

1. Add to the `StatePalette` type in `contract.ts` if it's a new universal level
2. Add the state value to the module's state object
3. Update any consumers to handle the new state
4. Do NOT create a new token in `theme/` for this

---

## Color Accessibility for Visualization

Visualization colors are exempt from dark/light adaptation, but they must still be accessible:

- Always place viz colors on **neutral surfaces** (`bg-card`, `bg-background`)
- Never place two viz colors adjacent without sufficient contrast
- For text on viz backgrounds, use `rgb(var(--shadow))` (always dark) or `rgb(var(--foreground))`

---

*Visualization is where FitCoach expresses personality. Keep it expressive, but keep it contained.*
