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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 safe-bottom"
      style={{
        background: 'color-mix(in srgb, rgb(var(--background)) 85%, transparent)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        ...style,
      }}
    >
      <div className="max-w-2xl mx-auto px-1">
        <div className="flex items-center justify-around py-1.5">
          {TABS.map((tab) => {
            const isActive = resolved === tab.id
            return (
              <Link
                key={tab.id}
                href={tab.path}
                prefetch
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-colors min-w-[3.5rem] ${
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
              >
                <tab.icon
                  className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`}
                  strokeWidth={isActive ? 2.5 : 1.75}
                />
                <span className={`text-[10px] leading-tight font-${isActive ? 'bold' : 'medium'}`}>
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
