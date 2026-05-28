'use client'

import { useEffect } from 'react'
import { startSyncEngine } from '@/lib/offline/sync-engine'

/**
 * Mount-only side-effect component.
 * - Starts the singleton sync engine on app boot.
 * - Requests persistent storage to prevent iOS IndexedDB eviction (iOS 14.5+).
 * Does not render anything.
 */
export default function SyncEngineInit() {
  useEffect(() => {
    startSyncEngine()

    // Request persistent storage.
    // iOS 14.5+ may evict IndexedDB after 7 days of inactivity unless
    // the site has been granted "persistent" storage via this API.
    // Firefox and Chrome also support it; silent no-op on older browsers.
    if ('storage' in navigator && 'persist' in navigator.storage) {
      navigator.storage.persist().then((granted) => {
        if (granted) {
          console.log('[FitCoach] Storage persistence granted — IndexedDB is safe from eviction')
        } else {
          console.warn('[FitCoach] Storage persistence denied — data may be evicted after inactivity on iOS')
        }
      }).catch(() => {
        // Silently ignore — storage persistence is best-effort
      })
    }
  }, [])

  return null
}
