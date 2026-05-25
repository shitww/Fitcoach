"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from "react";
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { themes, type ThemeName } from "@/lib/themes";

export type { ThemeName } from "@/lib/themes";

/* ── Legacy color object (backward compat during migration) ── */
export interface LegacyColors {
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

function toLegacy(name: ThemeName): LegacyColors {
  const t = themes[name];
  return {
    bg: `rgb(${t.background})`,
    surface: t.surface,
    surface2: t["surface-2"],
    surface3: t["surface-3"],
    border: `rgb(${t.border})`,
    borderAccent: t.accentGlow,
    text: `rgb(${t.foreground})`,
    textSec: t.textSecondary,
    textMuted: t.textMuted,
    textFaint: t.textFaint,
    accent: `rgb(${t.primary})`,
    accentDim: t.accentDim,
    accentGlow: t.accentGlow,
    accentText: t.accentText,
    navBg: t.navBg,
    topBg: t.topBg,
  };
}

interface ThemeCtx {
  theme: ThemeName;
  t: LegacyColors;
  toggle: () => void;
  setTheme: (name: ThemeName) => void;
  resolved: "dark" | "light";
}

const Ctx = createContext<ThemeCtx>({
  theme: "dark",
  t: toLegacy("dark"),
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

  const t = useMemo(() => toLegacy(activeTheme), [activeTheme]);

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
