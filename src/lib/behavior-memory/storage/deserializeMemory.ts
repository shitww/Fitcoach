// ── Memory Deserialization ──────────────────────────────────────────────────
// Reconstructs BehaviorMemorySnapshot from stored/transferred format.
// ─────────────────────────────────────────────────────────────────────────────

import type { BehaviorMemorySnapshot } from '@/types/workout-memory';

/** Deserialize from JSON string. */
export function deserializeMemory(raw: string): BehaviorMemorySnapshot | null {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidSnapshot(parsed)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Deserialize from base64-encoded string. */
export function deserializeMemoryFromBase64(raw: string): BehaviorMemorySnapshot | null {
  let json: string;
  try {
    if (typeof Buffer !== 'undefined') {
      json = Buffer.from(raw, 'base64').toString('utf-8');
    } else if (typeof atob !== 'undefined') {
      json = atob(raw);
    } else {
      return null;
    }
  } catch {
    return null;
  }
  return deserializeMemory(json);
}

/** Lightweight type guard for snapshot validation. */
function isValidSnapshot(obj: unknown): obj is BehaviorMemorySnapshot {
  if (!obj || typeof obj !== 'object') return false;
  const s = obj as Record<string, unknown>;
  return (
    typeof s.version === 'number' &&
    typeof s.userId === 'string' &&
    typeof s.updatedAt === 'string' &&
    s.workoutMemory !== undefined &&
    s.foodMemory !== undefined
  );
}
