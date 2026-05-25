import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { completeJSON } from '@/lib/ai/orchestrator';
import { buildFeedbackPrompt } from '@/lib/ai/prompts/feedback';

// ── GET: check cached feedback ───────────────────────────────────────────────
export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ cached: false }, { status: 401 });
    const workoutId = request.nextUrl.searchParams.get('workoutId');
    if (!workoutId) return NextResponse.json({ cached: false });
    const row = await prisma.feedback.findFirst({
      where: { userId, workoutId, type: 'summary' },
      orderBy: { createdAt: 'desc' },
    });
    if (row) {
      return NextResponse.json({ cached: true, feedback: JSON.parse(row.content) });
    }
    return NextResponse.json({ cached: false });
  } catch (err) {
    logger.error('[workout-feedback GET]', err);
    return NextResponse.json({ cached: false });
  }
}

// ── POST: generate + cache ───────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    const body = await request.json();
    const { workoutId, workoutType, exercises, duration, notes, totalVolume, totalSets, maxWeight, cardioData } = body;

    const durationMin = Math.round((Number(duration) || 0) / 60);

    const prompt = buildFeedbackPrompt({
      workoutType: workoutType === 'cardio' ? 'cardio' : workoutType === 'free' ? 'free' : 'strength',
      durationMin,
      totalVolume,
      totalSets,
      maxWeight,
      notes,
      exercises,
      cardioData,
    });

    const feedback = await completeJSON({
      messages: [
        { role: 'system', content: '你是专业私人健身教练，擅长从训练数据中发现用户自己看不到的问题和机会。分析规则：① RIR 0-1 = 接近力竭，神经疲劳高；RIR 4+ = 过于保守，可加重；② 力竭组(isFailure=true)是高压力信号；③ 同组动作量与历史对比判断进步还是退步；④ 每个字段必须结合具体数字，不用泛泛而谈。中文输出，严格JSON格式，无任何额外文字。' },
        { role: 'user', content: prompt },
      ],
      model: 'qwen-turbo',
      temperature: 0.75,
      maxTokens: 700,
    });

    // Persist to DB (upsert: delete old + insert new)
    if (userId && workoutId) {
      try {
        await prisma.feedback.deleteMany({ where: { userId, workoutId, type: 'summary' } });
        await prisma.feedback.create({
          data: { userId, workoutId, type: 'summary', content: JSON.stringify(feedback) },
        });
      } catch (dbErr) {
        logger.warn('[workout-feedback] DB save failed (non-fatal):', dbErr);
      }
    }

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    logger.error('[workout-feedback] AI error:', error);
    return NextResponse.json({ success: false, error: 'AI分析失败' }, { status: 500 });
  }
}
