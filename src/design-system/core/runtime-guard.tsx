"use client";

import { type ReactNode, createContext, useContext } from "react";

// ═══════════════════════════════════════════════════════════════
// Runtime Design System Protection Layer
// DEV-MODE ONLY — throws console warnings for cross-domain leaks
//
// Usage:
//   Wrap your app root in <DesignSystemGuard>...
//   </DesignSystemGuard>
//
// This does NOT affect production builds.
// ═══════════════════════════════════════════════════════════════

interface GuardContextValue {
  /** Reports a visualization color leak into a non-viz component */
  reportVizLeak: (source: string, color: string) => void;
  /** Reports a theme token used for domain state meaning */
  reportSemanticMisuse: (source: string, token: string, context: string) => void;
  /** Reports a domain bypassing the unified VisualIntensity scale */
  reportScaleBypass: (source: string, domain: string, value: unknown) => void;
  /** Reports direct palette usage instead of going through renderer */
  reportDirectPalette: (source: string, palette: string) => void;
}

const GuardContext = createContext<GuardContextValue | null>(null);

function createGuard(): GuardContextValue {
  const reported = new Set<string>();

  function once(key: string, fn: () => void) {
    if (reported.has(key)) return;
    reported.add(key);
    fn();
  }

  return {
    reportVizLeak(source, color) {
      if (process.env.NODE_ENV !== "development") return;
      once(`viz-leak:${source}:${color}`, () => {
        // eslint-disable-next-line no-console
        console.warn(
          `[DesignSystem] Visualization Leak Detected\n` +
            `  Source: "${source}"\n` +
            `  Color:  "${color}"\n` +
            `  Rule:   Visualization colors must only be used in ` +
            `src/design-system/visualization/ or chart components.\n` +
            `  Fix:    Replace with a semantic token (bg-background, text-foreground, etc.) ` +
            `or pass the color via props from a visualization consumer.`,
        );
      });
    },

    reportSemanticMisuse(source, token, context) {
      if (process.env.NODE_ENV !== "development") return;
      once(`semantic-misuse:${source}:${token}`, () => {
        // eslint-disable-next-line no-console
        console.warn(
          `[DesignSystem] Semantic Token Misuse Detected\n` +
            `  Source:  "${source}"\n` +
            `  Token:   "${token}"\n` +
            `  Context: "${context}"\n` +
            `  Rule:    Theme tokens carry NO business meaning.\n` +
            `  Fix:     If you need domain-specific colors, define them in ` +
            `src/design-system/visualization/ and consume via props.`,
        );
      });
    },

    reportScaleBypass(source, domain, value) {
      if (process.env.NODE_ENV !== "development") return;
      once(`scale-bypass:${source}:${domain}`, () => {
        // eslint-disable-next-line no-console
        console.warn(
          `[DesignSystem] Visualization Fragmentation Detected\n` +
            `  Source: "${source}"\n` +
            `  Domain: "${domain}"\n` +
            `  Value:  "${String(value)}"\n` +
            `  Rule:   All domains MUST map to VisualIntensity 0–4.\n` +
            `  Fix:     Use mapToVisualState() or a domain mapper before rendering.`,
        );
      });
    },

    reportDirectPalette(source, palette) {
      if (process.env.NODE_ENV !== "development") return;
      once(`direct-palette:${source}:${palette}`, () => {
        // eslint-disable-next-line no-console
        console.warn(
          `[DesignSystem] Direct Palette Usage Detected\n` +
            `  Source:  "${source}"\n` +
            `  Palette: "${palette}"\n` +
            `  Rule:    All visualization colors must flow through core/renderer.ts.\n` +
            `  Fix:     Use renderVisualState(intensity) instead of domain palettes directly.`,
        );
      });
    },
  };
}

interface DesignSystemGuardProps {
  children: ReactNode;
}

export function DesignSystemGuard({ children }: DesignSystemGuardProps) {
  const guard = createGuard();
  return (
    <GuardContext.Provider value={guard}>{children}</GuardContext.Provider>
  );
}

export function useDesignSystemGuard(): GuardContextValue {
  const ctx = useContext(GuardContext);
  if (!ctx) {
    // Return no-op if guard is not mounted (e.g., in tests)
    return {
      reportVizLeak: () => {},
      reportSemanticMisuse: () => {},
      reportScaleBypass: () => {},
      reportDirectPalette: () => {},
    };
  }
  return ctx;
}
