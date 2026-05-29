// ── Maintain Session Presence ─────────────────────────────────────────────────
// Training session is independent of page lifecycle.
// Lock screen, background, navigation — session continues.
// ─────────────────────────────────────────────────────────────────────────────

export type PresenceStatus =
  | 'active'          // foreground, session live
  | 'background'      // app backgrounded, session continues
  | 'lock_screen'     // lock screen (mobile PWA)
  | 'suspended'       // PWA suspended, will recover on resume
  | 'disconnected'    // unexpected loss — recovery needed

export interface SessionPresence {
  sessionId: string
  status: PresenceStatus
  lastActiveAt: number
  backgroundedAt: number | null
  foregroundedAt: number | null
  totalBackgroundMs: number
}

/** Module-level presence state (client-only). */
let _presence: SessionPresence | null = null

const PRESENCE_KEY = 'fitcoach:v1:session-presence'

/** Start tracking session presence. Called on SESSION_STARTED. */
export function beginSessionPresence(sessionId: string): SessionPresence {
  _presence = {
    sessionId,
    status: 'active',
    lastActiveAt: Date.now(),
    backgroundedAt: null,
    foregroundedAt: null,
    totalBackgroundMs: 0,
  }
  _persistPresence()
  return _presence
}

/** Called when app goes to background (visibilitychange, blur). */
export function onSessionBackground(): void {
  if (!_presence) return
  _presence = {
    ..._presence,
    status: 'background',
    backgroundedAt: Date.now(),
  }
  _persistPresence()
}

/** Called when app returns to foreground (visibilitychange, focus). */
export function onSessionForeground(): void {
  if (!_presence) return
  const now = Date.now()
  const bgDuration = _presence.backgroundedAt
    ? now - _presence.backgroundedAt
    : 0

  _presence = {
    ..._presence,
    status: 'active',
    foregroundedAt: now,
    lastActiveAt: now,
    backgroundedAt: null,
    totalBackgroundMs: _presence.totalBackgroundMs + bgDuration,
  }
  _persistPresence()
}

/** Get current session presence. */
export function getSessionPresence(): SessionPresence | null {
  return _presence
}

/** Clear session presence (on session completion). */
export function clearSessionPresence(): void {
  _presence = null
  if (typeof window !== 'undefined') {
    try { localStorage.removeItem(PRESENCE_KEY) } catch {}
  }
}

/** Load persisted presence for crash recovery. */
export function loadPresence(): SessionPresence | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PRESENCE_KEY)
    if (!raw) return null
    _presence = JSON.parse(raw) as SessionPresence
    return _presence
  } catch { return null }
}

/** Register visibility/focus listeners. Returns cleanup function. */
export function registerPresenceListeners(): () => void {
  if (typeof document === 'undefined') return () => {}

  const onVisibility = () => {
    if (document.visibilityState === 'hidden') {
      onSessionBackground()
    } else {
      onSessionForeground()
    }
  }

  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('focus', onSessionForeground)
  window.addEventListener('blur', onSessionBackground)

  return () => {
    document.removeEventListener('visibilitychange', onVisibility)
    window.removeEventListener('focus', onSessionForeground)
    window.removeEventListener('blur', onSessionBackground)
  }
}

function _persistPresence(): void {
  if (typeof window === 'undefined' || !_presence) return
  try {
    localStorage.setItem(PRESENCE_KEY, JSON.stringify(_presence))
  } catch {}
}
