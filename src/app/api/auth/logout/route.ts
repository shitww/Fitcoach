import { NextResponse } from 'next/server'
import { signOut } from '@/lib/auth'
import { cookies } from 'next/headers'
import { logger } from '@/lib/logger'

export async function POST() {
  try {
    const cookieStore = await cookies()

    // 清除所有可能的 auth 相关 cookie
    cookieStore.getAll().forEach(cookie => {
      if (
        cookie.name.includes('session') ||
        cookie.name.includes('auth') ||
        cookie.name.includes('next-auth') ||
        cookie.name.includes('csrf') ||
        cookie.name.includes('callback')
      ) {
        cookieStore.delete(cookie.name)
      }
    })

    try {
      await signOut({ redirect: false })
    } catch {
      // signOut 可能在 cookie 已清除后抛错，安全忽略
    }

    const response = NextResponse.json({ success: true })
    // 通过 Set-Cookie header 确保客户端也清除
    response.headers.append('Set-Cookie', 'next-auth.session-token=; Path=/; Max-Age=0; HttpOnly')
    response.headers.append('Set-Cookie', '__Secure-next-auth.session-token=; Path=/; Max-Age=0; HttpOnly; Secure')
    response.headers.append('Set-Cookie', 'next-auth.csrf-token=; Path=/; Max-Age=0; HttpOnly')
    response.headers.append('Set-Cookie', 'next-auth.callback-url=; Path=/; Max-Age=0; HttpOnly')
    response.headers.append('Set-Cookie', 'authjs.session-token=; Path=/; Max-Age=0; HttpOnly')
    response.headers.append('Set-Cookie', 'authjs.csrf-token=; Path=/; Max-Age=0; HttpOnly')
    response.headers.append('Set-Cookie', 'authjs.callback-url=; Path=/; Max-Age=0; HttpOnly')
    response.headers.append('Set-Cookie', '__Secure-authjs.session-token=; Path=/; Max-Age=0; HttpOnly; Secure')
    return response
  } catch (error) {
    logger.warn('Logout error:', error)
    // 即使出错也尝试返回清除 cookie 的响应
    const response = NextResponse.json({ success: true })
    response.headers.append('Set-Cookie', 'next-auth.session-token=; Path=/; Max-Age=0; HttpOnly')
    response.headers.append('Set-Cookie', 'authjs.session-token=; Path=/; Max-Age=0; HttpOnly')
    response.headers.append('Set-Cookie', '__Secure-authjs.session-token=; Path=/; Max-Age=0; HttpOnly; Secure')
    return response
  }
}
