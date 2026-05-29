# FitCoach Design System Governance

**Version:** 1.0.0  
**Effective:** 2026-05-29  
**Enforced by:** ESLint + `scripts/enforce-design-boundaries.ts` + runtime guard

---

## 3-Layer Architecture

FitCoach UI is governed by a strict 3-layer separation. No layer may leak into another.

```
┌─────────────────────────────────────────────────────────────┐
│                    VISUALIZATION DOMAIN                      │
│  fatigue · intensity · heart-rate · recovery · completion      │
│  #B8FF2B · #FF9940 · #8B5CF6 · #00E5CC · #FFD700             │
│  Business meaning ONLY. Dynamic. Expressive.                 │
│  Can import: theme, primitives                                 │
├─────────────────────────────────────────────────────────────┤
│                    PRIMITIVE DOMAIN                            │
│  Card · Button · Surface · Input · Section · Screen          │
│  Structure ONLY. No color logic. No domain meaning.           │
│  Can import: theme                                             │
│  Must NOT import: visualization                                │
├─────────────────────────────────────────────────────────────┤
│                      THEME DOMAIN                              │
│  background · foreground · card · muted · border · accent     │
│  UI foundation. Universal. Never changes per feature.        │
│  No business meaning. No physiological state.                │
│  Can import: nothing                                           │
└─────────────────────────────────────────────────────────────┘
```

---

## Responsibility Model

### Theme Domain (`src/design-system/theme/`)

**Owns:** CSS custom properties, semantic token contracts, Tailwind mapping  
**Rules:**
- No hardcoded hex, rgb, rgba, hsl
- No business state references (fatigue, intensity, recovery)
- No imports from visualization
- All colors must adapt to `.dark` / `.light`

**Files:**
- `tokens.ts` — semantic token type definitions
- `rules.ts` — enforcement constants

### Primitive Domain (`src/design-system/primitives/` + `src/components/ui/primitives/`)

**Owns:** Reusable UI components  
**Rules:**
- No color logic
- No domain meaning in props or implementation
- Only consume theme tokens
- Can import from `theme/`
- Must NOT import from `visualization/`

**Files:**
- `contract.ts` — primitive type system
- `Surface.tsx`, `Card.tsx`, `Button.tsx`, etc. — implementations

### Visualization Domain (`src/design-system/visualization/`)

**Owns:** Domain-specific color systems  
**Rules:**
- Expressive colors allowed
- Domain state words allowed
- Can import from `theme/` and `primitives/`
- Must export palettes via typed APIs
- Must NOT be imported by theme or primitives

**Files:**
- `contract.ts` — base types for all viz modules
- `fatigue.ts`, `intensity.ts`, `heart-rate.ts`, `recovery.ts`

---

## Import Rules

```
theme ← ∅                          (no imports)
primitives ← theme                 (only theme)
visualization ← theme, primitives  (theme + primitives)
ui-components ← theme, primitives, visualization (via props only)
pages ← theme, primitives          (no direct viz import)
```

**Forbidden patterns:**
- `import { ... } from "@/design-system/visualization/fatigue"` in `theme/*`
- `import { ... } from "@/design-system/visualization/intensity"` in `primitives/*`
- Using `#B8FF2B` or `#FF9940` in `theme/*` or `primitives/*`

---

## Enforcement Mechanisms

### 1. ESLint (Build-time)

```bash
pnpm lint
```

Rules enforced:
- `xfitx/theme-guard` — no hardcoded Tailwind colors in any file
- `xfitx/page-color-guard` — no hardcoded colors in pages
- `xfitx/cross-domain-theme` — theme/primitives cannot import visualization
- `xfitx/cross-domain-primitives` — primitives cannot import visualization
- `xfitx/raw-color-guard` — no hex/rgba/hsl in theme/primitive files

### 2. Boundary Scanner (CI-time)

```bash
npx tsx scripts/enforce-design-boundaries.ts
```

Scans for:
- Cross-domain imports
- Visualization color leaks into theme/primitives
- Domain state words in theme/primitive files

Output: `DESIGN_BOUNDARY_REPORT.md`

### 3. Runtime Guard (Dev-time)

```tsx
import { DesignSystemGuard } from "@/design-system/core";

// Wrap app root
<DesignSystemGuard>
  <App />
</DesignSystemGuard>
```

Warns in browser console if visualization colors leak into UI components.

---

## Decision Tree

```
Is this color describing a UI surface or structure?
  ├─ YES → Use Theme Domain (bg-background, text-foreground, etc.)
  └─ NO → Is this a reusable layout component?
      ├─ YES → Use Primitive Domain (Card, Button, Surface)
      └─ NO → Is this describing a physiological/business state?
          ├─ YES → Use Visualization Domain (fatiguePalette, etc.)
          └─ NO → Default to Theme Domain
```

---

## Escalation Path

If a developer believes a rule should be broken:

1. Document the exception in the PR
2. Add a code comment explaining why
3. Get explicit approval from the design system owner
4. If approved, the exception becomes a documented rule amendment

**No silent exceptions. No "just this once."**

---

*This document is a living contract. Updates require PR approval.*
