// ═══════════════════════════════════════════════════════════════
// FitCoach Theme Token Contract
// THEME DOMAIN — UI Foundation Layer
//
// RULES:
// - No business meaning allowed
// - No physiological state colors
// - Only structural UI colors (surface, text, border, accent)
// - All tokens are semantic and adapt to dark/light
//
// ENFORCED BY:
// - scripts/enforce-design-boundaries.ts
// - ESLint no-restricted-syntax rules
// ═══════════════════════════════════════════════════════════════

/**
 * Semantic token names for the FitCoach theme system.
 * These map to CSS custom properties in globals.css.
 *
 * Usage in Tailwind classes:
 *   bg-background    → var(--background)
 *   text-foreground  → var(--foreground)
 *   border-border    → var(--border)
 */
export const SEMANTIC_TOKENS = [
  // Surfaces
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",

  // Brand / Accent
  "primary",
  "primary-foreground",
  "accent",
  "accent-foreground",

  // Feedback
  "destructive",
  "destructive-foreground",
  "success",
  "success-foreground",
  "warning",
  "warning-foreground",
  "danger",
  "danger-foreground",
  "recovery",
  "recovery-foreground",
  "inactive",
  "inactive-foreground",

  // Border & Forms
  "border",
  "input",
  "ring",

  // Overlay
  "overlay",
  "overlay-foreground",

  // Shadow (always dark)
  "shadow",
] as const;

export type SemanticToken = (typeof SEMANTIC_TOKENS)[number];

/**
 * Tailwind class prefix for each token category.
 */
export const TOKEN_CATEGORIES = {
  surface: [
    "bg-background",
    "bg-card",
    "bg-popover",
    "bg-secondary",
    "bg-muted",
    "bg-primary",
    "bg-accent",
    "bg-destructive",
    "bg-success",
    "bg-warning",
    "bg-danger",
    "bg-recovery",
    "bg-inactive",
    "bg-overlay",
  ],
  text: [
    "text-foreground",
    "text-card-foreground",
    "text-popover-foreground",
    "text-secondary-foreground",
    "text-muted-foreground",
    "text-primary-foreground",
    "text-accent-foreground",
    "text-destructive-foreground",
    "text-success-foreground",
    "text-warning-foreground",
    "text-danger-foreground",
    "text-recovery-foreground",
    "text-inactive-foreground",
    "text-overlay-foreground",
  ],
  border: [
    "border-border",
    "border-input",
    "border-ring",
  ],
  ring: [
    "ring-ring",
  ],
} as const;

/**
 * Validates that a string is a known semantic token.
 */
export function isSemanticToken(value: string): value is SemanticToken {
  return SEMANTIC_TOKENS.includes(value as SemanticToken);
}
