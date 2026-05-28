'use client'

import { WifiOff, CloudSync, AlertCircle } from 'lucide-react'
import { useOfflineStatus } from '@/hooks/useOfflineStatus'

/**
 * Floating offline/sync status indicator.
 * Renders at the top of the screen when:
 * - User is offline
 * - Sync is in progress
 * - Operations failed and need retry
 */
export default function OfflineStatusBar() {
  const { isOnline, syncInProgress, pendingCount, lastSyncAt, syncNow } = useOfflineStatus()

  const showOffline = !isOnline
  const showSyncing = isOnline && syncInProgress && pendingCount > 0
  const showFailed = isOnline && !syncInProgress && pendingCount > 0 && lastSyncAt && Date.now() - lastSyncAt > 60_000

  if (!showOffline && !showSyncing && !showFailed) return null

  const meta = showOffline
    ? {
        icon: <WifiOff size={14} className="shrink-0" />,
        text: '离线模式 · 数据将在联网后自动同步',
        bg: 'rgba(245,158,11,0.12)',
        border: 'rgba(245,158,11,0.30)',
        color: '#F59E0B',
      }
    : showSyncing
      ? {
          icon: <CloudSync size={14} className="shrink-0 animate-spin" style={{ animationDuration: '2s' }} />,
          text: `正在同步 ${pendingCount} 条数据…`,
          bg: 'rgba(34,197,94,0.10)',
          border: 'rgba(34,197,94,0.25)',
          color: '#22c55e',
        }
      : {
          icon: <AlertCircle size={14} className="shrink-0" />,
          text: `${pendingCount} 条数据同步失败，点击重试`,
          bg: 'rgba(239,68,68,0.10)',
          border: 'rgba(239,68,68,0.25)',
          color: '#ef4444',
        }

  return (
    <button
      onClick={showFailed ? syncNow : undefined}
      role={showFailed ? 'button' : 'status'}
      aria-label={meta.text}
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 0px) + 8px)',
        left: '12px',
        right: '12px',
        zIndex: 500,
        borderRadius: '12px',
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        padding: '9px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        cursor: showFailed ? 'pointer' : 'default',
      }}
    >
      <span style={{ color: meta.color }}>{meta.icon}</span>
      <span
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: meta.color,
          flex: 1,
          textAlign: 'left',
        }}
      >
        {meta.text}
      </span>
    </button>
  )
}
