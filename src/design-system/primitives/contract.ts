// ═══════════════════════════════════════════════════════════════
// Primitive Domain Contract
// UI PRIMITIVE LAYER — Structure Only
//
// RULES:
// - No color logic
// - No business meaning
// - No physiological state references
// - Only consumes theme tokens
// - Can import from theme/
// - MUST NOT import from visualization/
//
// ENFORCED BY:
// - scripts/enforce-design-boundaries.ts
// - ESLint no-restricted-imports
// ═══════════════════════════════════════════════════════════════

import type { SemanticToken } from "../theme/tokens";

/**
 * Primitive variants must map to semantic token names.
 * No hardcoded colors. No domain state references.
 */
export type PrimitiveVariant =
  | "default"
  | "primary"
  | "secondary"
  | "muted"
  | "accent"
  | "destructive"
  | "success"
  | "warning"
  | "danger"
  | "ghost"
  | "outline"
  | "card"
  | "elevated"
  | "glass";

/**
 * All primitives expose these props.
 * className is the only escape hatch — but ESLint guards it.
 */
export interface PrimitiveBaseProps {
  className?: string;
}

/**
 * Token-to-Tailwind mapping for primitive implementations.
 * These are the ONLY valid color class patterns for primitives.
 */
export const PRIMITIVE_COLOR_MAP: Record<string, string> = {
  // Surfaces
  "bg-default": "bg-background",
  "bg-card": "bg-card",
  "bg-elevated": "bg-card",
  "bg-muted": "bg-muted",
  "bg-secondary": "bg-secondary",
  "bg-glass": "bg-card/80 backdrop-blur-xl",

  // Text
  "text-default": "text-foreground",
  "text-primary": "text-primary-foreground",
  "text-secondary": "text-secondary-foreground",
  "text-muted": "text-muted-foreground",
  "text-accent": "text-accent-foreground",
  "text-destructive": "text-destructive-foreground",
  "text-success": "text-success-foreground",
  "text-warning": "text-warning-foreground",
  "text-danger": "text-danger-foreground",

  // Border
  "border-default": "border-border",
  "border-muted": "border-border",
} as const;
