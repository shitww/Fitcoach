'use client'

import dynamic from 'next/dynamic'
import PWARegister from '@/components/PWARegister'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import PWAUpdateBanner from '@/components/PWAUpdateBanner'
import OfflineToast from '@/components/OfflineToast'

// FloatingTimer is client-only: depends on workout timer store (zustand),
// only renders during active sessions, and has no meaningful SSR output.
const FloatingTimer = dynamic(() => import('@/components/FloatingTimer'), {
  ssr: false,
})

export default function ClientProviders() {
  return (
    <>
      <FloatingTimer />
      <PWARegister />
      <PWAInstallPrompt />
      <PWAUpdateBanner />
      <OfflineToast />
    </>
  )
}
