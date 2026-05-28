'use client'

import { useEffect } from 'react'
import { isSWReloadAllowed, markReloadPending } from '@/lib/sw-reload'

function signalUpdate() {
  window.dispatchEvent(new CustomEvent('xfitx:sw-update'))
}

export default function PWARegister() {
  useEffect(() => {
    // Dev hygiene:
    // If a Service Worker was previously registered on the same origin (e.g. you ran a
    // production build on http://localhost:3000), it will keep controlling the page in dev
    // and can serve stale cached /_next/static assets, leading to runtime errors like:
    // "Cannot read properties of undefined (reading 'call')".
    //
    // So in non-production we aggressively unregister and clear our caches.
    if (process.env.NODE_ENV !== 'production') {
      if (!('serviceWorker' in navigator)) return
      void (async () => {
        try {
          const regs = await navigator.serviceWorker.getRegistrations()
          await Promise.all(regs.map((r) => r.unregister()))
        } catch {}

        try {
          const keys = await caches.keys()
          await Promise.all(
            keys
              // our SW uses "xfitx-sw-*" cache names
              .filter((k) => k.startsWith('xfitx-sw-'))
              .map((k) => caches.delete(k)),
          )
        } catch {}
      })()
      return
    }

    if (!('serviceWorker' in navigator)) return

    // ── Periodic update check ──────────────────────────────────────────────
    // Poll for new SW versions every 60s. This ensures updates are discovered
    // even if the user keeps the PWA open for hours.
    let pollTimer: ReturnType<typeof setInterval>

    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((reg) => {
        // Initial check
        void reg.update()

        // Start periodic polling
        pollTimer = setInterval(() => {
          void reg.update()
        }, 15_000)

        // Case 1: a SW is already waiting when page loads
        if (reg.waiting && navigator.serviceWorker.controller) {
          signalUpdate()
        }

        // Case 2: new SW starts installing after page load
        reg.addEventListener('updatefound', () => {
          const newSW = reg.installing
          if (!newSW) return
          newSW.addEventListener('statechange', () => {
            if (newSW.state === 'installed' && navigator.serviceWorker.controller) {
              signalUpdate()
            }
          })
        })
      })
      .catch((err) => console.error('[SW] Registration failed:', err))

    // ── controllerchange: new SW has taken control ────────────────────────
    const onControllerChange = () => {
      // SW has auto-activated (skipWaiting). Decide whether to reload.
      if (isSWReloadAllowed()) {
        window.location.reload()
      } else {
        // User is training — don't interrupt. Mark pending; workout page
        // will call allowSWReload() when session ends and trigger reload.
        markReloadPending()
        // Also fire a soft event so UI can show "update ready after training"
        window.dispatchEvent(
          new CustomEvent('xfitx:sw-update-pending', {
            detail: { reason: 'training-in-progress' },
          }),
        )
      }
    }

    navigator.serviceWorker.addEventListener('controllerchange', onControllerChange)

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange)
      if (pollTimer) clearInterval(pollTimer)
    }
  }, [])

  return null
}
