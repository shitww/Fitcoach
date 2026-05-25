'use client'

import { useEffect, useState } from 'react'
import { WifiOff } from 'lucide-react'

export default function OfflineToast() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    function handleOffline() { setOffline(true) }
    function handleOnline() { setOffline(false) }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        left: '12px',
        right: '12px',
        zIndex: 400,
        borderRadius: '12px',
        background: 'var(--surface-2, #111)',
        border: '1px solid rgb(var(--border))',
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        boxShadow: '0 8px 32px color-mix(in srgb, rgb(var(--foreground)) 60%, transparent)',
        animation: 'slide-down 0.28s ease-out',
      }}
    >
      <WifiOff size={15} style={{ color: 'rgb(var(--destructive))', flexShrink: 0 }} aria-hidden="true" />
      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-med)' }}>
        当前处于离线状态
      </span>
    </div>
  )
}
