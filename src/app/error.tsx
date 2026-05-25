'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Error Boundary]', error)
  }, [error])

  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000000',
        color: '#ffffff',
        fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
        textAlign: 'center',
        padding: 'max(env(safe-area-inset-top, 0px), 24px) 24px max(env(safe-area-inset-bottom, 0px), 24px)',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <div
        style={{
          fontSize: 40,
          fontWeight: 900,
          color: '#CCFF00',
          letterSpacing: '-2px',
          marginBottom: 24,
          textShadow: '0 0 20px rgba(204,255,0,0.4)',
        }}
        aria-hidden="true"
      >
        X
      </div>

      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          marginBottom: 8,
          letterSpacing: '-0.3px',
        }}
      >
        页面发生错误
      </h2>

      <p
        style={{
          fontSize: 13,
          color: 'rgba(255,255,255,0.45)',
          marginBottom: 28,
          maxWidth: 260,
          lineHeight: 1.6,
        }}
      >
        遇到了意外问题。请尝试重试，如果问题持续存在请刷新页面。
      </p>

      <button
        onClick={reset}
        style={{
          background: '#CCFF00',
          color: '#000',
          padding: '12px 28px',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 14,
          border: 'none',
          cursor: 'pointer',
          WebkitTapHighlightColor: 'transparent',
          touchAction: 'manipulation',
        }}
      >
        重试
      </button>
    </div>
  )
}
