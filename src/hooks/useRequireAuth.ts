'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface UseRequireAuthOptions {
  redirectTo?: string
}

interface UseRequireAuthReturn {
  session: ReturnType<typeof useSession>['data']
  status: 'loading' | 'authenticated' | 'unauthenticated'
  isLoading: boolean
  isAuthenticated: boolean
}

/**
 * Redirects unauthenticated users to /auth/signin.
 * Replaces the repeated useSession + router.replace pattern across pages.
 *
 * Usage:
 *   const { status, isLoading, isAuthenticated } = useRequireAuth()
 *   if (isLoading) return <Spinner />
 */
export function useRequireAuth({
  redirectTo = '/auth/signin',
}: UseRequireAuthOptions = {}): UseRequireAuthReturn {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace(redirectTo)
    }
  }, [status, router, redirectTo])

  return {
    session,
    status,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
  }
}
