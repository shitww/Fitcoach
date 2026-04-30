import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { logger } from '@/lib/logger';

// GET /api/plans - 获取用户所有计划
export async function GET() {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUser = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }
    const userId = dbUser.id;

    const plans = await prisma.trainingPlan.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        days: { orderBy: { dayIndex: 'asc' } }
      }
    });

    return NextResponse.json({ plans });
  } catch (error) {
    logger.warn('GET /api/plans error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/plans - 创建训练计划
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    const userEmail = session?.user?.email;
    if (!userEmail) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const dbUser = await prisma.user.findUnique({ where: { email: userEmail } });
    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }
    const userId = dbUser.id;

    const body = await request.json();
    const { name, goal, frequency, level, days } = body;

    if (!name || !days?.length) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    logger.info('创建计划数据:', { name, goal, frequency, level, days });

    const plan = await prisma.trainingPlan.create({
      data: {
        userId,
        name,
        goal: goal || 'muscle',
        frequency: Number(frequency) || 3,
        level: level || 'intermediate',
        days: {
          create: days.map((day: any, index: number) => ({
            dayIndex: index,
            dayName: day.dayName || `第${index + 1}天`,
            exercises: JSON.stringify(day.exercises || [])
          }))
        }
      },
      include: { days: { orderBy: { dayIndex: 'asc' } } }
    });

    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/plans error:', error);
    return NextResponse.json({ error: 'Internal server error', details: String(error) }, { status: 500 });
  }
}
