// ── Build Warmup Flow (orchestrator) ────────────────────────────────────────
// Assembles warmup flows for an entire session queue.
// ─────────────────────────────────────────────────────────────────────────────

import type { WarmupFlow } from '@/types/predictive-flow';
import { buildWarmupFlow, type ExerciseWarmupProfile } from './recommendWarmups';

/** Build warmup flows for each exercise in a session.
 *  Skips redundant warmups for similar movement patterns.
 */
export function buildSessionWarmupFlows(
  profiles: readonly ExerciseWarmupProfile[]
): WarmupFlow[] {
  const flows: WarmupFlow[] = [];
  const coveredPatterns = new Set<string>();

  for (const profile of profiles) {
    const flow = buildWarmupFlow(profile);

    // Deduplicate: if we already have a similar warmup, skip it
    const keyPatterns = profile.movementPatterns.slice(0, 2).sort().join(',');
    if (coveredPatterns.has(keyPatterns) && flow.priority !== 'required') {
      continue;
    }

    for (const pattern of profile.movementPatterns) {
      coveredPatterns.add(pattern);
    }

    flows.push(flow);
  }

  return flows;
}
