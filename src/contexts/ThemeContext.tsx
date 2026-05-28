"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { themes, type ThemeName } from "@/lib/themes";

export type { ThemeName } from "@/lib/themes";

/* ── Semantic color helpers (VNext) ── */
export interface SemanticColors {
  bg: string;
  surface: string;
  surface2: string;
  surface3: string;
  border: string;
  borderAccent: string;
  text: string;
  textSec: string;
  textMuted: string;
  textFaint: string;
  accent: string;
  accentDim: string;
  accentGlow: string;
  accentText: string;
  navBg: string;
  topBg: string;
}

function toSemantic(name: ThemeName): SemanticColors {
  const t = themes[name];
  const accentRgb = `rgb(${t.primary})`;
  return {
    bg: `rgb(${t.background})`,
    surface: `rgb(${t.card})`,
    surface2: `rgb(${t.secondary})`,
    surface3: `rgb(${t.muted})`,
    border: `rgb(${t.border})`,
    borderAccent: `color-mix(in srgb, ${accentRgb} 25%, transparent)`,
    text: `rgb(${t.foreground})`,
    textSec: `rgb(${t["muted-foreground"]})`,
    textMuted: `rgb(${t["muted-foreground"]})`,
    textFaint: `color-mix(in srgb, rgb(${t.foreground}) 40%, transparent)`,
    accent: accentRgb,
    accentDim: `color-mix(in srgb, ${accentRgb} 12%, transparent)`,
    accentGlow: `color-mix(in srgb, ${accentRgb} 25%, transparent)`,
    accentText: `rgb(${t["primary-foreground"]})`,
    navBg: `color-mix(in srgb, rgb(${t.background}) 92%, transparent)`,
    topBg: `color-mix(in srgb, rgb(${t.background}) 95%, transparent)`,
  };
}

interface ThemeCtx {
  theme: ThemeName;
  t: SemanticColors;
  toggle: () => void;
  setTheme: (name: ThemeName) => void;
  resolved: "dark" | "light";
}

const Ctx = createContext<ThemeCtx>({
  theme: "dark",
  t: toSemantic("dark"),
  toggle: () => {},
  setTheme: () => {},
  resolved: "dark",
});

function ThemeConsumer({ children }: { children: ReactNode }) {
  const { theme, setTheme, resolvedTheme } = useNextTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resolved = (resolvedTheme ?? "dark") as "dark" | "light";
  const activeTheme = (theme ?? "dark") as ThemeName;

  const t = useMemo(() => toSemantic(activeTheme), [activeTheme]);

  const ctx: ThemeCtx = {
    theme: activeTheme,
    t,
    toggle: () => setTheme(resolved === "dark" ? "light" : "dark"),
    setTheme: (name: ThemeName) => setTheme(name),
    resolved,
  };

  /* Prevent flash: render nothing until mounted so hydration matches */
  if (!mounted) {
    return <>{children}</>;
  }

  return <Ctx.Provider value={ctx}>{children}</Ctx.Provider>;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      storageKey="xfitx-theme"
    >
      <ThemeConsumer>{children}</ThemeConsumer>
    </NextThemesProvider>
  );
}

export const useTheme = () => useContext(Ctx);
