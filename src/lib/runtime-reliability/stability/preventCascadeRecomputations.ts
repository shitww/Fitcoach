// ── Prevent Cascade Recomputations ───────────────────────────────────────────
// Tracks update dependencies and blocks unnecessary downstream recomputes.
// ─────────────────────────────────────────────────────────────────────────────

import type { RuntimeUpdateEntry } from '@/types/runtime-reliability';

/** Dependency graph for runtime state nodes. */
const DEPENDENCY_MAP: Record<string, readonly string[]> = {
  session:       ['momentum', 'prediction', 'rest_timer'],
  prediction:    ['queue'],
  momentum:      [],
  rest_timer:    [],
  queue:         [],
  input:         ['prediction'],
};

export interface RecomputationPlan {
  dirtyNodes: Set<string>;
  orderedUpdates: string[];
  skippedCount: number;
}

/** Build a minimal recomputation plan from a set of dirty nodes.
 *  Propagates dependencies but de-duplicates to avoid cascade.
 */
export function buildRecomputationPlan(
  changedNodes: string[],
  allNodes: string[]
): RecomputationPlan {
  const dirtyNodes = new Set<string>();

  // Mark direct changes
  for (const node of changedNodes) {
    dirtyNodes.add(node);
  }

  // Propagate to dependents
  let changed = true;
  while (changed) {
    changed = false;
    for (const [node, deps] of Object.entries(DEPENDENCY_MAP)) {
      if (!dirtyNodes.has(node)) {
        const depsDirty = deps.some((d) => dirtyNodes.has(d));
        if (depsDirty) {
          dirtyNodes.add(node);
          changed = true;
        }
      }
    }
  }

  const skippedCount = allNodes.filter((n) => !dirtyNodes.has(n)).length;
  const orderedUpdates = topologicalOrder(Array.from(dirtyNodes));

  return { dirtyNodes, orderedUpdates, skippedCount };
}

/** Check if a specific update should be skipped because its dependencies haven't changed. */
export function shouldSkipUpdate(
  update: RuntimeUpdateEntry,
  lastUpdateTimestamps: Record<string, string>
): boolean {
  if (update.dependencies.length === 0) return false;

  const depTimestamps = update.dependencies.map((dep) => lastUpdateTimestamps[dep] ?? '');
  const allDepsUpToDate = depTimestamps.every((ts) => ts >= update.enqueuedAt);

  return allDepsUpToDate;
}

/** Record that a node was just recomputed. */
export function markNodeRecomputed(
  nodeType: string,
  timestamps: Record<string, string>
): Record<string, string> {
  return { ...timestamps, [nodeType]: new Date().toISOString() };
}

function topologicalOrder(nodes: string[]): string[] {
  const result: string[] = [];
  const visited = new Set<string>();
  const deps = DEPENDENCY_MAP;

  function visit(node: string) {
    if (visited.has(node)) return;
    visited.add(node);
    const nodeDeps = deps[node] ?? [];
    for (const dep of nodeDeps) {
      if (nodes.includes(dep)) visit(dep);
    }
    result.push(node);
  }

  for (const node of nodes) {
    visit(node);
  }
  return result;
}
