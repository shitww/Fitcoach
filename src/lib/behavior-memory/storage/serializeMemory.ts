// ── Memory Serialization ──────────────────────────────────────────────────
// Converts BehaviorMemorySnapshot to a compact transferable format.
// ─────────────────────────────────────────────────────────────────────────────

import type { BehaviorMemorySnapshot } from '@/types/workout-memory';

/** Serialize to a compact JSON string.
 *  Removes redundant whitespace for storage efficiency.
 */
export function serializeMemory(snapshot: BehaviorMemorySnapshot): string {
  return JSON.stringify(snapshot);
}

/** Serialize to a base64-encoded string for URL sharing or embedding. */
export function serializeMemoryToBase64(snapshot: BehaviorMemorySnapshot): string {
  const json = JSON.stringify(snapshot);
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(json).toString('base64');
  }
  if (typeof btoa !== 'undefined') {
    return btoa(json);
  }
  return json; // fallback
}

/** Get approximate size in bytes. */
export function estimateMemorySize(snapshot: BehaviorMemorySnapshot): number {
  return new Blob([JSON.stringify(snapshot)]).size;
}
