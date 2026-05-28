'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Dumbbell, Utensils, Clock, User } from 'lucide-react'

export type BottomTab = 'home' | 'training' | 'diet' | 'history' | 'profile'

interface BottomTabBarProps {
  /** Explicitly set the active tab. If omitted, inferred from the current pathname. */
  active?: BottomTab
  /** Additional inline styles on the <nav> element (e.g. conditional z-index). */
  style?: React.CSSProperties
}

const TABS: Array<{
  id: BottomTab
  label: string
  icon: typeof Home
  /** Route the tab navigates to */
  path: string
  /** Pathname prefix for auto-detection when active is not explicitly set */
  matchPrefix: string
}> = [
  { id: 'home',    label: '首页', icon: Home,     path: '/',              matchPrefix: '/' },
  { id: 'training',label: '训练', icon: Dumbbell,  path: '/training-log',  matchPrefix: '/training-log' },
  { id: 'diet',    label: '饮食', icon: Utensils,  path: '/diet-analysis', matchPrefix: '/diet-analysis' },
  { id: 'history', label: '历史', icon: Clock,     path: '/history',       matchPrefix: '/history' },
  { id: 'profile', label: '我的', icon: User,      path: '/profile',       matchPrefix: '/profile' },
]

/**
 * Shared 5-tab bottom navigation bar.
 * Pages only need: <BottomTabBar active="training" />
 */
export default function BottomTabBar({ active, style }: BottomTabBarProps) {
  const pathname = usePathname()

  const resolved: BottomTab | undefined =
    active ??
    TABS
      .slice()
      // Sort by matchPrefix length descending so longer (more specific) prefixes win
      .sort((a, b) => b.matchPrefix.length - a.matchPrefix.length)
      .find((t) => pathname.startsWith(t.matchPrefix))?.id

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
      <div className="max-w-5xl mx-auto px-2">
        <div className="flex items-end justify-around py-2">
          {TABS.map((tab) => {
            const isActive = resolved === tab.id
            const color = isActive ? 'var(--accent)' : 'var(--text-low)'
            const weight = isActive ? 600 : 400

            return (
              <Link
                key={tab.id}
                href={tab.path}
                prefetch
                className="flex flex-col items-center gap-0.5 py-1 px-2 transition-colors"
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                style={{ textDecoration: 'none' }}
              >
                <tab.icon
                  className="w-6 h-6"
                  style={{ color }}
                />
                <span
                  className="text-xs"
                  style={{ color, fontWeight: weight }}
                >
                  {tab.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
