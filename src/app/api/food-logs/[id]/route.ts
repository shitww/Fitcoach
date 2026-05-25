import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

// PATCH /api/food-logs/[id] — 修改克重
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const existing = await prisma.foodLog.findUnique({ where: { id }, include: { food: true } });

    if (!existing) return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    if (existing.userId !== userId) return NextResponse.json({ error: '无权修改' }, { status: 403 });

    const { grams } = await request.json();
    if (!grams || grams <= 0 || grams > 5000) {
      return NextResponse.json({ error: '克重无效（1-5000g）' }, { status: 400 });
    }

    const ratio = grams / 100;
    const food = existing.food;
    const updated = await prisma.foodLog.update({
      where: { id },
      data: {
        servingG: grams,
        serving: grams / 100,
        calories: food.calories * ratio,
        protein: food.protein * ratio,
        carbs: food.carbs * ratio,
        fat: food.fat * ratio,
      },
    });

    return NextResponse.json({ log: updated });
  } catch (error) {
    logger.error('PATCH /api/food-logs/[id] error:', error);
    return NextResponse.json({ error: '修改失败' }, { status: 500 });
  }
}

// DELETE /api/food-logs/[id] — 删除饮食记录
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.foodLog.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: '记录不存在' }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: '无权删除' }, { status: 403 });
    }

    await prisma.foodLog.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/food-logs/[id] error:', error);
    return NextResponse.json({ error: '删除记录失败' }, { status: 500 });
  }
}