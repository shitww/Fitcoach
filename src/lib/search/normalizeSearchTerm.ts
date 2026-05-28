// ── Search Normalization ──────────────────────────────────────────────────────
// Lightweight search preprocessing for exercise and food lookup.
// No external libraries; designed for future fuzzy-search extensibility.
// ─────────────────────────────────────────────────────────────────────────────

/** Steps applied in order:
 *  1. Trim whitespace
 *  2. Lowercase
 *  3. Collapse multiple spaces
 *  4. Remove diacritics (future extensibility hook)
 */
export function normalizeSearchTerm(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

/** Alias-aware normalization: splits comma-separated terms and normalizes each.
 *  Useful for bulk alias imports.
 */
export function normalizeAliasList(aliases: readonly string[]): string[] {
  return aliases.map(normalizeSearchTerm);
}

/** Extract search tokens from a query string.
 *  Useful for multi-token matching.
 */
export function tokenizeSearchTerm(input: string): string[] {
  const normalized = normalizeSearchTerm(input);
  if (normalized === '') return [];
  return normalized.split(' ');
}
