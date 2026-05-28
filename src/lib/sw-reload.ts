// ─── Service Worker Reload Control ─────────────────────────────────────────
// Prevents auto-reload while user is in the middle of a workout.
// Any page/component can suppress reload by calling suppress(true).

let _suppressCount = 0
let _pendingReload = false

/** Increment suppression counter. Call when entering critical UX (training). */
export function suppressSWReload(): void {
  _suppressCount++
}

/** Decrement suppression counter. Call when leaving critical UX. */
export function allowSWReload(): void {
  _suppressCount = Math.max(0, _suppressCount - 1)
  if (_suppressCount === 0 && _pendingReload) {
    _pendingReload = false
    window.location.reload()
  }
}

/** Query whether reload is currently safe. */
export function isSWReloadAllowed(): boolean {
  return _suppressCount === 0
}

/** Mark reload as pending (called by PWARegister when new SW takes over). */
export function markReloadPending(): void {
  _pendingReload = true
}
