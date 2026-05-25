import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

// GET /api/foods/[id] — 获取单个食物详情
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const food = await prisma.food.findUnique({ where: { id } });

    if (!food) {
      return NextResponse.json({ error: '食物不存在' }, { status: 404 });
    }

    // 系统食物或用户自己的食物均可查看
    if (food.userId && food.userId !== userId) {
      return NextResponse.json({ error: '无权查看' }, { status: 403 });
    }

    return NextResponse.json({ food });
  } catch (error) {
    logger.error('GET /api/foods/[id] error:', error);
    return NextResponse.json({ error: '获取食物详情失败' }, { status: 500 });
  }
}

// PUT /api/foods/[id] — 更新自定义食物
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.food.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: '食物不存在' }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: '只能编辑自己的自定义食物' }, { status: 403 });
    }

    const body = await request.json();
    const { name, nameEn, brand, barcode, servingUnit, calories, protein, carbs, fat, fiber, sugar, sodium } = body;

    const food = await prisma.food.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(nameEn !== undefined && { nameEn }),
        ...(brand !== undefined && { brand }),
        ...(barcode !== undefined && { barcode }),
        ...(servingUnit !== undefined && { servingUnit }),
        ...(calories !== undefined && { calories: parseFloat(calories) }),
        ...(protein !== undefined && { protein: parseFloat(protein) }),
        ...(carbs !== undefined && { carbs: parseFloat(carbs) }),
        ...(fat !== undefined && { fat: parseFloat(fat) }),
        ...(fiber !== undefined && { fiber: fiber != null ? parseFloat(fiber) : null }),
        ...(sugar !== undefined && { sugar: sugar != null ? parseFloat(fiber) : null }),
        ...(sodium !== undefined && { sodium: sodium != null ? parseFloat(sodium) : null }),
      }
    });

    return NextResponse.json({ food });
  } catch (error) {
    logger.error('PUT /api/foods/[id] error:', error);
    return NextResponse.json({ error: '更新食物失败' }, { status: 500 });
  }
}

// DELETE /api/foods/[id] — 删除自定义食物
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
    const existing = await prisma.food.findUnique({ where: { id } });

    if (!existing) {
      return NextResponse.json({ error: '食物不存在' }, { status: 404 });
    }

    if (existing.userId !== userId) {
      return NextResponse.json({ error: '只能删除自己的自定义食物' }, { status: 403 });
    }

    await prisma.food.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/foods/[id] error:', error);
    return NextResponse.json({ error: '删除食物失败' }, { status: 500 });
  }
}