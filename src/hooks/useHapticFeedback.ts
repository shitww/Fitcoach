'use client';

/**
 * Lightweight haptic feedback hook.
 * Uses the Vibration API when available (Android).
 * Safari iOS does not support navigator.vibrate, so this is a no-op there.
 */

export type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const PATTERNS: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 25,
  heavy: 50,
  success: [10, 50, 10],
  warning: [20, 30, 20],
  error: [30, 40, 30, 40, 30],
};

export function useHapticFeedback() {
  const trigger = (type: HapticType = 'light') => {
    if (typeof navigator === 'undefined') return;
    if (!navigator.vibrate) return;
    try {
      navigator.vibrate(PATTERNS[type]);
    } catch {
      // ignore
    }
  };

  return { trigger };
}
