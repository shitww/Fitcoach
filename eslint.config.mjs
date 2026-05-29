import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals.js";
import nextTs from "eslint-config-next/typescript.js";

const eslintConfig = defineConfig([
  nextVitals,
  nextTs,
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
  /* ── Page hardcoded color guard ──
     Pages may use semantic tokens for layout shells.
     They must NOT use hardcoded colors.
  */
  {
    name: "xfitx/page-color-guard",
    files: ["src/app/**/page.tsx", "src/app/**/layout.tsx"],
    rules: {
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
