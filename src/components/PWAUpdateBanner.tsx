'use client'

import { useEffect, useState } from 'react'
import { RefreshCw, X } from 'lucide-react'

export default function PWAUpdateBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onUpdateReady() {
      setVisible(true)
    }
    window.addEventListener('xfitx:sw-update', onUpdateReady)
    return () => window.removeEventListener('xfitx:sw-update', onUpdateReady)
  }, [])

  async function handleRefresh() {
    try {
      const reg = await navigator.serviceWorker.getRegistration('/')
      if (reg?.waiting) {
        // Tell the waiting SW to skip its waiting phase and become active
        reg.waiting.postMessage({ type: 'SKIP_WAITING' })
      }
      // Reload as soon as the new SW takes control; fallback after 600ms
      navigator.serviceWorker.addEventListener(
        'controllerchange',
        () => window.location.reload(),
        { once: true },
      )
      setTimeout(() => window.location.reload(), 600)
    } catch {
      window.location.reload()
    }
  }

  if (!visible) return null

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        left: '12px',
        right: '12px',
        bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
        zIndex: 300,
        borderRadius: '16px',
        background: 'var(--surface-2, #111111)',
        border: '1px solid rgba(204,255,0,0.25)',
        boxShadow:
          '0 0 32px rgba(204,255,0,0.10), 0 16px 48px rgba(0,0,0,0.6)',
        padding: '12px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'slide-up 0.32s cubic-bezier(0.34,1.26,0.64,1)',
      }}
    >
      <RefreshCw
        size={18}
        style={{ color: '#CCFF00', flexShrink: 0 }}
        aria-hidden="true"
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--foreground, #fff)',
            marginBottom: 2,
          }}
        >
          发现新版本
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-secondary, rgba(255,255,255,0.45))',
          }}
        >
          刷新后生效，不影响当前操作
        </div>
      </div>

      <button
        onClick={handleRefresh}
        style={{
          flexShrink: 0,
          padding: '7px 14px',
          borderRadius: 10,
          background: '#CCFF00',
          color: '#000',
          fontSize: 12,
          fontWeight: 700,
          border: 'none',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
        }}
      >
        刷新
      </button>

      <button
        onClick={() => setVisible(false)}
        aria-label="暂时关闭更新提示"
        style={{
          flexShrink: 0,
          padding: 6,
          borderRadius: 8,
          border: 'none',
          cursor: 'pointer',
          background: 'transparent',
          color: 'rgba(255,255,255,0.35)',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
          lineHeight: 0,
        }}
      >
        <X size={15} />
      </button>
    </div>
  )
}
