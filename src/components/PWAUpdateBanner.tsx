'use client'

import { useEffect, useState } from 'react'
import { Sparkles, X } from 'lucide-react'

/**
 * Lightweight update toast.
 * SW now auto-activates (skipWaiting). This banner just informs the user.
 * If training is in progress, it shows "将在训练结束后自动更新".
 */
export default function PWAUpdateBanner() {
  const [visible, setVisible] = useState(false)
  const [deferred, setDeferred] = useState(false)

  useEffect(() => {
    function onUpdateReady() {
      setDeferred(false)
      setVisible(true)
    }
    function onUpdatePending(e: Event) {
      const detail = (e as CustomEvent).detail
      if (detail?.reason === 'training-in-progress') {
        setDeferred(true)
        setVisible(true)
      }
    }
    window.addEventListener('xfitx:sw-update', onUpdateReady)
    window.addEventListener('xfitx:sw-update-pending', onUpdatePending)

    // Auto-dismiss after 4 seconds
    if (visible) {
      const t = setTimeout(() => setVisible(false), 4000)
      return () => clearTimeout(t)
    }

    return () => {
      window.removeEventListener('xfitx:sw-update', onUpdateReady)
      window.removeEventListener('xfitx:sw-update-pending', onUpdatePending)
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      role="status"
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
        padding: '10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'slide-up 0.32s cubic-bezier(0.34,1.26,0.64,1)',
      }}
    >
      <Sparkles
        size={16}
        style={{ color: '#CCFF00', flexShrink: 0 }}
        aria-hidden="true"
      />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--foreground, #fff)',
          }}
        >
          {deferred ? '新版本已就绪' : '已自动更新到最新版'}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-secondary, rgba(255,255,255,0.45))',
          }}
        >
          {deferred
            ? '训练结束后将自动应用，无需操作'
            : '下次打开时即可体验新功能'}
        </div>
      </div>

      <button
        onClick={() => setVisible(false)}
        aria-label="关闭"
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
