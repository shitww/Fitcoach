import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

// GET /api/foods — 搜索食物（系统食物公开，无需登录）
export async function GET(request: NextRequest) {
  try {
    // 尝试获取用户ID（可选），未登录时只返回系统食物
    let userId: string | null = null;
    try { userId = await getDbUserId(); } catch { /* 未登录 */ }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const mine = searchParams.get('mine') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
    const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = mine
      ? { userId }   // 仅返回当前用户的食物
      : {
          AND: [
            {
              OR: [
                { userId: null },
                ...(userId ? [{ userId }] : [])
              ]
            }
          ]
        };

    if (search) {
      const searchFilter = {
        OR: [
          { name: { contains: search } },
          { nameEn: { contains: search } },
          { brand: { contains: search } },
          { barcode: { contains: search } }
        ]
      };
      if (mine) { Object.assign(where, searchFilter); }
      else { where.AND.push(searchFilter); }
    }

    if (category) {
      if (mine) { where.category = category; }
      else { where.AND.push({ category }); }
    }

    const [foods, total] = await Promise.all([
      prisma.food.findMany({
        where,
        orderBy: mine
          ? [{ createdAt: 'desc' }]   // 我的食物：最新优先
          : [{ isCustom: 'asc' }, { name: 'asc' }],
        take: limit,
        skip: offset
      }),
      prisma.food.count({ where })
    ]);

    return NextResponse.json({ foods, total });
  } catch (error) {
    logger.error('GET /api/foods error:', error);
    return NextResponse.json({ error: '获取食物列表失败' }, { status: 500 });
  }
}

// POST /api/foods — 创建自定义食物
export async function POST(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, nameEn, brand, barcode, servingUnit, calories, protein, carbs, fat, fiber, sugar, sodium } = body;

    if (!name || calories === undefined || protein === undefined || carbs === undefined || fat === undefined) {
      return NextResponse.json(
        { error: '缺少必填字段：name, calories, protein, carbs, fat' },
        { status: 400 }
      );
    }

    const parsedCal = parseFloat(calories);
    const parsedPro = parseFloat(protein);
    const parsedCarbs = parseFloat(carbs);
    const parsedFat = parseFloat(fat);

    if (isNaN(parsedCal) || parsedCal <= 0) {
      return NextResponse.json({ error: 'calories 必须大于 0' }, { status: 400 });
    }
    if (isNaN(parsedPro) || parsedPro < 0 || isNaN(parsedCarbs) || parsedCarbs < 0 || isNaN(parsedFat) || parsedFat < 0) {
      return NextResponse.json({ error: 'protein/carbs/fat 不能为负数' }, { status: 400 });
    }

    // 如果提供了 barcode，检查是否已存在
    if (barcode) {
      const existing = await prisma.food.findUnique({ where: { barcode } });
      if (existing) {
        return NextResponse.json(
          { error: '该条形码已存在', food: existing },
          { status: 409 }
        );
      }
    }

    const food = await prisma.food.create({
      data: {
        name,
        nameEn: nameEn || null,
        brand: brand || null,
        barcode: barcode || null,
        servingUnit: servingUnit || 'g',
        calories: parseFloat(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        fiber: fiber != null ? parseFloat(fiber) : null,
        sugar: sugar != null ? parseFloat(sugar) : null,
        sodium: sodium != null ? parseFloat(sodium) : null,
        source: 'custom',
        isCustom: true,
        userId
      }
    });

    return NextResponse.json({ food }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/foods error:', error);
    return NextResponse.json({ error: '创建食物失败' }, { status: 500 });
  }
}
