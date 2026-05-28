'use client'

import { useEffect, useState, useCallback } from 'react'
import { subscribeSyncState, forceSync, getSyncState } from '@/lib/offline/sync-engine'
import type { NetworkState } from '@/lib/offline/types'

/**
 * Reactive hook for offline/network/sync status.
 * Subscribes to the singleton sync engine and re-renders on every state change.
 */
export function useOfflineStatus() {
  const [state, setState] = useState<NetworkState>(getSyncState)

  useEffect(() => {
    const unsubscribe = subscribeSyncState(setState)
    return unsubscribe
  }, [])

  const syncNow = useCallback(() => {
    void forceSync()
  }, [])

  return {
    ...state,
    syncNow,
    isOffline: !state.isOnline,
    hasPending: state.pendingCount > 0,
  }
}
