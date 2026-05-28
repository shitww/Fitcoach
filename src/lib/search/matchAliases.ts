// ── Alias Matching ────────────────────────────────────────────────────────────
// Search matching against names and aliases for exercises and foods.
// Current implementation: exact and prefix matching.
// Future: swap in Levenshtein or fuse.js without changing the interface.
// ─────────────────────────────────────────────────────────────────────────────

import { normalizeSearchTerm, tokenizeSearchTerm } from './normalizeSearchTerm';

export interface MatchableItem {
  id: string;
  name: string;
  aliases: readonly string[];
}

export interface MatchResult {
  item: MatchableItem;
  score: number; // lower = better
  matchedAlias: string | null;
}

/** Match a query against a collection of items with aliases.
 *  Returns ranked results. Exact name match = score 0, prefix = score 1,
 *  alias exact = score 2, alias prefix = score 3.
 */
export function matchAliases<T extends MatchableItem>(
  query: string,
  items: readonly T[]
): MatchResult[] {
  const normalizedQuery = normalizeSearchTerm(query);
  if (normalizedQuery === '') return [];

  const results: MatchResult[] = [];

  for (const item of items) {
    const normalizedName = normalizeSearchTerm(item.name);

    // Direct name match (highest priority)
    if (normalizedName === normalizedQuery) {
      results.push({ item, score: 0, matchedAlias: null });
      continue;
    }

    // Name prefix
    if (normalizedName.startsWith(normalizedQuery)) {
      results.push({ item, score: 1, matchedAlias: null });
      continue;
    }

    // Alias exact match
    for (const alias of item.aliases) {
      const normalizedAlias = normalizeSearchTerm(alias);
      if (normalizedAlias === normalizedQuery) {
        results.push({ item, score: 2, matchedAlias: alias });
        break;
      }
      if (normalizedAlias.startsWith(normalizedQuery)) {
        results.push({ item, score: 3, matchedAlias: alias });
        break;
      }
    }
  }

  // Sort by score ascending
  results.sort((a, b) => a.score - b.score);
  return results;
}

/** Token-level matching: every token must match either name or an alias.
 *  Useful for queries like "dumbbell chest press".
 */
export function matchByTokens<T extends MatchableItem>(
  query: string,
  items: readonly T[]
): MatchResult[] {
  const tokens = tokenizeSearchTerm(query);
  if (tokens.length === 0) return [];

  const results: MatchResult[] = [];

  for (const item of items) {
    const searchable = [
      normalizeSearchTerm(item.name),
      ...item.aliases.map(normalizeSearchTerm),
    ];

    const allTokensMatch = tokens.every((token) =>
      searchable.some((text) => text.includes(token))
    );

    if (allTokensMatch) {
      const score = tokens.length; // more tokens = more specific = slightly lower score
      results.push({ item, score, matchedAlias: null });
    }
  }

  results.sort((a, b) => a.score - b.score);
  return results;
}

/** Convenience: get the single best match, or null. */
export function findBestMatch<T extends MatchableItem>(
  query: string,
  items: readonly T[]
): MatchResult | null {
  const results = matchAliases(query, items);
  return results.length > 0 ? results[0] : null;
}
