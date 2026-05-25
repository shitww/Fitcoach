import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { getNutritionSettings } from '@/lib/dashboard';
import { logger } from '@/lib/logger';

// GET /api/nutrition-goals — 读取营养目标
export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await getNutritionSettings(userId);
    return NextResponse.json(settings);
  } catch (error) {
    logger.error('GET /api/nutrition-goals error:', error);
    return NextResponse.json({ error: '获取营养目标失败' }, { status: 500 });
  }
}

// PUT /api/nutrition-goals — 更新营养目标
export async function PUT(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { targetCalories, targetProtein, targetCarbs, targetFat, waterGoal } = body;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};
    if (targetCalories !== undefined) data.targetCalories = Number(targetCalories);
    if (targetProtein !== undefined) data.targetProtein = Number(targetProtein);
    if (targetCarbs !== undefined) data.targetCarbs = Number(targetCarbs);
    if (targetFat !== undefined) data.targetFat = Number(targetFat);
    if (waterGoal !== undefined) data.waterGoal = Number(waterGoal);
    data.updatedAt = new Date();

    const settings = await prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        waterGoal: waterGoal ?? 2500,
        targetCalories: targetCalories ?? 2000,
        targetProtein: targetProtein ?? 60,
        targetCarbs: targetCarbs ?? 250,
        targetFat: targetFat ?? 65,
      }
    });

    return NextResponse.json({
      waterGoal: settings.waterGoal,
      targetCalories: settings.targetCalories,
      targetProtein: settings.targetProtein,
      targetCarbs: settings.targetCarbs,
      targetFat: settings.targetFat,
    });
  } catch (error) {
    logger.error('PUT /api/nutrition-goals error:', error);
    return NextResponse.json({ error: '更新营养目标失败' }, { status: 500 });
  }
}
