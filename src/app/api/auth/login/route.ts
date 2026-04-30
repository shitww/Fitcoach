import { NextRequest, NextResponse } from 'next/server'
import { signIn } from '@/lib/auth'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: '邮箱和密码不能为空' }, { status: 400 })
    }

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.error || result?.url === undefined) {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    logger.error('Login error:', error)
    if (error?.type === 'CredentialsSignin') {
      return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 })
    }
    return NextResponse.json({ error: '登录失败，请稍后重试' }, { status: 500 })
  }
}
