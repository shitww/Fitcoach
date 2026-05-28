/**
 * FitCoach VNext — Semantic Theme Tokens
 *
 * Rules:
 * - All values MUST be space-separated RGB tuples (e.g. "255 255 255")
 *   so Tailwind's <alpha-value> modifier works.
 * - NEVER export hex/rgba/hsl directly to components.
 * - Components consume tokens via Tailwind classes (bg-background, text-foreground, …)
 *   or CSS variables only.
 * - Legacy hex/rgba tokens have been REMOVED. Use color-mix() in CSS instead.
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

  /* Feedback & states */
  destructive: string;
  "destructive-foreground": string;
  success: string;
  "success-foreground": string;
  warning: string;
  "warning-foreground": string;
  danger: string;
  "danger-foreground": string;
  recovery: string;
  "recovery-foreground": string;
  inactive: string;
  "inactive-foreground": string;

  /* Borders & forms */
  border: string;
  input: string;
  ring: string;
}

/* ── Dark (default) ─────────────────────────────────────────── */
const darkTokens: ThemeTokenSet = {
  background: "0 0 0",
  foreground: "245 245 245",
  card: "10 10 10",
  "card-foreground": "235 235 235",
  popover: "10 10 10",
  "popover-foreground": "235 235 235",
  primary: "204 255 0",
  "primary-foreground": "0 0 0",
  secondary: "22 22 22",
  "secondary-foreground": "220 220 220",
  muted: "32 32 32",
  "muted-foreground": "160 160 160",
  accent: "204 255 0",
  "accent-foreground": "0 0 0",
  destructive: "255 59 92",
  "destructive-foreground": "255 255 255",
  success: "52 211 153",
  "success-foreground": "0 0 0",
  warning: "251 191 36",
  "warning-foreground": "0 0 0",
  danger: "255 59 92",
  "danger-foreground": "255 255 255",
  recovery: "52 211 153",
  "recovery-foreground": "0 0 0",
  inactive: "120 120 120",
  "inactive-foreground": "0 0 0",
  border: "50 50 50",
  input: "50 50 50",
  ring: "204 255 0",
};

/* ── Light ────────────────────────────────────────────────── */
const lightTokens: ThemeTokenSet = {
  background: "250 250 250",
  foreground: "18 18 22",
  card: "255 255 255",
  "card-foreground": "18 18 22",
  popover: "255 255 255",
  "popover-foreground": "18 18 22",
  primary: "0 0 0",
  "primary-foreground": "255 255 255",
  secondary: "240 240 240",
  "secondary-foreground": "24 24 27",
  muted: "228 228 231",
  "muted-foreground": "100 100 108",
  accent: "0 0 0",
  "accent-foreground": "255 255 255",
  destructive: "220 38 38",
  "destructive-foreground": "255 255 255",
  success: "21 128 61",
  "success-foreground": "255 255 255",
  warning: "180 83 9",
  "warning-foreground": "255 255 255",
  danger: "220 38 38",
  "danger-foreground": "255 255 255",
  recovery: "21 128 61",
  "recovery-foreground": "255 255 255",
  inactive: "150 150 150",
  "inactive-foreground": "255 255 255",
  border: "212 212 216",
  input: "212 212 216",
  ring: "0 0 0",
};

/* ── AMOLED ──────────────────────────────────────── */
const amoledTokens: ThemeTokenSet = {
  ...darkTokens,
  background: "0 0 0",
  card: "0 0 0",
  secondary: "12 12 12",
  muted: "20 20 20",
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
