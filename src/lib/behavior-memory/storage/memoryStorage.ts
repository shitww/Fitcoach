// ── Behavior Memory Storage ──────────────────────────────────────────────────
// localStorage persistence with versioning and migration safety.
// ─────────────────────────────────────────────────────────────────────────────

import type { BehaviorMemorySnapshot } from '@/types/workout-memory';

const STORAGE_KEY = 'fitcoach:behavior_memory:v1';
const STORAGE_VERSION = 1;

/** Load behavior memory from localStorage. */
export function loadBehaviorMemory(): BehaviorMemorySnapshot | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as BehaviorMemorySnapshot;
    if (!parsed || parsed.version !== STORAGE_VERSION) {
      // In the future: migrate old versions here
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/** Save behavior memory to localStorage. */
export function saveBehaviorMemory(snapshot: BehaviorMemorySnapshot): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // localStorage full — in production, this should trigger
    // a flush to IndexedDB or server sync
  }
}

/** Clear stored behavior memory. */
export function clearBehaviorMemory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/** Check if behavior memory exists in storage. */
export function hasBehaviorMemory(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
}
