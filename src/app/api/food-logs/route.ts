import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { getTodayFoodLogs } from '@/lib/dashboard';
import { emitDashboardEvent } from '@/lib/dashboard/events';
import { logger } from '@/lib/logger';

// GET /api/food-logs — 获取饮食记录列表
export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const mealType = searchParams.get('mealType');

    // Fast path: today's summary — uses shared server-side function
    if (date && !startDate && !endDate && !mealType) {
      const { logs, summary } = await getTodayFoodLogs(userId);
      return NextResponse.json({ logs, summary });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { userId };

    if (date) {
      where.date = { gte: new Date(`${date}T00:00:00.000Z`), lt: new Date(`${date}T23:59:59.999Z`) };
    } else if (startDate && endDate) {
      where.date = { gte: new Date(`${startDate}T00:00:00.000Z`), lt: new Date(`${endDate}T23:59:59.999Z`) };
    }

    if (mealType) {
      where.mealType = mealType;
    }

    const logs = await prisma.foodLog.findMany({
      where,
      include: { food: true },
      orderBy: { createdAt: 'desc' }
    });

    const summary = logs.reduce((acc, log) => {
      acc.calories += log.calories;
      acc.protein += log.protein;
      acc.carbs += log.carbs;
      acc.fat += log.fat;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    return NextResponse.json({ logs, summary });
  } catch (error) {
    logger.error('GET /api/food-logs error:', error);
    return NextResponse.json({ error: '获取饮食记录失败' }, { status: 500 });
  }
}

// POST /api/food-logs — 记录饮食
// Body: { foodId, date, mealType, grams, calories, protein, carbs, fat }
export async function POST(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { foodId, date, mealType, grams, calories, protein, carbs, fat } = body;

    if (!foodId || !date || !mealType) {
      return NextResponse.json({ error: '缺少必填字段：foodId, date, mealType' }, { status: 400 });
    }

    const gramsVal = parseFloat(grams || '100');
    const log = await prisma.foodLog.create({
      data: {
        userId,
        foodId,
        date: new Date(`${date}T00:00:00.000Z`),
        mealType,
        serving: gramsVal / 100,          // 份数 = 克数 / 100
        servingG: gramsVal,                // 克数
        calories: parseFloat(calories || '0'),
        protein: parseFloat(protein || '0'),
        carbs: parseFloat(carbs || '0'),
        fat: parseFloat(fat || '0'),
      },
      include: { food: true }
    });

    emitDashboardEvent("NUTRITION_LOGGED", userId);
    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/food-logs error:', error);
    return NextResponse.json({ error: '记录饮食失败' }, { status: 500 });
  }
}