"use client";

import { useContext, createContext, type ReactNode } from "react";

// ═══════════════════════════════════════════════════════════════
// Architecture Freeze Guard
// DEV-MODE ONLY
//
// Detects architecture expansion attempts at runtime.
// No production impact.
// ═══════════════════════════════════════════════════════════════

interface FreezeGuardValue {
  reportExpansion: (source: string, action: string) => void;
}

const FreezeGuardContext = createContext<FreezeGuardValue | null>(null);

function createFreezeGuard(): FreezeGuardValue {
  const reported = new Set<string>();

  function once(key: string, fn: () => void) {
    if (reported.has(key)) return;
    reported.add(key);
    fn();
  }

  return {
    reportExpansion(source, action) {
      if (process.env.NODE_ENV !== "development") return;
      once(`expansion:${source}:${action}`, () => {
        // eslint-disable-next-line no-console
        console.warn(
          `[DesignSystem] Architecture Expansion Detected\n` +
            `  Source: "${source}"\n` +
            `  Action: "${action}"\n` +
            `  Rule:   New architecture layers are forbidden.\n` +
            `  Fix:     Use existing theme/ui/viz APIs.\n` +
            `  Docs:    DESIGN_SYSTEM_FREEZE.md`,
        );
      });
    },
  };
}

export function FreezeGuard({ children }: { children: ReactNode }) {
  const guard = createFreezeGuard();
  return (
    <FreezeGuardContext.Provider value={guard}>
      {children}
    </FreezeGuardContext.Provider>
  );
}

export function useFreezeGuard(): FreezeGuardValue {
  const ctx = useContext(FreezeGuardContext);
  if (!ctx) {
    return { reportExpansion: () => {} };
  }
  return ctx;
}
