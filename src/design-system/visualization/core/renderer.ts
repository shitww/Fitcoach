// ═══════════════════════════════════════════════════════════════
// Single Global Color Renderer
//
// THIS IS THE ONLY PLACE WHERE VISUALIZATION COLORS EXIST.
//
// All domains map to VisualIntensity (0–4).
// This renderer maps VisualIntensity to theme-compatible values.
//
// RULES:
// - NO domain-specific color logic
// - ONLY VisualIntensity → visual property mapping
// - All outputs are CSS custom properties or Tailwind semantic classes
// - No hardcoded hex/rgba outside the RVL_LEGACY section
// ═══════════════════════════════════════════════════════════════

import type { VisualIntensity } from "./types";

// ── Surface colors (backgrounds, fills) ──────────────────────
// These map to CSS custom properties that adapt to dark/light.
// They are semantic, not domain-specific.
const SURFACE_MAP: Record<VisualIntensity, string> = {
  0: "rgb(var(--muted) / 0.30)",         // resting — barely visible
  1: "rgb(var(--accent) / 0.12)",          // low — subtle accent
  2: "rgb(var(--accent) / 0.25)",          // moderate — visible accent
  3: "rgb(var(--warning) / 0.35)",         // high — warning tint
  4: "rgb(var(--destructive) / 0.45)",     // critical — destructive tint
};

// ── Foreground colors (text, icons, strokes) ────────────────
const FOREGROUND_MAP: Record<VisualIntensity, string> = {
  0: "rgb(var(--muted-foreground))",
  1: "rgb(var(--accent))",
  2: "rgb(var(--accent))",
  3: "rgb(var(--warning))",
  4: "rgb(var(--destructive))",
};

// ── Border colors ────────────────────────────────────────────
const BORDER_MAP: Record<VisualIntensity, string> = {
  0: "rgb(var(--border) / 0.30)",
  1: "rgb(var(--accent) / 0.30)",
  2: "rgb(var(--accent) / 0.50)",
  3: "rgb(var(--warning) / 0.60)",
  4: "rgb(var(--destructive) / 0.70)",
};

// ── Glow / shadow colors (for runtime UI effects) ────────────
const GLOW_MAP: Record<VisualIntensity, string> = {
  0: "0 0 20px rgb(var(--muted) / 0.05)",
  1: "0 0 20px rgb(var(--accent) / 0.08)",
  2: "0 0 20px rgb(var(--accent) / 0.15)",
  3: "0 0 30px rgb(var(--warning) / 0.18)",
  4: "0 0 40px rgb(var(--destructive) / 0.22)",
};

// ── Tailwind semantic classes ────────────────────────────────
const TAILWIND_BG: Record<VisualIntensity, string> = {
  0: "bg-muted",
  1: "bg-accent/20",
  2: "bg-accent/30",
  3: "bg-warning/40",
  4: "bg-destructive/50",
};

const TAILWIND_TEXT: Record<VisualIntensity, string> = {
  0: "text-muted-foreground",
  1: "text-accent",
  2: "text-accent",
  3: "text-warning",
  4: "text-destructive",
};

const TAILWIND_BORDER: Record<VisualIntensity, string> = {
  0: "border-border/40",
  1: "border-accent/30",
  2: "border-accent/50",
  3: "border-warning/60",
  4: "border-destructive/70",
};

// ═══════════════════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════════════════

export interface RenderedVisualState {
  intensity: VisualIntensity;
  surface: string;
  foreground: string;
  border: string;
  glow: string;
  tailwind: {
    bg: string;
    text: string;
    border: string;
  };
}

/**
 * The ONLY function that converts VisualIntensity to visual properties.
 *
 * All UI components MUST call this — never use domain palettes directly.
 */
export function renderVisualState(
  intensity: VisualIntensity,
): RenderedVisualState {
  return {
    intensity,
    surface: SURFACE_MAP[intensity],
    foreground: FOREGROUND_MAP[intensity],
    border: BORDER_MAP[intensity],
    glow: GLOW_MAP[intensity],
    tailwind: {
      bg: TAILWIND_BG[intensity],
      text: TAILWIND_TEXT[intensity],
      border: TAILWIND_BORDER[intensity],
    },
  };
}

/**
 * Convenience: map a raw value directly to rendered state.
 * Domains call this via the registry pipeline.
 */
export function renderFromValue(
  value: number,
  domainMap: (v: number) => VisualIntensity,
): RenderedVisualState {
  const intensity = domainMap(value);
  return renderVisualState(intensity);
}

/**
 * Runtime safety check — ensures a color string is from the renderer.
 * This is a no-op in production; dev-only guard.
 */
export function assertRendererOrigin(
  color: string,
  source: string,
): void {
  if (process.env.NODE_ENV === "development") {
    const allValues = Object.values(SURFACE_MAP)
      .concat(Object.values(FOREGROUND_MAP))
      .concat(Object.values(BORDER_MAP));
    const isKnown = allValues.some((v) => color.includes(v));
    if (!isKnown) {
      // eslint-disable-next-line no-console
      console.warn(
        `[RendererGuard] Color "${color}" from "${source}" may bypass the unified renderer. ` +
          `All visualization colors must come from renderVisualState().`,
      );
    }
  }
}
