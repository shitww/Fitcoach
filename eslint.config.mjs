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
  /* ── Cross-domain import guard ──
     Theme and primitives MUST NOT import visualization.
     Visualization may import theme and primitives.
  */
  {
    name: "xfitx/cross-domain-theme",
    files: ["src/design-system/theme/**/*.{ts,tsx}", "src/components/ui/primitives/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["**/design-system/visualization/**", "**/visualization/fatigue", "**/visualization/intensity", "**/visualization/heart-rate", "**/visualization/recovery"], message: "Theme/Primitives must NOT import visualization. Visualization colors carry business meaning and must not leak into the UI foundation layer." },
          ],
        },
      ],
    },
  },
  {
    name: "xfitx/cross-domain-primitives",
    files: ["src/design-system/primitives/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["**/design-system/visualization/**", "**/visualization/fatigue", "**/visualization/intensity", "**/visualization/heart-rate", "**/visualization/recovery"], message: "Primitives must NOT import visualization. Use semantic tokens from theme/ instead." },
          ],
        },
      ],
    },
  },
  /* ── Raw color guard in theme/primitives files ──
     No hex, rgba, hsl in theme or primitive source files.
     Only CSS custom properties and semantic references allowed.
  */
  {
    name: "xfitx/raw-color-guard",
    files: ["src/design-system/theme/**/*.{ts,tsx}", "src/design-system/primitives/**/*.{ts,tsx}", "src/components/ui/primitives/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        { selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]", message: "Hex colors are forbidden in theme/primitives. Use semantic tokens or CSS custom properties." },
        { selector: "Literal[value=/^rgba?\\(/]", message: "Raw rgba/rgb is forbidden in theme/primitives. Use CSS custom properties (var(--...)) or semantic Tailwind classes." },
        { selector: "Literal[value=/^hsla?\\(/]", message: "Raw hsl is forbidden in theme/primitives. Use CSS custom properties." },
      ],
    },
  },
  /* ── Visualization API Lock ──
     Components may ONLY import from @/design-system/viz (useDesignViz).
     Direct imports from visualization internals are forbidden.
  */
  {
    name: "xfitx/viz-api-lock",
    files: ["src/components/**/*.{ts,tsx}", "src/app/**/*.{ts,tsx}", "src/features/**/*.{ts,tsx}"],
    ignores: ["src/design-system/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["**/design-system/visualization/**", "**/visualization/core/**", "**/visualization/domains/**", "**/visualization/registry", "**/visualization/contract", "**/visualization/fatigue", "**/visualization/intensity", "**/visualization/heart-rate", "**/visualization/recovery"], message: "Visualization internals are private. Use @/design-system/viz (useDesignViz) instead." },
            { group: ["**/design-system/primitives/**"], message: "Primitive internals are private. Use @/design-system/ui instead." },
            { group: ["**/design-system/core/**"], message: "Core internals are private. Use @/design-system/theme, @/design-system/ui, or @/design-system/viz instead." },
          ],
        },
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
