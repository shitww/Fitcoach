import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';
import { complete } from '@/lib/ai/orchestrator';

export async function POST(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { workoutId, type } = await request.json();

    const workout = await prisma.workout.findFirst({
      where: { id: workoutId, userId },
      include: { workoutSets: true }
    });

    if (!workout) {
      return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
    }

    let totalSets = 0;
    let totalVolume = 0;
    const exerciseMap: Record<string, { sets: number; maxWeight: number; totalReps: number }> = {};

    workout.workoutSets.forEach(set => {
      totalSets++;
      totalVolume += set.weight * set.reps;
      if (!exerciseMap[set.exercise]) exerciseMap[set.exercise] = { sets: 0, maxWeight: 0, totalReps: 0 };
      exerciseMap[set.exercise].sets++;
      exerciseMap[set.exercise].maxWeight = Math.max(exerciseMap[set.exercise].maxWeight, set.weight);
      exerciseMap[set.exercise].totalReps += set.reps;
    });

    const exerciseDetails = Object.entries(exerciseMap)
      .map(([name, d]) => `${name}（${d.sets}组 × 最大${d.maxWeight}kg）`)
      .join('、');

    const prompt = `用户刚完成了一次训练：
- 动作：${exerciseDetails}
- 总组数：${totalSets}组
- 总训练量：${(totalVolume / 1000).toFixed(2)}吨
- 训练时长：${workout.duration || 0}分钟

请根据以上数据给出个性化的训练总结和激励反馈。`;

    let feedbackText: string;
    try {
      const resp = await complete({
        messages: [
          { role: 'system', content: '你是一位了解训练科学的专业健身教练。根据用户训练数据给出个性化即时反馈：引用具体数据评价本次训练质量，然后给出一个最关键的改进提示。直接输出2-3句中文文字，不要JSON、标题或 Markdown。' },
          { role: 'user', content: prompt },
        ],
        model: 'qwen-turbo',
        temperature: 0.7,
        maxTokens: 200,
      });
      feedbackText = resp.content;
      if (!feedbackText) throw new Error('empty response');
    } catch (e) {
      logger.warn('AI feedback failed, using fallback:', e);
      const names = Object.keys(exerciseMap).join('、');
      feedbackText = `训练完成！今天完成了 ${Object.keys(exerciseMap).length} 个动作，${totalSets} 组，总训练量 ${(totalVolume / 1000).toFixed(1)} 吨。主要训练了${names}，继续保持！`;
    }

    const feedback = await prisma.feedback.create({
      data: { userId, workoutId, type: type || 'summary', content: feedbackText }
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    logger.error('Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
