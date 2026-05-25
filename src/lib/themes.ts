/**
 * Centralized theme definitions for XFITX.
 *
 * This file is the single source of truth for all theme tokens.
 * New themes (AMOLED, seasonal, brand) can be added here without
 * touching any component code.
 *
 * Rules:
 * - All color values MUST be space-separated RGB tuples (e.g. "255 255 255")
 *   so Tailwind's <alpha-value> modifier works.
 * - NEVER export hex/rgba/hsl directly to components.
 * - Components consume tokens via Tailwind classes (bg-background, text-foreground, …)
 *   or CSS variables (var(--accent)).
 */

export interface ThemeTokenSet {
  /* Page chrome */
  background: string;
  foreground: string;

  /* Surfaces */
  card: string;
  "card-foreground": string;
  popover: string;
  "popover-foreground": string;
  secondary: string;
  "secondary-foreground": string;
  muted: string;
  "muted-foreground": string;

  /* Brand / accent */
  primary: string;
  "primary-foreground": string;
  accent: string;
  "accent-foreground": string;

  /* Feedback */
  destructive: string;
  "destructive-foreground": string;
  success: string;
  danger: string;

  /* Borders & forms */
  border: string;
  input: string;
  ring: string;

  /* Legacy extras (computed from semantic tokens) */
  surface: string;
  "surface-2": string;
  "surface-3": string;
  accentDim: string;
  accentGlow: string;
  accentText: string;
  textSecondary: string;
  textMuted: string;
  textHigh: string;
  textMed: string;
  textLow: string;
  textFaint: string;
  navBg: string;
  topBg: string;
}

/* ── Dark (default) ─────────────────────────────────────────── */
const darkTokens: ThemeTokenSet = {
  background: "0 0 0",
  foreground: "255 255 255",
  card: "10 10 10",
  "card-foreground": "255 255 255",
  popover: "10 10 10",
  "popover-foreground": "255 255 255",
  primary: "204 255 0",
  "primary-foreground": "0 0 0",
  secondary: "17 17 17",
  "secondary-foreground": "255 255 255",
  muted: "26 26 26",
  "muted-foreground": "160 160 160",
  accent: "204 255 0",
  "accent-foreground": "0 0 0",
  destructive: "239 68 68",
  "destructive-foreground": "255 255 255",
  border: "30 30 30",
  input: "30 30 30",
  ring: "204 255 0",
  success: "74 222 128",
  danger: "239 68 68",

  /* Legacy */
  surface: "#0a0a0a",
  "surface-2": "#111111",
  "surface-3": "#1a1a1a",
  accentDim: "rgba(204,255,0,0.12)",
  accentGlow: "rgba(204,255,0,0.25)",
  accentText: "#000000",
  textSecondary: "rgba(255,255,255,0.65)",
  textMuted: "rgba(255,255,255,0.50)",
  textHigh: "rgba(255,255,255,0.92)",
  textMed: "rgba(255,255,255,0.70)",
  textLow: "rgba(255,255,255,0.55)",
  textFaint: "rgba(255,255,255,0.40)",
  navBg: "rgba(0,0,0,0.92)",
  topBg: "rgba(0,0,0,0.95)",
};

/* ── Light ────────────────────────────────────────────────── */
const lightTokens: ThemeTokenSet = {
  background: "244 244 245",
  foreground: "24 24 27",
  card: "255 255 255",
  "card-foreground": "24 24 27",
  popover: "255 255 255",
  "popover-foreground": "24 24 27",
  primary: "37 99 235",
  "primary-foreground": "255 255 255",
  secondary: "240 240 240",
  "secondary-foreground": "24 24 27",
  muted: "228 228 231",
  "muted-foreground": "113 113 122",
  accent: "37 99 235",
  "accent-foreground": "255 255 255",
  destructive: "220 38 38",
  "destructive-foreground": "255 255 255",
  border: "212 212 216",
  input: "212 212 216",
  ring: "37 99 235",
  success: "34 197 94",
  danger: "220 38 38",

  /* Legacy */
  surface: "#ffffff",
  "surface-2": "#f0f0f0",
  "surface-3": "#e4e4e7",
  accentDim: "rgba(37,99,235,0.12)",
  accentGlow: "rgba(37,99,235,0.22)",
  accentText: "#ffffff",
  textSecondary: "rgba(24,24,27,0.65)",
  textMuted: "rgba(24,24,27,0.50)",
  textHigh: "rgba(24,24,27,0.92)",
  textMed: "rgba(24,24,27,0.70)",
  textLow: "rgba(24,24,27,0.55)",
  textFaint: "rgba(24,24,27,0.40)",
  navBg: "rgba(244,244,245,0.94)",
  topBg: "rgba(244,244,245,0.97)",
};

/* ── AMOLED (future) ──────────────────────────────────────── */
const amoledTokens: ThemeTokenSet = {
  ...darkTokens,
  background: "0 0 0",
  card: "0 0 0",
  /* Surfaces must be more distinct on pure black (#000) */
  secondary: "12 12 12",
  muted: "20 20 20",
  /* Borders and muted text need extra brightness on AMOLED */
  "muted-foreground": "190 190 190",
  border: "65 65 65",
  input: "65 65 65",
};

/* ── Orange brand (future) ─────────────────────────────────── */
const orangeTokens: ThemeTokenSet = {
  ...darkTokens,
  primary: "255 165 0",
  accent: "255 165 0",
  ring: "255 165 0",
};

/* ── Registry ─────────────────────────────────────────────── */
export const themes = {
  dark: darkTokens,
  light: lightTokens,
  amoled: amoledTokens,
  orange: orangeTokens,
} as const;

export type ThemeName = keyof typeof themes;
