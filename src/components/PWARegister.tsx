'use client'

import { useEffect } from 'react'

function signalUpdate() {
  window.dispatchEvent(new CustomEvent('xfitx:sw-update'))
}

export default function PWARegister() {
  useEffect(() => {
    // Only register in production to avoid interfering with Turbopack HMR in dev
    if (process.env.NODE_ENV !== 'production') return
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .then((reg) => {
        // Case 1: a SW is already waiting when this page loads (e.g. user navigated away
        // and came back while a new SW was installing in a background tab).
        if (reg.waiting && navigator.serviceWorker.controller) {
          signalUpdate()
        }

        // Case 2: a new SW starts installing after this page load.
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
  }, [])

  return null
}
