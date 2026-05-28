import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

const protectedPaths = ['/workout', '/history', '/analytics', '/profile', '/settings', '/plans', '/diet', '/goals', '/summary', '/exercises']
const authPaths = ['/auth/signin', '/auth/signup']

export const proxy = auth(function proxy(request) {
  const { pathname } = request.nextUrl
  const isLoggedIn = !!request.auth

  const isProtectedPath = protectedPaths.some(p => pathname.startsWith(p))
  const isAuthPath = authPaths.some(p => pathname.startsWith(p))

  // 访问受保护页面但未登录 → 重定向到登录页
  if (isProtectedPath && !isLoggedIn) {
    const loginUrl = new URL('/auth/signin', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 已登录访问登录/注册页 → 跳转到首页
  if (isAuthPath && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/workout/:path*',
    '/history/:path*',
    '/analytics/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/plans/:path*',
    '/diet/:path*',
    '/goals/:path*',
    '/summary/:path*',
    '/exercises/:path*',
    '/auth/:path*',
  ]
}
