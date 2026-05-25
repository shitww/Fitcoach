import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

/**
 * GET /api/foods/barcode/[code]
 * 1. 先查本地数据库
 * 2. 未命中则调用 Open Food Facts API
 * 3. 命中后缓存到本地数据库
 */

interface OFFNutriments {
  'energy-kcal_100g'?: number;
  'energy_100g'?: number;        // kJ fallback
  proteins_100g?: number;
  carbohydrates_100g?: number;
  fat_100g?: number;
  fiber_100g?: number;
  sugars_100g?: number;
  sodium_100g?: number;          // 单位：g
  salt_100g?: number;            // 单位：g (salt = sodium * 2.5)
}

interface OFFProduct {
  status: number;
  product?: {
    product_name?: string;
    product_name_zh?: string;
    product_name_en?: string;
    brands?: string;
    categories?: string;
    nutriments?: OFFNutriments;
    code?: string;
  };
}

function inferCategory(categories: string | undefined): string {
  if (!categories) return '速食';
  const lower = categories.toLowerCase();
  if (/(milk|dairy|yogurt|cheese|奶|酸奶|乳)/i.test(lower)) return '奶制品';
  if (/(beverage|drink|juice|soda|water|tea|coffee|饮|茶|咖啡|果汁)/i.test(lower)) return '饮品';
  if (/(snack|chips|cracker|biscuit|cookie|chocolate|candy|零食|饼干|巧克力|糖果)/i.test(lower)) return '速食';
  if (/(meat|sausage|ham|肉|肠|火腿)/i.test(lower)) return '肉禽';
  if (/(fish|seafood|fish|鱼|海鲜)/i.test(lower)) return '水产';
  if (/(bread|noodle|pasta|rice|cereal|面包|面条|米饭|麦)/i.test(lower)) return '主食';
  if (/(fruit|水果)/i.test(lower)) return '水果';
  if (/(vegetable|蔬菜)/i.test(lower)) return '蔬菜';
  if (/(nut|seed|坚果)/i.test(lower)) return '坚果';
  if (/(egg|蛋)/i.test(lower)) return '蛋类';
  if (/(sauce|condiment|oil|salt|sugar|调味|酱|油)/i.test(lower)) return '调味料';
  return '速食';
}

function safeNum(v: number | undefined, max: number = 9999): number {
  if (v == null || isNaN(v) || v < 0) return 0;
  if (v > max) return max;
  return Math.round(v * 10) / 10;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params;
    const barcode = (code || '').trim();
    if (!barcode || !/^\d{6,14}$/.test(barcode)) {
      return NextResponse.json({ error: '条码格式不正确' }, { status: 400 });
    }

    // 1. 本地查询
    const existing = await prisma.food.findUnique({ where: { barcode } });
    if (existing) {
      return NextResponse.json({ food: existing, source: 'cache' });
    }

    // 2. Open Food Facts 查询
    const offUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json?fields=product_name,product_name_zh,product_name_en,brands,categories,nutriments,code`;
    const res = await fetch(offUrl, {
      headers: { 'User-Agent': 'FitCoach/1.0 (https://fitcoach.app)' },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return NextResponse.json({ error: '外部数据库查询失败' }, { status: 502 });
    }

    const data: OFFProduct = await res.json();
    if (data.status !== 1 || !data.product) {
      return NextResponse.json({ error: '未找到该商品', barcode }, { status: 404 });
    }

    const p = data.product;
    const n = p.nutriments || {};
    const name = p.product_name_zh || p.product_name || p.product_name_en || `商品 ${barcode}`;

    // 单位换算
    let calories = safeNum(n['energy-kcal_100g']);
    if (!calories && n.energy_100g) {
      calories = safeNum(n.energy_100g / 4.184); // kJ → kcal
    }
    // sodium: OFF 使用 g/100g，本系统使用 mg/100g
    let sodium: number | null = null;
    if (n.sodium_100g != null) sodium = safeNum(n.sodium_100g * 1000, 99999);
    else if (n.salt_100g != null) sodium = safeNum((n.salt_100g / 2.5) * 1000, 99999);

    // 3. 获取用户ID并写入缓存
    let userId: string | null = null;
    try { userId = await getDbUserId(); } catch { /* 未登录 */ }

    const created = await prisma.food.create({
      data: {
        name: name.slice(0, 100),
        nameEn: p.product_name_en || null,
        brand: p.brands?.split(',')[0]?.trim() || null,
        barcode,
        category: inferCategory(p.categories),
        servingUnit: 'g',
        calories,
        protein: safeNum(n.proteins_100g),
        carbs: safeNum(n.carbohydrates_100g),
        fat: safeNum(n.fat_100g),
        fiber: n.fiber_100g != null ? safeNum(n.fiber_100g) : null,
        sugar: n.sugars_100g != null ? safeNum(n.sugars_100g) : null,
        sodium,
        source: 'openfoodfacts',
        isCustom: false,
        userId: null, // 包装食品对所有人可见
      },
    });

    return NextResponse.json({ food: created, source: 'openfoodfacts' });
  } catch (error) {
    logger.error('GET /api/foods/barcode error:', error);
    return NextResponse.json({ error: '条码查询失败' }, { status: 500 });
  }
}
