import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { completeJSON } from '@/lib/ai/orchestrator'

/**
 * POST /api/diet-analysis/ai-insights
 * 调用通义千问（文本模型）分析当日饮食与训练恢复的关系，
 * 返回 AI 驱动的得分卡和食物缺口推荐。
 *
 * Body: {
 *   intake:  { calories, protein, carbs, fat }
 *   goals:   { targetCalories, targetProtein, targetCarbs, targetFat }
 *   waterMl: number  (今日饮水量 ml)
 *   recentWorkout?: string  (可选：最近训练描述，如 "昨日：胸+三头")
 * }
 */

interface AiInsightRequest {
  intake:  { calories: number; protein: number; carbs: number; fat: number }
  goals:   { targetCalories: number; targetProtein: number; targetCarbs: number; targetFat: number }
  waterMl: number
  recentWorkout?: string
}

function buildPrompt(data: AiInsightRequest): string {
  const { intake, goals, waterMl, recentWorkout } = data
  const hydrationPct = Math.round((waterMl / 2000) * 100)
  const workoutSection = recentWorkout
    ? `【训练背景】
用户最近一次训练信息：${recentWorkout}
请结合训练类型给出针对性建议：胸肌/背部/肩部等大肌群训练后需提高蛋白质修复；高强度腿部/有氧日需提高碳水补充；手臂/腹部等小肌群日则正常摄入即可。`
    : ''

  return `你是一位专业健身营养师。请根据以下今日饮食数据，给出科学的营养分析和个性化的食物补充建议。

【今日摄入 vs 目标】
- 热量：${Math.round(intake.calories)} / ${goals.targetCalories} 千卡（${Math.round((intake.calories/goals.targetCalories)*100)}%）
- 蛋白质：${Math.round(intake.protein)} / ${goals.targetProtein} g（${Math.round((intake.protein/goals.targetProtein)*100)}%）
- 碳水：${Math.round(intake.carbs)} / ${goals.targetCarbs} g（${Math.round((intake.carbs/goals.targetCarbs)*100)}%）
- 脂肪：${Math.round(intake.fat)} / ${goals.targetFat} g（${Math.round((intake.fat/goals.targetFat)*100)}%）
- 今日饮水：${waterMl} ml（目标 2000ml，完成 ${hydrationPct}%）
${workoutSection}

请以严格 JSON 格式返回分析结果（无注释、无其他文字）：
{
  "proteinScore": 0-100整数（100=完全达标且分布合理，低于60=明显不足），,
  "proteinDesc": "蛋白质得分的简短说明（15-25字）",
  "carbsScore": 0-100整数,
  "carbsDesc": "碳水得分的简短说明（15-25字）",
  "fatScore": 0-100整数,
  "fatDesc": "脂肪得分的简短说明（15-25字）",
  "hydrationScore": 0-100整数,
  "hydrationDesc": "补水得分的简短说明（15-25字）",
  "overallScore": 0-100整数（四项加权平均，蛋白质权重40%，碳水30%，补水20%，脂肪10%）,
  "overallLevel": "优秀 / 良好 / 一般 / 偏低（根据总分选一个）",
  "overallAssessment": "总评（40-80字，说明今日饮食对训练恢复的整体支持情况）",
  "gaps": [
    {
      "nutrient": "蛋白质 / 碳水 / 脂肪（哪项最缺）",
      "gapAmount": 数字（缺口克数，整数）,
      "unit": "g",
      "recommendations": [
        {
          "combo": "具体食物组合，如：200ml 牛奶 + 1 个鸡蛋",
          "description": "这个组合能补充约 X g 蛋白质，同时…（20-35字健身视角说明）",
          "fillPercent": 0-100整数（能填补缺口的百分比）
        }
      ]
    }
  ]
}`
}


function parseInsightsJson(raw: string) {
  const jsonMatch =
    raw.match(/```json\s*([\s\S]*?)\s*```/) ||
    raw.match(/```\s*([\s\S]*?)\s*```/) ||
    raw.match(/(\{[\s\S]*\})/)
  const jsonStr = jsonMatch ? jsonMatch[1] : raw.trim()

  let p: Record<string, unknown>
  try { p = JSON.parse(jsonStr) } catch { throw new Error('无法解析 AI 分析结果') }

  const clamp = (v: unknown) => Math.min(100, Math.max(0, Math.round(Number(v ?? 50))))
  const str = (v: unknown, fb = '') => (typeof v === 'string' ? v : String(fb))

  const gaps = Array.isArray(p.gaps) ? (p.gaps as Record<string, unknown>[]).map(g => ({
    nutrient: str(g.nutrient, '蛋白质'),
    gapAmount: Math.round(Number(g.gapAmount ?? 0)),
    unit: str(g.unit, 'g'),
    recommendations: Array.isArray(g.recommendations)
      ? (g.recommendations as Record<string, unknown>[]).map(r => ({
          combo: str(r.combo),
          description: str(r.description),
          fillPercent: clamp(r.fillPercent),
        }))
      : [],
  })) : []

  return {
    proteinScore:     clamp(p.proteinScore),
    proteinDesc:      str(p.proteinDesc),
    carbsScore:       clamp(p.carbsScore),
    carbsDesc:        str(p.carbsDesc),
    fatScore:         clamp(p.fatScore),
    fatDesc:          str(p.fatDesc),
    hydrationScore:   clamp(p.hydrationScore),
    hydrationDesc:    str(p.hydrationDesc),
    overallScore:     clamp(p.overallScore),
    overallLevel:     str(p.overallLevel, '一般'),
    overallAssessment: str(p.overallAssessment),
    gaps,
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DASHSCOPE_API_KEY) {
      return NextResponse.json({ error: 'AI 分析功能未配置' }, { status: 503 })
    }

    const body = await request.json() as AiInsightRequest

    if (!body.intake || !body.goals) {
      return NextResponse.json({ error: '缺少必要参数 intake / goals' }, { status: 400 })
    }

    const prompt = buildPrompt(body)
    const raw = await completeJSON<Record<string, unknown>>({
      messages: [
        { role: 'system', content: '你是专业健身营养分析师，只输出严格 JSON，不含任何额外文字。' },
        { role: 'user', content: prompt },
      ],
      model: 'qwen-turbo',
      temperature: 0.4,
      maxTokens: 1500,
    })
    const result = parseInsightsJson(JSON.stringify(raw))

    return NextResponse.json(result)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'AI 分析失败'
    logger.error('POST /api/diet-analysis/ai-insights error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
