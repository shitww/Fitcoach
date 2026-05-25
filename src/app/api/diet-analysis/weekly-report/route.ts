import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { completeJSON } from '@/lib/ai/orchestrator'

/**
 * POST /api/diet-analysis/weekly-report
 * Body: { days: { date, calories, protein, carbs, fat, water }[], goals: { targetCalories, targetProtein, targetCarbs, targetFat } }
 */
interface WeeklyReportRequest {
  days: {
    date: string
    calories: number
    protein: number
    carbs: number
    fat: number
    water?: number
  }[]
  goals: {
    targetCalories: number
    targetProtein: number
    targetCarbs: number
    targetFat: number
  }
}

function buildPrompt(data: WeeklyReportRequest): string {
  const { days, goals } = data

  const lines = days.map(d => {
    const pPct = goals.targetProtein > 0 ? Math.round((d.protein / goals.targetProtein) * 100) : 0
    const cPct = goals.targetCarbs > 0 ? Math.round((d.carbs / goals.targetCarbs) * 100) : 0
    const w = d.water ?? 0
    return `- ${d.date}: ${d.calories}kcal / 蛋白${d.protein}g(${pPct}%) / 碳水${d.carbs}g(${cPct}%) / 脂肪${d.fat}g / 饮水${w}ml`
  }).join('\n')

  return `你是专业健身营养师。请根据用户最近 7 天的饮食数据，生成一段简洁的周报总结（150-250字）。

【7 天摄入明细】
${lines}

【营养目标】
- 热量 ${goals.targetCalories}kcal / 蛋白质 ${goals.targetProtein}g / 碳水 ${goals.targetCarbs}g / 脂肪 ${goals.targetFat}g

要求：
1. 指出哪几天表现最好，哪几天有明显缺口
2. 点评蛋白质达标率是否稳定
3. 如果发现某几天碳水明显偏低（<60%），提醒可能是训练日能量不足
4. 给一句下周改进建议

请以严格 JSON 格式返回，不含任何额外文字：
{
  "title": "本周饮食周报（5-10字）",
  "summary": "周报正文（150-250字）",
  "highlightDay": "表现最好的一天",
  "weakDay": "缺口最大的一天",
  "nextWeekTip": "下周改进建议（20-40字）"
}`
}


function parseReportJson(raw: string) {
  const jsonMatch =
    raw.match(/```json\s*([\s\S]*?)\s*```/) ||
    raw.match(/```\s*([\s\S]*?)\s*```/) ||
    raw.match(/(\{[\s\S]*\})/)
  const jsonStr = jsonMatch ? jsonMatch[1] : raw.trim()

  let p: Record<string, unknown>
  try { p = JSON.parse(jsonStr) } catch { throw new Error('无法解析 AI 周报结果') }

  const str = (v: unknown, fb = '') => (typeof v === 'string' ? v : String(fb))

  return {
    title: str(p.title, '本周饮食周报'),
    summary: str(p.summary),
    highlightDay: str(p.highlightDay),
    weakDay: str(p.weakDay),
    nextWeekTip: str(p.nextWeekTip),
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.DASHSCOPE_API_KEY) {
      return NextResponse.json({ error: 'AI 分析功能未配置' }, { status: 503 })
    }

    const body = await request.json() as WeeklyReportRequest
    if (!body.days?.length || !body.goals) {
      return NextResponse.json({ error: '缺少 days 或 goals' }, { status: 400 })
    }

    const prompt = buildPrompt(body)
    const raw = await completeJSON<Record<string, unknown>>({
      messages: [
        { role: 'system', content: '你是专业健身营养分析师，只输出严格 JSON，不含任何额外文字。' },
        { role: 'user', content: prompt },
      ],
      model: 'qwen-turbo',
      temperature: 0.4,
      maxTokens: 800,
    })
    const result = parseReportJson(JSON.stringify(raw))

    return NextResponse.json(result)
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'AI 周报生成失败'
    logger.error('POST /api/diet-analysis/weekly-report error:', error)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
