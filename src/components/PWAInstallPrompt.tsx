'use client'

import { useEffect, useState, useRef } from 'react'
import { X, Share } from 'lucide-react'

// ─── Constants ──────────────────────────────────────────────────────────────

const DISMISS_KEY = 'xfitx-pwa-prompt-dismissed'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

// ─── Helpers ────────────────────────────────────────────────────────────────

function wasDismissedRecently(): boolean {
  try {
    const ts = localStorage.getItem(DISMISS_KEY)
    return !!ts && Date.now() - Number(ts) < DISMISS_DURATION_MS
  } catch {
    return false
  }
}

function saveDismissal() {
  try {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
  } catch {}
}

function isRunningStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari reports navigator.standalone when installed
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function detectIOS(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    // iPadOS 13+ spoof as "Macintosh" with touch support
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

// ─── Types ──────────────────────────────────────────────────────────────────

type Platform = 'android' | 'ios' | null

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function PWAInstallPrompt() {
  const [visible, setVisible] = useState(false)
  const [platform, setPlatform] = useState<Platform>(null)
  const deferredPrompt = useRef<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    // Never show if already installed or recently dismissed
    if (isRunningStandalone() || wasDismissedRecently()) return

    if (detectIOS()) {
      // iOS: show instructions after 5s — install must be done manually by user
      const timer = setTimeout(() => {
        setPlatform('ios')
        setVisible(true)
      }, 5000)
      return () => clearTimeout(timer)
    }

    // Android / Desktop Chrome: wait for the browser to fire beforeinstallprompt
    let showTimer: ReturnType<typeof setTimeout>

    function onBeforeInstall(e: Event) {
      e.preventDefault()
      deferredPrompt.current = e as BeforeInstallPromptEvent
      showTimer = setTimeout(() => {
        setPlatform('android')
        setVisible(true)
      }, 4000)
    }

    function onAppInstalled() {
      setVisible(false)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstall)
    window.addEventListener('appinstalled', onAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled', onAppInstalled)
      clearTimeout(showTimer)
    }
  }, [])

  async function handleInstall() {
    if (!deferredPrompt.current) return
    await deferredPrompt.current.prompt()
    const { outcome } = await deferredPrompt.current.userChoice
    deferredPrompt.current = null
    if (outcome === 'accepted') setVisible(false)
  }

  function handleDismiss() {
    saveDismissal()
    setVisible(false)
  }

  if (!visible || !platform) return null

  return (
    <div
      role="dialog"
      aria-label="安装 XFITX 到主屏幕"
      style={{
        position: 'fixed',
        left: '12px',
        right: '12px',
        // Float above the bottom nav (~72px) plus system safe area
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
      {/* Brand mark */}
      <div
        aria-hidden="true"
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          flexShrink: 0,
          background: 'rgba(204,255,0,0.08)',
          border: '1px solid rgba(204,255,0,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 900,
          color: '#CCFF00',
          letterSpacing: '-1px',
          fontFamily: 'var(--font-space-grotesk), ui-sans-serif, sans-serif',
        }}
      >
        X
      </div>

      {/* Copy */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: 'var(--foreground, #fff)',
            marginBottom: 3,
            lineHeight: 1.3,
          }}
        >
          安装 XFITX App
        </div>

        {platform === 'ios' ? (
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-secondary, rgba(255,255,255,0.45))',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              flexWrap: 'wrap',
            }}
          >
            点击底部
            <Share
              size={11}
              style={{ color: '#007AFF', flexShrink: 0 }}
              aria-label="分享按钮"
            />
            &nbsp;→ 添加到主屏幕
          </div>
        ) : (
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-secondary, rgba(255,255,255,0.45))',
            }}
          >
            添加到主屏幕，更快启动、全屏体验
          </div>
        )}
      </div>

      {/* Install CTA — Android only (iOS can't be triggered programmatically) */}
      {platform === 'android' && (
        <button
          onClick={handleInstall}
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
          安装
        </button>
      )}

      {/* Dismiss */}
      <button
        onClick={handleDismiss}
        aria-label="关闭安装提示"
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
