import { NextResponse } from 'next/server'
import { signOut } from '@/lib/auth'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

export async function POST() {
  try {
    // 清除所有 cookies
    const cookieStore = await cookies()
    cookieStore.getAll().forEach(cookie => {
      if (cookie.name.includes('session') || cookie.name.includes('auth')) {
        cookieStore.delete(cookie.name)
      }
    })

    await signOut({ redirect: false })
    return NextResponse.json({ success: true })
  } catch (error) {
    logger.warn('Logout error:', error)
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 })
  }
}
