'use client'

import { useState, useRef, useCallback } from 'react'
import { RefreshCw } from 'lucide-react'

interface Props {
  children: React.ReactNode
  onRefresh: () => void | Promise<void>
  /** Minimum pull distance in px to trigger refresh (default 80) */
  threshold?: number
  /** Maximum overscroll distance in px (default 120) */
  maxPull?: number
}

/**
 * Mobile pull-to-refresh wrapper.
 * Works on touch devices only; on desktop it's a no-op pass-through.
 */
export default function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  maxPull = 120,
}: Props) {
  const [pulling, setPulling] = useState(false)
  const [offset, setOffset] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const startY = useRef(0)
  const isActive = useRef(false)

  const canPull = useCallback(() => {
    if (typeof window === 'undefined') return false
    // Only pull when at the very top of the scroll container
    return window.scrollY <= 0
  }, [])

  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!canPull()) return
      startY.current = e.touches[0].clientY
      isActive.current = true
      setPulling(true)
    },
    [canPull],
  )

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isActive.current) return
      const dy = e.touches[0].clientY - startY.current
      if (dy < 0) {
        setOffset(0)
        return
      }
      // Resistance curve: harder to pull further
      const resisted = Math.min(dy * 0.5, maxPull)
      setOffset(resisted)
    },
    [maxPull],
  )

  const onTouchEnd = useCallback(async () => {
    if (!isActive.current) return
    isActive.current = false
    setPulling(false)

    if (offset >= threshold && !refreshing) {
      setRefreshing(true)
      setOffset(threshold) // Snap to threshold position
      try {
        await onRefresh()
      } catch {
        // ignore
      } finally {
        setRefreshing(false)
        setOffset(0)
      }
    } else {
      setOffset(0)
    }
  }, [offset, threshold, refreshing, onRefresh])

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ touchAction: 'pan-y' }}
    >
      {/* Pull indicator */}
      <div
        style={{
          height: offset,
          overflow: 'hidden',
          transition: pulling ? 'none' : 'height 0.25s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          paddingBottom: 12,
        }}
      >
        <RefreshCw
          size={20}
          className={refreshing ? 'animate-spin' : ''}
          style={{
            color: offset >= threshold ? 'var(--accent, #CCFF00)' : 'var(--text-faint, #666)',
            transform: `rotate(${Math.min((offset / threshold) * 360, 360)}deg)`,
            transition: 'color 0.2s',
            flexShrink: 0,
          }}
        />
      </div>

      {children}
    </div>
  )
}
