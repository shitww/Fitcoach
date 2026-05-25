import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    name: "xfitx/theme-guard",
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      /* ── Hardcoded color guard ──
         These are architecture rules, not style rules.
         All UI colors must come from the semantic token system
         (bg-background, text-foreground, border-border, etc.)
         so themes can be switched without rewriting components.
         ---------------------------------------------------------------- */
      "no-restricted-syntax": [
        "error",
        /* Tailwind hardcoded colors */
        { selector: "JSXAttribute[name.name='className'] Literal[value=/\\b(bg-black|bg-white|text-black|text-white|bg-zinc-|text-zinc-|bg-gray-|text-gray-|bg-slate-|text-slate-|bg-neutral-|text-neutral-|bg-stone-|text-stone-|border-zinc-|border-gray-|border-slate-|border-neutral-|border-stone-)\\b/]", message: "Use semantic tokens (bg-background, text-foreground, border-border, etc.) instead of hardcoded Tailwind colors." },
        /* Inline style hardcoded hex/rgba on color-related props */
        { selector: "Property[key.name=/color/i] Literal[value=/^(#|rgb\\(\\d|rgba\\(\\d|hsl\\(\\d|hsla\\(\\d)/]", message: "Use CSS variables (var(--foreground), var(--muted-foreground), etc.) instead of hardcoded colors in inline styles." },
        { selector: "Property[key.name=/background/i] Literal[value=/^(#|rgb\\(\\d|rgba\\(\\d|hsl\\(\\d|hsla\\(\\d)/]", message: "Use CSS variables (var(--surface), var(--card), etc.) instead of hardcoded colors in inline styles." },
        { selector: "Property[key.name=/border/i] Literal[value=/^(#|rgb\\(\\d|rgba\\(\\d|hsl\\(\\d|hsla\\(\\d)/]", message: "Use CSS variables (var(--border), rgb(var(--border)), etc.) instead of hardcoded colors in inline styles." },
      ],
    },
  },
  /* ── Architecture protection: pages must not contain styling logic ──
     Pages compose components. Only components may use semantic tokens.
     Layout utilities (flex, grid, gap, p-, m-, text-xl, etc.) are allowed.
  */
  {
    name: "xfitx/page-styling-guard",
    files: ["src/app/**/page.tsx", "src/app/**/layout.tsx"],
    rules: {
      "no-restricted-syntax": [
        "error",
        /* Tailwind hardcoded colors */
        { selector: "JSXAttribute[name.name='className'] Literal[value=/\\b(bg-black|bg-white|text-black|text-white|bg-zinc-|text-zinc-|bg-gray-|text-gray-|bg-slate-|text-slate-|bg-neutral-|text-neutral-|bg-stone-|text-stone-|border-zinc-|border-gray-|border-slate-|border-neutral-|border-stone-)\\b/]", message: "Use semantic tokens (bg-background, text-foreground, border-border, etc.) instead of hardcoded Tailwind colors." },
        /* Pages cannot use semantic color tokens — only components can */
        { selector: "JSXAttribute[name.name='className'] Literal[value=/\\b(bg-background|bg-foreground|bg-card|bg-muted|bg-secondary|bg-primary|bg-accent|bg-destructive|bg-success|bg-danger|text-foreground|text-muted-foreground|text-secondary-foreground|text-primary-foreground|text-accent-foreground|text-destructive-foreground|text-success|text-danger|border-border|border-input|border-ring)\\b/]", message: "Pages must not use semantic color tokens. Extract this into a component in src/components/ui/ or src/components/." },
        /* Inline style hardcoded hex/rgba on color-related props */
        { selector: "Property[key.name=/color/i] Literal[value=/^(#|rgb\\(\\d|rgba\\(\\d|hsl\\(\\d|hsla\\(\\d)/]", message: "Use CSS variables (var(--foreground), var(--muted-foreground), etc.) instead of hardcoded colors in inline styles." },
        { selector: "Property[key.name=/background/i] Literal[value=/^(#|rgb\\(\\d|rgba\\(\\d|hsl\\(\\d|hsla\\(\\d)/]", message: "Use CSS variables (var(--surface), var(--card), etc.) instead of hardcoded colors in inline styles." },
        { selector: "Property[key.name=/border/i] Literal[value=/^(#|rgb\\(\\d|rgba\\(\\d|hsl\\(\\d|hsla\\(\\d)/]", message: "Use CSS variables (var(--border), rgb(var(--border)), etc.) instead of hardcoded colors in inline styles." },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
  ]),
]);

export default eslintConfig;
