// ─── PWA Platform Detection Utilities ─────────────────────────────────────
// Shared detection functions used by PWAInstallPrompt, profile page, etc.

/** Whether the app is already running in standalone/installed mode. */
export function isRunningStandalone(): boolean {
  if (typeof window === 'undefined') return false
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari reports navigator.standalone when installed
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

/** Detect iOS (iPhone / iPad). */
export function detectIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS 13+ spoofs as "Macintosh" but has touch support
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

/** Detect Android. */
export function detectAndroid(): boolean {
  if (typeof navigator === 'undefined') return false
  return /android/i.test(navigator.userAgent)
}

/** Show iOS install instructions by triggering the PWAInstallPrompt banner. */
export function showInstallPrompt(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent('xfitx:trigger-install'))
}
