// ═══════════════════════════════════════════════════════════════
// Design System Boundary Enforcement
// KERNEL-LEVEL RULES — Non-negotiable
// ═══════════════════════════════════════════════════════════════

/**
 * Domain names for boundary enforcement.
 */
export type DesignDomain = "theme" | "primitives" | "visualization";

/**
 * Allowed import graph:
 *   theme → (nothing, root)
 *   primitives → theme
 *   visualization → theme, primitives
 *
 * Forbidden:
 *   theme → visualization
 *   primitives → visualization
 */
export const ALLOWED_IMPORTS: Record<DesignDomain, DesignDomain[]> = {
  theme: [],
  primitives: ["theme"],
  visualization: ["theme", "primitives"],
};

/**
 * File path patterns for each domain.
 */
export const DOMAIN_PATHS: Record<DesignDomain, string[]> = {
  theme: ["src/design-system/theme/"],
  primitives: ["src/design-system/primitives/", "src/components/ui/primitives/"],
  visualization: ["src/design-system/visualization/"],
};

/**
 * Checks if an import is allowed between domains.
 */
export function isImportAllowed(
  fromDomain: DesignDomain,
  toDomain: DesignDomain,
): boolean {
  if (fromDomain === toDomain) return true;
  return ALLOWED_IMPORTS[fromDomain].includes(toDomain);
}

/**
 * Determines the domain of a file path.
 */
export function getDomainForPath(filePath: string): DesignDomain | null {
  if (filePath.includes("/design-system/theme/")) return "theme";
  if (
    filePath.includes("/design-system/primitives/") ||
    filePath.includes("/components/ui/primitives/")
  )
    return "primitives";
  if (filePath.includes("/design-system/visualization/")) return "visualization";
  return null;
}
