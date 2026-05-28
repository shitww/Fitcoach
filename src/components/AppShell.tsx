'use client'

import { usePathname } from 'next/navigation'
import BottomTabBar from './BottomTabBar'

const HIDE_NAV_PATHS = [
  '/auth/',
  '/workout/',
  '/exercise/',
  '/summary/',
  '/muscle-history/',
]

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showNav = !HIDE_NAV_PATHS.some((p) => pathname.startsWith(p))

  return (
    <>
      {children}
      {showNav && <BottomTabBar />}
    </>
  )
}
