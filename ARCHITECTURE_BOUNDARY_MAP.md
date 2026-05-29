# FitCoach Architecture Boundary Map

Visual reference for the 3-layer Design Operating System.

---

## Layer Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                        VISUALIZATION LAYER                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐             │
│  │ Fatigue  │ │ Intensity│ │Heart Rate│ │ Recovery │             │
│  │ #FF9940  │ │ #B8FF2B  │ │ #8B5CF6  │ │ #00E5CC  │             │
│  │ orange   │ │ lime     │ │ purple   │ │ teal     │             │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘             │
│                                                                    │
│  Rules:                                                            │
│  • Business meaning ONLY                                           │
│  • Can import: theme, primitives                                   │
│  • Dynamic, expressive, state-driven                               │
│  • Colors do NOT adapt to dark/light                               │
│                                                                    │
│  Consumers: runtime-ui components, charts, analytics widgets        │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ imports
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                        PRIMITIVE LAYER                             │
│  ┌─────┐ ┌──────┐ ┌────┐ ┌─────┐ ┌──────┐ ┌─────┐ ┌────────┐     │
│  │Card │ │Button│ │Text│ │Input│ │Surface│ │Badge│ │ Section│     │
│  │     │ │      │ │    │ │     │ │       │ │     │ │        │     │
│  └─────┘ └──────┘ └────┘ └─────┘ └──────┘ └─────┘ └────────┘     │
│                                                                    │
│  Rules:                                                            │
│  • Structure ONLY — no color logic, no domain meaning              │
│  • Can import: theme                                               │
│  • Must NOT import: visualization                                  │
│  • Props: variant, className (escape hatch, guarded by ESLint)    │
│                                                                    │
│  Location: src/components/ui/primitives/                           │
│            src/design-system/primitives/ (contracts)              │
└─────────────────────────────────────────────────────────────────────┘
                              ▲
                              │ imports
                              │
┌─────────────────────────────────────────────────────────────────────┐
│                          THEME LAYER                               │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │
│  │ background │ │ foreground │ │    card    │ │   border   │       │
│  │  #000000   │ │ #F5F5F5   │ │  #0A0A0A   │ │  #323232   │       │
│  │  (dark)    │ │  (dark)    │ │   (dark)   │ │   (dark)   │       │
│  ├────────────┤ ├────────────┤ ├────────────┤ ├────────────┤       │
│  │ #FAFAFA    │ │ #121216    │ │  #FFFFFF   │ │  #D4D4D8   │       │
│  │  (light)   │ │  (light)   │ │  (light)   │ │  (light)   │       │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘       │
│                                                                    │
│  Rules:                                                            │
│  • UI foundation — universal, stable, never per-feature           │
│  • No business meaning                                             │
│  • No hardcoded colors (hex, rgb, rgba, hsl)                     │
│  • Adapts to .dark / .light via CSS custom properties              │
│  • Can import: NOTHING                                             │
│                                                                    │
│  Location: src/app/globals.css (CSS vars)                          │
│            src/design-system/theme/ (TS contracts)                │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│  Page (src/app/*/page.tsx)                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Composes:                                             │  │
│  │  • Primitive components (Card, Button, Text)           │  │
│  │  • Domain components (IntensityWidget, FatigueBanner)    │  │
│  │  • NO hardcoded colors                                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────────┐
│   Primitive Components   │     │   Domain Components          │
│   (structural)           │     │   (business meaning)         │
│   • Card                 │     │   • IntensityWidget          │
│   • Button               │     │   • FatigueTrend             │
│   • Text                 │     │   • RecoveryStatus           │
│   • Surface              │     │                              │
│   • Input                │     │  Consumes:                   │
│                          │     │  • Primitives for structure  │
│  Consumes:               │     │  • Visualization for color │
│  • Theme tokens only     │     │                              │
└─────────────────────────┘     └─────────────────────────────┘
              │                               │
              └───────────────┬───────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Theme Tokens                            │
│  bg-background · text-foreground · border-border · etc.   │
│  Defined in: src/app/globals.css                            │
│  Contracted in: src/design-system/theme/                    │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ (read-only)
┌─────────────────────────────────────────────────────────────┐
│                   Visualization Tokens                         │
│  fatiguePalette · intensityPalette · recoveryPalette · etc. │
│  Defined in: src/design-system/visualization/                 │
│  NEVER imported by theme or primitives                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Enforcement Points

```
┌──────────────────┐    ┌─────────────────────┐    ┌──────────────┐
│   ESLint         │    │  Boundary Scanner   │    │  Runtime     │
│   (build-time)   │    │  (CI-time)          │    │  (dev-time)  │
│                  │    │                     │    │              │
│  • no-restricted │    │  • cross-domain     │    │  • console   │
│    imports       │    │    imports          │    │    warnings  │
│  • no-restricted │    │  • viz color leaks  │    │              │
│    syntax        │    │  • state word leaks │    │              │
│                  │    │                     │    │              │
│  pnpm lint       │    │  npx tsx scripts/   │    │  browser     │
│                  │    │    enforce-design-    │    │  dev tools   │
│                  │    │    boundaries.ts     │    │              │
└──────────────────┘    └─────────────────────┘    └──────────────┘
```

---

## File Location Quick Reference

| What | Where | Domain |
|------|-------|--------|
| Semantic token definitions | `src/app/globals.css` | Theme |
| Token TS contracts | `src/design-system/theme/` | Theme |
| Primitive contracts | `src/design-system/primitives/` | Primitive |
| Primitive implementations | `src/components/ui/primitives/` | Primitive |
| Fatigue colors | `src/design-system/visualization/fatigue.ts` | Visualization |
| Intensity colors | `src/design-system/visualization/intensity.ts` | Visualization |
| Heart rate colors | `src/design-system/visualization/heart-rate.ts` | Visualization |
| Recovery colors | `src/design-system/visualization/recovery.ts` | Visualization |
| Boundary enforcement | `src/design-system/core/boundary.ts` | Core |
| Runtime warnings | `src/design-system/core/runtime-guard.tsx` | Core |
| Scanner script | `scripts/enforce-design-boundaries.ts` | CI |
| Theme scanner | `scripts/check-theme-violations.ts` | CI |
| ESLint config | `eslint.config.mjs` | CI |
| AI guardrails | `.cursor/rules/design-system.mdc` | AI |

---

*This map is the single source of truth for FitCoach's design system architecture.*
