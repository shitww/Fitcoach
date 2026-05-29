# FitCoach Visualization Convergence Report — Phase 12

**Date:** 2026-05-29  
**Status:** COMPLETE

---

## Objective

Prevent the visualization layer from becoming a second design system.

Before Phase 12, each domain had its own:
- Palette (`fatiguePalette`, `intensityPalette`, etc.)
- State definitions (`low`, `medium`, `high`)
- Color logic (`#FF9940`, `#B8FF2B`, etc.)

This created **visual fragmentation risk** — each domain was a mini design system.

---

## Solution: Unified Perceptual Scale System

### Core Architecture

```
Raw Domain Value → Domain Mapper → VisualIntensity (0–4) → Renderer → Visual Properties
```

**VisualIntensity:**
- `0` — resting / inactive / neutral
- `1` — low / mild / easy
- `2` — moderate / working / normal
- `3` — high / intense / elevated
- `4` — critical / max / extreme

---

## File Structure

```
src/design-system/visualization/
├── core/                        ← NEW (single authority)
│   ├── types.ts                ← VisualIntensity, VizDomain
│   ├── scale.ts                ← normalizePercentile, clampIntensity
│   ├── mapper.ts               ← mapToVisualState, executeDomainMap
│   ├── renderer.ts             ← SINGLE color authority
│   └── index.ts
│
├── domains/                     ← REFACTORED (pure mappers)
│   ├── fatigue.ts              ← mapFatigueToScale, mapSorenessToScale
│   ├── intensity.ts            ← mapRPEToScale, mapPercentIntensityToScale
│   ├── heart-rate.ts           ← mapHRZoneToScale, mapBPMToScale
│   ├── recovery.ts             ← mapRecoveryToScale, mapRestTimerToScale
│   └── index.ts
│
├── registry.ts                  ← Domain registration + useViz()
├── index.ts                     ← Unified exports
│
└── (legacy Phase 11 files)
    ├── contract.ts
    ├── fatigue.ts              ← palette (deprecated)
    ├── intensity.ts            ← palette (deprecated)
    ├── heart-rate.ts           ← palette (deprecated)
    └── recovery.ts             ← palette (deprecated)
```

---

## What Changed

### Before (Phase 11)

```ts
import { fatiguePalette } from "@/design-system/visualization/fatigue";

// Each domain owned its own colors
<div style={{ background: fatiguePalette.base }}>
```

### After (Phase 12)

```ts
import { mapFatigueToScale, renderVisualState } from "@/design-system/visualization";

// Domains only produce numbers; renderer produces colors
const intensity = mapFatigueToScale(75);     // → 3
const visual = renderVisualState(intensity); // → { surface, foreground, border, ... }

<div style={{ background: visual.surface }}>
```

---

## Domain Mappers

| Domain | Function | Input Range | Thresholds |
|--------|----------|-------------|--------------|
| Fatigue | `mapFatigueToScale` | 0–100 | 0/19/49/74/89 |
| Soreness | `mapSorenessToScale` | 0–10 | 0/2.5/5/7.5/10 |
| RPE | `mapRPEToScale` | 1–10 | 2/4/6/8/10 |
| %Intensity | `mapPercentIntensityToScale` | 0–100% | 20/40/60/80/100 |
| Heart Rate | `mapHRZoneToScale` | % of max HR | 60/70/80/90/100 |
| Recovery | `mapRecoveryToScale` | 0–100 | 85/65/45/25/0 |
| Rest Timer | `mapRestTimerToScale` | seconds | 75/50/25/8/0% |

---

## Renderer Output

| Intensity | Tailwind BG | Tailwind Text | Tailwind Border | Surface (CSS) |
|-----------|-------------|---------------|-----------------|---------------|
| 0 | `bg-muted` | `text-muted-foreground` | `border-border/40` | `rgb(var(--muted) / 0.30)` |
| 1 | `bg-accent/20` | `text-accent` | `border-accent/30` | `rgb(var(--accent) / 0.12)` |
| 2 | `bg-accent/30` | `text-accent` | `border-accent/50` | `rgb(var(--accent) / 0.25)` |
| 3 | `bg-warning/40` | `text-warning` | `border-warning/60` | `rgb(var(--warning) / 0.35)` |
| 4 | `bg-destructive/50` | `text-destructive` | `border-destructive/70` | `rgb(var(--destructive) / 0.45)` |

**All values are semantic and adapt to dark/light themes.**

---

## Enforcement

### ESLint

Added `xfitx/raw-color-guard` in `eslint.config.mjs`:
- Hex colors forbidden in `theme/`, `primitives/`
- Raw `rgba()`/`rgb()` forbidden in `theme/`, `primitives/`

### Boundary Scanner

`scripts/enforce-design-boundaries.ts` passes:
- `0 violations, 0 files affected`

### Runtime Guard

`src/design-system/core/runtime-guard.tsx` now detects:
- `reportScaleBypass()` — domain bypassed unified scale
- `reportDirectPalette()` — palette used outside renderer

---

## Migration Path for Existing Code

### Step 1: Identify legacy palette usage

Search for:
```
fatiguePalette, intensityPalette, heartRatePalette, recoveryPalette
```

### Step 2: Replace with unified flow

```ts
// BEFORE (Phase 11)
import { fatiguePalette } from "@/design-system/visualization/fatigue";
<div style={{ background: fatiguePalette.background }} />

// AFTER (Phase 12)
import { mapFatigueToScale, renderVisualState } from "@/design-system/visualization";
const visual = renderVisualState(mapFatigueToScale(fatigueScore));
<div style={{ background: visual.surface }} />
```

### Step 3: Registry usage (recommended)

```ts
import { useViz } from "@/design-system/visualization";
const visual = useViz("fatigue", 75);
<div className={visual.tailwind.bg} />
```

---

## Anti-Fragmentation Guarantees

| Risk | Prevention |
|------|------------|
| New domain creates own palette | MUST register in `registry.ts` and use `VizDomain<T>` interface |
| Domain returns color | `executeDomainMap()` validates output is `VisualIntensity 0–4` |
| Component uses palette directly | Runtime guard `reportDirectPalette()` warns in dev |
| Visual drift across metrics | Single `renderer.ts` maps all intensities |
| AI generates inconsistent viz | `.cursor/rules/design-system.mdc` enforces scale-first pattern |

---

## Success Criteria

- [x] One visualization scale system (`VisualIntensity 0–4`)
- [x] One renderer system (`core/renderer.ts`)
- [x] All domains produce numbers only (no colors)
- [x] No domain owns color anymore
- [x] Zero cross-domain violations
- [x] Registry enforces unified domain interface

---

*Phase 12 ensures FitCoach's visualization layer is a single, deterministic system — not a collection of independent design systems.*
