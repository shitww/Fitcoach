import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { getUserPlans } from '@/lib/dashboard';
import { emitDashboardEvent } from '@/lib/dashboard/events';
import { logger } from '@/lib/logger';

// GET /api/plans - 获取用户所有计划
export async function GET() {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const plans = await getUserPlans(userId);
    return NextResponse.json({ plans });
  } catch (error) {
    logger.error('GET /api/plans error:', error);
    return NextResponse.json({ error: '获取训练计划失败，请稍后重试' }, { status: 500 });
  }
}

// POST /api/plans - 创建训练计划
export async function POST(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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

    emitDashboardEvent("PLAN_CREATED", userId);
    return NextResponse.json({ plan }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/plans error:', error);
    return NextResponse.json({ error: '创建训练计划失败，请稍后重试', details: String(error) }, { status: 500 });
  }
}
