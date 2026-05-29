# FitCoach Design System — Quickstart

Learn the entire design system in under 1,000 words.

---

## The 3-Layer Mental Model

```
src/design-system/
  theme/   → colors, tokens, semantic rules
  ui/      → layout primitives (Card, Button, etc.)
  viz/     → ONE function for all data visualization
```

That's it. Three folders. Three concepts.

---

## 1. Theme (Colors)

Never use hardcoded colors. Use semantic tokens:

| What you need | Token |
|---------------|-------|
| Background | `bg-background` |
| Card surface | `bg-card` |
| Muted surface | `bg-muted` |
| Primary action | `bg-primary` |
| Text | `text-foreground` |
| Secondary text | `text-muted-foreground` |
| Border | `border-border` |
| Danger | `bg-destructive` |
| Warning | `bg-warning` |

```tsx
<div className="bg-card border border-border rounded-xl p-4">
  <h2 className="text-foreground font-bold">Title</h2>
  <p className="text-muted-foreground">Description</p>
</div>
```

**Rule:** If it's a UI color, it's a theme token.

---

## 2. UI Primitives (Layout)

Import from `@/design-system/ui`:

```tsx
import { PRIMITIVE_COLOR_MAP, PrimitiveVariant } from "@/design-system/ui";
```

Primitives are structural. They consume theme tokens. They carry NO color logic.

---

## 3. Visualization (Data Colors)

**ONE function. ONE import.**

```tsx
import { useDesignViz } from "@/design-system/viz";

const visual = useDesignViz("fatigue", 75);
```

`visual` gives you everything:

| Property | Example |
|----------|---------|
| `visual.intensity` | `3` (0–4 scale) |
| `visual.tailwind.bg` | `"bg-warning/40"` |
| `visual.tailwind.text` | `"text-warning"` |
| `visual.tailwind.border` | `"border-warning/60"` |
| `visual.surface` | `"rgb(var(--warning) / 0.35)"` |
| `visual.foreground` | `"rgb(var(--warning))"` |
| `visual.glow` | `"0 0 30px rgb(var(--warning) / 0.18)"` |

```tsx
<div className={visual.tailwind.bg}>
  <span className={visual.tailwind.text}>High Fatigue</span>
</div>
```

**Supported domains:** `fatigue`, `intensity`, `heart-rate`, `recovery`

---

## What NOT to Do

```tsx
// ❌ Hardcoded colors
<div className="bg-zinc-950 text-white">

// ❌ Direct viz internals
import { renderVisualState } from "@/design-system/visualization/core/renderer";
import { mapFatigueToScale } from "@/design-system/visualization/domains/fatigue";

// ❌ Old palette exports
import { fatiguePalette } from "@/design-system/visualization/fatigue";
```

---

## Cheat Sheet

```
Need a UI color?     → Theme token (bg-background, text-foreground)
Need a layout piece?   → UI primitive
Need a health metric?  → useDesignViz("domain", value)
```

---

*If you find yourself importing more than 2 things from design-system, you're over-engineering.*
