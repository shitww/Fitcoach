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
        { role: 'system', content: '你是用户的私人健身教练，说话直接、真实、有个性。你看过了用户的训练数据，现在当面给他反馈。不说套话，不说废话，每句话都要有根据。输出严格JSON，coach字段是一段自然流畅的中文教练点评，无其他字段。' },
        { role: 'user', content: prompt },
      ],
      model: 'qwen-plus',
      temperature: 0.85,
      maxTokens: 500,
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
