# FitCoach Design System Rules

**Enforced by:** ESLint `no-restricted-syntax` + `scripts/check-theme-violations.ts`
**Applies to:** All `src/**/*.tsx`, `src/**/*.ts`, `src/**/*.css`

---

## Absolute Prohibitions

The following are **banned** in all UI code unless explicitly exempt:

### Tailwind Classes
- `text-white`, `text-black`
- `bg-white`, `bg-black`
- `bg-zinc-*`, `text-zinc-*`, `border-zinc-*`
- `bg-gray-*`, `text-gray-*`, `border-gray-*`
- `bg-slate-*`, `text-slate-*`, `border-slate-*`
- `bg-neutral-*`, `text-neutral-*`, `border-neutral-*`
- `bg-stone-*`, `text-stone-*`, `border-stone-*`

### Inline Styles
- `style={{ color: '#...' }}`
- `style={{ color: 'rgb(...)' }}`
- `style={{ color: 'rgba(...)' }}`
- `style={{ background: '#...' }}`
- `style={{ background: 'rgb(...)' }}`
- `style={{ background: 'rgba(...)' }}`
- `style={{ borderColor: '#...' }}`

### CSS
- Hex colors (`#RRGGBB`, `#RGB`) except in data viz / brand / chart contexts
- `rgba(...)` except for state visualization colors
- `hsl(...)` with hardcoded values

---

## Exemptions

The following categories are **permitted** to use non-semantic colors:

1. **Data Visualization**
   - Recharts charts, custom SVG graphs
   - Muscle heatmaps, progress arcs
   - Macro nutrition color coding (carbs/protein/fat)

2. **Brand / Runtime State**
   - Runtime state colors: active (lime), rest (teal), fatigue (orange), complete (gold), transition (purple)
   - These are defined in `src/styles/runtime-visual-language.css`

3. **Logos & Assets**
   - Static SVG brand marks
   - External image assets

4. **CSS Custom Property Definitions**
   - Defining `--my-token: #B8FF2B;` is allowed in `.css` files
   - Using `--my-token` via `var()` is the preferred pattern

---

## Architecture Rules

### 1. Primitive First

All new UI must be built from `src/components/ui/primitives/` or composed from existing shadcn/ui components.

```
Page → Composes Components → Uses Primitives → Uses Semantic Tokens
```

### 2. No Theme Escapes

A "theme escape" is any hardcoded color that does not adapt when `.light` or `.dark` class changes.

Even one `text-white` in a component can make it unreadable in the opposite theme.

### 3. Contrast Guarantee

All text must meet **WCAG AA** minimums:
- Normal text (14px–17px): **4.5:1** minimum
- Large text (18px+ bold, 24px+ regular): **3:1** minimum

The semantic token system is calibrated to meet these ratios on intended surfaces.

### 4. Shadow Consistency

Shadows are always dark regardless of theme:
```css
/* Correct */
box-shadow: 0 4px 12px rgb(var(--shadow) / 0.3);

/* Wrong */
box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3); /* bypasses theme */
```

### 5. Opacity via Tokens

Use CSS custom property opacity, not hardcoded rgba:
```css
/* Correct */
border: 1px solid rgb(var(--foreground) / 0.10);
background: rgb(var(--background) / 0.92);

/* Wrong */
border: 1px solid rgba(255, 255, 255, 0.10);
```

---

## Enforcement

### CI/CD Gate

Add to your CI pipeline:

```yaml
# .github/workflows/ci.yml (example)
- name: Theme Safety Check
  run: npx tsx scripts/check-theme-violations.ts
```

### Pre-commit Hook (optional)

```bash
# .husky/pre-commit or similar
npx tsx scripts/check-theme-violations.ts || exit 1
```

### ESLint

Run `pnpm lint` — the `xfitx/theme-guard` and `xfitx/page-color-guard` rules catch hardcoded colors at build time.

---

## Maintenance

### Adding a New Semantic Token

1. Add CSS custom property to `src/app/globals.css` in both `:root/.dark` and `.light`
2. Map it in `@theme inline` if Tailwind class access is needed
3. Document in this file and `THEME_MIGRATION_GUIDE.md`
4. Update primitives if applicable

### Token Naming Convention

```
--{category}-{modifier}: R G B;
```

Examples:
- `--background: 0 0 0;`
- `--muted-foreground: 160 160 160;`
- `--success: 52 211 153;`

Always space-separated RGB (CSS Color Module Level 4).

---

## Violation Severity

| Severity | Example | Impact |
|----------|---------|--------|
| **Critical** | `text-white`, `bg-black`, `bg-zinc-950` | Breaks one or both themes outright |
| **High** | `rgba(255,255,255,0.4)` in inline styles | Does not adapt to theme switch |
| **Medium** | `white` in a comment or variable name | Verify context; often false positive |

---

*Strict adherence to these rules ensures FitCoach never experiences theme drift again.*
