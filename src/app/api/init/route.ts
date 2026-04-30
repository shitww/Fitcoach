import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

// 初始化演示账号
async function ensureDemoUser() {
  try {
    const existing = await prisma.user.findUnique({
      where: { email: 'demo@fitcoach.com' }
    })

    if (!existing) {
      // bcrypt hash for "demo123" - 12 rounds
      const hashedPassword = '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyDA.mmSVZ.1.u'

      await prisma.user.create({
        data: {
          email: 'demo@fitcoach.com',
          password: hashedPassword,
          name: '演示用户'
        }
      })
      logger.info('✅ Demo user created')
    }
  } catch (error) {
    logger.error('Demo user creation error:', error)
  }
}

export async function GET(request: NextRequest) {
  // 在首次调用时初始化演示账号
  await ensureDemoUser()
  return NextResponse.json({ ready: true })
}

export async function POST(request: NextRequest) {
  await ensureDemoUser()
  return NextResponse.json({ success: true })
}
