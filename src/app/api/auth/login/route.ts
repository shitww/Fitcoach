import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { rateLimit, getClientKey } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 })
    }

    // 速率限制：同一 IP 每 15 分钟最多 5 次登录尝试
    const clientKey = getClientKey(request);
    const limit = rateLimit(clientKey, 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: '登录尝试次数过多，请 15 分钟后再试' },
        { status: 429, headers: { 'Retry-After': '900' } }
      );
    }

    await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error('Login error:', error)
    if (error?.type === 'CredentialsSignin') {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 })
  }
}
