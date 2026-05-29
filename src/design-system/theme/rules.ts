// ═══════════════════════════════════════════════════════════════
// Theme Domain Rules
//
// These are the compile-time and runtime contracts that govern
// what is ALLOWED in the Theme Domain.
// ═══════════════════════════════════════════════════════════════

/**
 * Allowed Tailwind prefixes for theme domain usage.
 * Any className using these prefixes with a semantic token is valid.
 */
export const ALLOWED_TAILWIND_PREFIXES = [
  "bg-",
  "text-",
  "border-",
  "ring-",
  "fill-",
  "stroke-",
  "shadow-",
  "outline-",
  "decoration-",
  "caret-",
  "divide-",
] as const;

/**
 * Forbidden patterns in the Theme Domain.
 * These indicate business/physiological state colors leaking into UI.
 */
export const FORBIDDEN_THEME_PATTERNS = [
  /fatigue/i,
  /intensity/i,
  /heart.?rate/i,
  /recovery/i,
  /rest.?color/i,
  /workout.?state/i,
  /energy/i,
  /zone/i,
  /calorie/i,
  /macro/i,
] as const;

/**
 * Hex colors that are known to be visualization colors.
 * If found in theme/primitives files, they are violations.
 */
export const KNOWN_VISUALIZATION_HEXES = [
  "#B8FF2B", // active / lime
  "#00E5CC", // rest / teal
  "#FF9940", // fatigue / orange
  "#FFD700", // complete / gold
  "#8B5CF6", // transition / purple
  "#7CDD00", // active gradient end
] as const;
