'use client'

import { useRouter, usePathname } from 'next/navigation'
import { TrendingUp, Home, Utensils } from 'lucide-react'

export type BottomTab = 'home' | 'training' | 'diet'

interface BottomTabBarProps {
  /** Explicitly set the active tab. If omitted, inferred from the current pathname. */
  active?: BottomTab
  /** Additional inline styles on the <nav> element (e.g. conditional z-index). */
  style?: React.CSSProperties
}

/**
 * Shared bottom navigation bar used by: homepage, training-log, diet-analysis, calendar.
 * All tab routing and active-state styling is handled here.
 * Pages only need: <BottomTabBar active="training" />
 */
export default function BottomTabBar({ active, style }: BottomTabBarProps) {
  const router = useRouter()
  const pathname = usePathname()

  const resolved: BottomTab | undefined =
    active ??
    (pathname === '/'
      ? 'home'
      : pathname.startsWith('/training-log')
        ? 'training'
        : pathname.startsWith('/diet-analysis')
          ? 'diet'
          : undefined)

  const tabColor = (tab: BottomTab) =>
    resolved === tab ? 'var(--accent)' : 'var(--text-low)'

  const tabWeight = (tab: BottomTab) =>
    resolved === tab ? 600 : 400

  function go(path: string, tab: BottomTab) {
    if (resolved !== tab) router.push(path)
  }

  return (
    <nav
      aria-label="底部导航"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--border)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        ...style,
      }}
    >
      <div className="max-w-5xl mx-auto px-6">
        <div className="flex items-end justify-between py-2">

          {/* 训练分析 */}
          <button
            onClick={() => go('/training-log', 'training')}
            className="flex flex-col items-center gap-0.5 py-2 px-6 transition-colors"
            aria-label="训练分析"
            aria-current={resolved === 'training' ? 'page' : undefined}
          >
            <TrendingUp className="w-6 h-6" style={{ color: tabColor('training') }} />
            <span
              className="text-xs"
              style={{ color: tabColor('training'), fontWeight: tabWeight('training') }}
            >
              训练分析
            </span>
          </button>

          {/* 首页 FAB */}
          <button
            onClick={() => go('/', 'home')}
            className="flex flex-col items-center gap-0.5"
            style={{ marginTop: '-24px' }}
            aria-label="首页"
            aria-current={resolved === 'home' ? 'page' : undefined}
          >
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={
                resolved === 'home'
                  ? {
                      background: 'var(--accent)',
                      boxShadow:
                        '0 0 28px var(--accent-glow), 0 8px 32px rgba(0,0,0,0.5)',
                    }
                  : {
                      background: 'var(--surface-2)',
                      border: '2px solid var(--border)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    }
              }
            >
              <Home
                className="w-6 h-6"
                style={{
                  color: resolved === 'home' ? 'rgb(var(--primary-foreground))' : 'var(--text-med)',
                }}
              />
            </div>
            <span
              className="text-xs mt-1"
              style={{ color: tabColor('home'), fontWeight: tabWeight('home') }}
            >
              首页
            </span>
          </button>

          {/* 饮食分析 */}
          <button
            onClick={() => go('/diet-analysis', 'diet')}
            className="flex flex-col items-center gap-0.5 py-2 px-6 transition-colors"
            aria-label="饮食分析"
            aria-current={resolved === 'diet' ? 'page' : undefined}
          >
            <Utensils className="w-6 h-6" style={{ color: tabColor('diet') }} />
            <span
              className="text-xs"
              style={{ color: tabColor('diet'), fontWeight: tabWeight('diet') }}
            >
              饮食分析
            </span>
          </button>

        </div>
      </div>
    </nav>
  )
}
