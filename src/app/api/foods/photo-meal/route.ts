import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { complete } from '@/lib/ai/orchestrator'

/**
 * POST /api/foods/photo-meal
 * 接收餐食照片（非营养标签），调用通义千问-VL 识别食物种类、份量，
 * 并从健身视角给出解读。
 *
 * Body: multipart/form-data { image: File }
 *    OR application/json   { base64: "data:image/...;base64,..." }
 *
 * Response: { foods, totalMacros, fitnessInterpretation, mealTiming }
 */

const SYSTEM_PROMPT = `你是一位专业的健身营养师。用户会上传一张餐食照片（不是营养成分表，是真实的食物图片）。

请完成以下两件事：
1. 识别照片中的所有食物，估计每种食物的份量，并估算其营养成分
2. 从健身训练视角，给出这顿饭的综合解读

以严格 JSON 格式返回（无注释、无多余文字）：
{
  "foods": [
    {
      "name": "食物名称（中文）",
      "quantity": 数字,
      "unit": "单位（g/个/片/碗/杯/ml等）",
      "calories": 该份量的估算热量（千卡整数）,
      "protein": 该份量的蛋白质克数（数字，保留1位小数）,
      "carbs": 该份量的碳水克数（数字，保留1位小数）,
      "fat": 该份量的脂肪克数（数字，保留1位小数）
    }
  ],
  "combinedItem": {
    "name": "整餐名称（中文）",
    "quantity": 数字,
    "unit": "单位",
    "calories": 该整餐估算热量（千卡整数）,
    "protein": 该整餐蛋白质克数（保留1位小数）,
    "carbs": 该整餐碳水克数（保留1位小数）,
    "fat": 该整餐脂肪克数（保留1位小数）
  },
  "totalMacros": {
    "calories": 总热量整数,
    "protein": 总蛋白质（保留1位小数）,
    "carbs": 总碳水（保留1位小数）,
    "fat": 总脂肪（保留1位小数）
  },
  "fitnessInterpretation": "60-120字的健身解读：列出检测到的主要食物、关键营养数据，以及这顿饭对训练的支持作用（恢复/增肌/补能）",
  "mealTiming": "最适合的训练时机，从以下选项中选一个：练前2小时 / 练前30分钟 / 练后1小时内 / 休息日 / 任意时间"
}

重要提示：
1. 如果照片是一个整体餐食（如一碗牛肉面、一份炒饭），combinedItem 应该是这个整体的名字（如「牛肉面」），并把总营养数据放在这里。
2. 如果照片是多种明显独立的食物（如牛奶+鸡蛋+面包），combinedItem 可以是一个概括性名称（如「牛奶鸡蛋早餐」），foods 列出每个独立食物。
3. 份量估算请尽量贴近常见份量（如：一碗米饭约200g，一个鸡蛋约50g）
4. 只返回 JSON，不要有任何其他文字`

async function callQwenVL(imageBase64: string, mimeType: string): Promise<string> {
  const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, '')
  const resp = await complete({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64Data}` } },
          { type: 'text', text: '请识别这张餐食照片，返回 JSON。' },
        ],
      },
    ],
    model: 'qwen-vl-plus',
    temperature: 0.3,
    timeoutMs: 40_000,
  })
  return resp.content
}

function parseMealJson(raw: string) {
  const jsonMatch =
    raw.match(/```json\s*([\s\S]*?)\s*```/) ||
    raw.match(/```\s*([\s\S]*?)\s*```/) ||
    raw.match(/(\{[\s\S]*\})/)
  const jsonStr = jsonMatch ? jsonMatch[1] : raw.trim()

  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(jsonStr)
  } catch {
    throw new Error('无法解析 AI 返回结果')
  }

  const foods = Array.isArray(parsed.foods) ? parsed.foods : []
  const tm = (parsed.totalMacros as Record<string, unknown>) ?? {}
  const ci = (parsed.combinedItem as Record<string, unknown>) ?? null

  const atwater = (p: number, c: number, f: number) => Math.round(c * 4 + p * 4 + f * 9)

  return {
    foods: foods.map((f: Record<string, unknown>) => {
      const protein = Math.round(Number(f.protein ?? 0) * 10) / 10
      const carbs = Math.round(Number(f.carbs ?? 0) * 10) / 10
      const fat = Math.round(Number(f.fat ?? 0) * 10) / 10
      return {
        name: String(f.name ?? '未知食物'),
        quantity: Number(f.quantity ?? 1),
        unit: String(f.unit ?? 'g'),
        calories: atwater(protein, carbs, fat),
        protein,
        carbs,
        fat,
      }
    }),
    combinedItem: ci && ci.name ? (() => {
      const protein = Math.round(Number(ci.protein ?? 0) * 10) / 10
      const carbs = Math.round(Number(ci.carbs ?? 0) * 10) / 10
      const fat = Math.round(Number(ci.fat ?? 0) * 10) / 10
      return {
        name: String(ci.name),
        quantity: Number(ci.quantity ?? 1),
        unit: String(ci.unit ?? 'g'),
        calories: atwater(protein, carbs, fat),
        protein,
        carbs,
        fat,
      }
    })() : null,
    totalMacros: {
      calories: atwater(
        Math.round(Number(tm.protein ?? 0) * 10) / 10,
        Math.round(Number(tm.carbs ?? 0) * 10) / 10,
        Math.round(Number(tm.fat ?? 0) * 10) / 10
      ),
      protein: Math.round(Number(tm.protein ?? 0) * 10) / 10,
      carbs: Math.round(Number(tm.carbs ?? 0) * 10) / 10,
      fat: Math.round(Number(tm.fat ?? 0) * 10) / 10,
    },
    fitnessInterpretation: String(parsed.fitnessInterpretation ?? ''),
    mealTiming: String(parsed.mealTiming ?? '任意时间'),
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DASHSCOPE_API_KEY) {
      return NextResponse.json({ error: 'AI 识别功能未配置' }, { status: 503 })
    }

    let imageBase64: string
    let mimeType = 'image/jpeg'

    const contentType = request.headers.get('content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      const file = formData.get('image') as File | null
      if (!file) return NextResponse.json({ error: '未提供图片文件' }, { status: 400 })
      if (file.size > 10 * 1024 * 1024)
        return NextResponse.json({ error: '图片大小不能超过 10MB' }, { status: 400 })
      mimeType = file.type || 'image/jpeg'
      imageBase64 = Buffer.from(await file.arrayBuffer()).toString('base64')
    } else {
      const body = await request.json()
      const raw = body?.base64 as string
      if (!raw) return NextResponse.json({ error: '未提供图片数据' }, { status: 400 })
      const mimeMatch = raw.match(/^data:([^;]+);base64,/)
      if (mimeMatch) mimeType = mimeMatch[1]
      imageBase64 = raw
    }

    const rawResponse = await callQwenVL(imageBase64, mimeType)
    const result = parseMealJson(rawResponse)

    return NextResponse.json(result)
  } catch (error) {
    const msg = error instanceof Error ? error.message : '识别失败'
    logger.error('POST /api/foods/photo-meal error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
