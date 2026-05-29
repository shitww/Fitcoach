# FitCoach Theme Migration Guide

**For:** All future UI development in FitCoach
**Rule:** Every new component and page must use semantic tokens exclusively.

---

## Quick Reference: Hardcoded → Semantic

| ❌ Never Use | ✅ Use Instead | Notes |
|-------------|--------------|-------|
| `text-white` | `text-foreground` or `text-primary-foreground` | `foreground` for body text, `primary-foreground` for buttons |
| `text-black` | `text-foreground` | In both themes, `foreground` is the readable text color |
| `bg-black` | `bg-background` | Page/surface background |
| `bg-white` | `bg-card` or `bg-background` | `card` for elevated surfaces |
| `bg-zinc-900/950` | `bg-card` or `bg-secondary` | Card surfaces for panels, secondary for inputs |
| `border-zinc-800` | `border-border` | Universal border token |
| `text-gray-400` / `text-zinc-400` | `text-muted-foreground` | Secondary/descriptive text |
| `bg-gray-100` / `bg-zinc-100` | `bg-muted` or `bg-secondary` | Subtle background variation |
| `rgba(255,255,255,0.x)` | `rgb(var(--foreground) / 0.x)` | CSS custom property opacity |
| `rgba(0,0,0,0.x)` | `rgb(var(--shadow) / 0.x)` | Shadows and dark overlays |
| `#RRGGBB` in className | Semantic token | Only exempt for charts/data viz/brand logos |
| `style={{ color: '#...' }}` | Semantic className or CSS var | Never inline hex/rgba |

---

## Creating a New Component

### 1. Use Primitives (Recommended)

```tsx
import { Card, Text, Button, Section } from "@/components/ui/primitives";

export function MyFeature() {
  return (
    <Section title="Feature">
      <Card className="p-4 space-y-3">
        <Text size="section">Heading</Text>
        <Text variant="muted">Description text</Text>
        <Button>Action</Button>
      </Card>
    </Section>
  );
}
```

Primitives automatically adapt to dark/light themes.

### 2. Manual Tailwind Tokens (When Primitives Don't Fit)

```tsx
// ✅ Correct — all semantic tokens
<div className="bg-card border border-border rounded-xl p-4">
  <h2 className="text-foreground font-bold">Title</h2>
  <p className="text-muted-foreground">Body</p>
  <button className="bg-primary text-primary-foreground hover:bg-primary/90">
    Submit
  </button>
</div>

// ❌ Wrong — hardcoded colors
<div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4">
  <h2 className="text-white font-bold">Title</h2>
  <p className="text-gray-400">Body</p>
  <button className="bg-white text-black">Submit</button>
</div>
```

### 3. For Opacity / Overlays

```tsx
// ✅ Correct
<div className="bg-background/80 backdrop-blur-sm" />

// Or in CSS:
.my-overlay {
  background: rgb(var(--foreground) / 0.05);
  border: 1px solid rgb(var(--foreground) / 0.10);
}
```

### 4. State / Data Visualization Colors (Exempt)

Only these are allowed to use non-semantic colors:
- Charts (`recharts`, custom SVG charts)
- Runtime state indicators (active/rest/fatigue/complete)
- Muscle group color maps
- Macro nutrition color indicators

Even then, prefer mapping to semantic tokens when possible:

```tsx
// For charts, wrap in a container that sets context
<div className="text-success"> // semantic
  <MyCustomChart color="var(--success)" />
</div>
```

---

## Page-Level Guidelines

Pages **may** use semantic tokens for layout shells. They **must not** use hardcoded colors.

```tsx
// ✅ Page layout with semantic tokens
export default function Page() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <h1 className="text-2xl font-bold">Title</h1>
        <MyComponent /> {/* Component handles its own colors */}
      </div>
    </div>
  );
}
```

---

## Testing Theme Compatibility

Before committing a new component:

1. **Preview in both themes:**
   ```bash
   # Toggle theme in browser dev tools or UI toggle
   # Check that no text disappears into background
   ```

2. **Run the scanner:**
   ```bash
   npx tsx scripts/check-theme-violations.ts
   ```

3. **Check ESLint:**
   ```bash
   pnpm lint
   ```

---

## Common Pitfalls

| Pitfall | Why It Breaks | Fix |
|---------|---------------|-----|
| `text-white` on `bg-primary` | In light mode, `bg-primary` is black, so white text is fine. But if you use `text-white` directly on `bg-card` in light mode, text is invisible. | Use `text-primary-foreground` on primary buttons, `text-foreground` on cards. |
| `bg-black` for modals | In light mode, modal is black instead of themed overlay. | Use `bg-background/95 backdrop-blur-sm` |
| `opacity-50` on text | May reduce contrast below WCAG AA. | Use `text-muted-foreground` instead of `opacity-50` on `text-foreground`. |
| Inline `style={{ color: '...' }}` | Bypasses Tailwind and theme system entirely. | Use className with semantic tokens or CSS custom properties. |
| Hardcoded `border-zinc-800` | In light mode, dark border looks wrong. | Use `border-border` which adapts. |

---

## Token Reference

### Surface Tokens

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `bg-background` | `#000000` | `#FAFAFA` | Page background |
| `bg-card` | `#0A0A0A` | `#FFFFFF` | Elevated cards, panels |
| `bg-secondary` | `#161616` | `#F0F0F0` | Inputs, secondary surfaces |
| `bg-muted` | `#202020` | `#E4E4E7` | Subtle backgrounds, badges |
| `bg-primary` | `#CCFF00` | `#000000` | Primary buttons, CTAs |
| `bg-accent` | `#CCFF00` | `#000000` | Accent highlights |
| `bg-destructive` | `#FF3B5C` | `#DC2626` | Errors, delete actions |
| `bg-success` | `#34D399` | `#15803D` | Success states |
| `bg-warning` | `#FBBF24` | `#B45309` | Warnings |

### Text Tokens

| Token | Dark | Light | Usage |
|-------|------|-------|-------|
| `text-foreground` | `#F5F5F5` | `#121216` | Primary body text |
| `text-muted-foreground` | `#A0A0A0` | `#3C3C44` | Descriptions, hints |
| `text-primary-foreground` | `#000000` | `#FFFFFF` | Text on primary buttons |
| `text-secondary-foreground` | `#DCDCDC` | `#18181B` | Text on secondary surfaces |
| `text-card-foreground` | `#EBEBEB` | `#121216` | Text on cards |
| `text-destructive-foreground` | `#FFFFFF` | `#FFFFFF` | Text on destructive buttons |

### Border & Misc

| Token | Dark | Light |
|-------|------|-------|
| `border-border` | `#323232` | `#D4D4D8` |
| `ring-ring` | `#CCFF00` | `#000000` |

---

*Last updated: 2026-05-29*
