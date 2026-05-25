import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';
import { getPeriodDateRange } from '@/lib/date-range';
import { completeJSON } from '@/lib/ai/orchestrator';

export async function GET(request: Request) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'month';
    const { start, end, label } = getPeriodDateRange(period);

    const daysInPeriod = Math.max(1, (end.getTime() - start.getTime()) / 86_400_000);
    const weeksInPeriod = Math.max(1, daysInPeriod / 7);

    const workouts = await prisma.workout.findMany({
      where: { userId, date: { gte: start, lte: end } },
      include: { workoutSets: true },
      orderBy: { date: 'desc' },
    });

    if (workouts.length === 0) {
      return NextResponse.json({
        summary: `${label}暂无训练记录，开始你的第一次训练吧！`,
        highlights: [],
        nextWeekFocus: '建议安排 3 次训练，覆盖胸、背、腿三大肌群。',
        stats: { sessions: 0, totalVolume: 0, totalSets: 0, avgDuration: 0 },
      });
    }

    // Aggregate stats
    let totalVolume = 0;
    let totalSets = 0;
    let totalDuration = 0;
    const muscleMap: Record<string, number> = {};
    const exerciseMap: Record<string, number> = {};

    workouts.forEach(w => {
      totalDuration += w.duration || 0;
      w.workoutSets.filter(s => s.type === 'S').forEach(s => {
        totalVolume += s.weight * s.reps;
        totalSets++;
        const mg = s.muscleGroup?.toLowerCase() || 'other';
        muscleMap[mg] = (muscleMap[mg] || 0) + s.weight * s.reps;
        exerciseMap[s.exercise] = (exerciseMap[s.exercise] || 0) + 1;
      });
    });

    const topMuscle = Object.entries(muscleMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    const topExercise = Object.entries(exerciseMap).sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    const muscleGroupCN: Record<string, string> = {
      chest: '胸部', back: '背部', legs: '腿部', shoulders: '肩部', arms: '手臂',
    };

    // Muscle balance: flag if one group is >50% of total volume
    const muscleEntries = Object.entries(muscleMap).sort((a, b) => b[1] - a[1]);
    const dominantMusclePct = totalVolume > 0 && muscleEntries[0]
      ? Math.round((muscleEntries[0][1] / totalVolume) * 100) : 0;
    const muscleBalanceNote = dominantMusclePct > 50
      ? `\n⚠️ ${muscleGroupCN[muscleEntries[0][0]] || muscleEntries[0][0]}占总训练量 ${dominantMusclePct}%，存在肌群失衡风险`
      : '';

    const prompt = `用户${label}训练数据：
- 训练次数：${workouts.length}次（每周平均 ${(workouts.length / weeksInPeriod).toFixed(1)} 次）
- 总训练量：${(totalVolume / 1000).toFixed(1)}吨
- 总组数：${totalSets}组
- 平均时长：${Math.round(totalDuration / workouts.length / 60)}分钟/次
- 训练最多的肌群：${muscleGroupCN[topMuscle] || topMuscle}${muscleBalanceNote}
- 最常做的动作：${topExercise}

输出本期训练复盘（严格JSON，不含其他文字）：
{
  "summary": "整体评价，必须提及训练频率和总量是否合理（2句）",
  "highlights": ["最突出的亮点（含具体数据）", "第二亮点"],
  "nextWeekFocus": "下周最重要的1个调整方向（具体到肌群或动作）",
  "recoveryAdvice": "基于本周训练频率给出恢复建议（休息天数或主动恢复方式）"
}`;

    let aiResult: { summary: string; highlights: string[]; nextWeekFocus: string; recoveryAdvice?: string };
    try {
      aiResult = await completeJSON({
        messages: [
          { role: 'system', content: '你是专业健身教练，根据用户的训练周期数据生成精准的复盘报告。重点：识别进步亮点、指出结构性问题（如肌群失衡）、给出可执行的下阶段建议。只输出严格 JSON，不含任何额外文字。' },
          { role: 'user', content: prompt },
        ],
        model: 'qwen-turbo',
        temperature: 0.5,
        maxTokens: 500,
      });
    } catch (e) {
      logger.warn('Weekly summary AI failed:', e);
      aiResult = {
        summary: `${label}完成了 ${workouts.length} 次训练，总训练量 ${(totalVolume / 1000).toFixed(1)} 吨，状态不错！`,
        highlights: [`训练 ${workouts.length} 次`, `总量 ${(totalVolume / 1000).toFixed(1)} 吨`],
        nextWeekFocus: '继续保持训练节奏，注意各肌群均衡发展。',
      };
    }

    return NextResponse.json({
      ...aiResult,
      stats: {
        sessions: workouts.length,
        totalVolume: Math.round(totalVolume),
        totalSets,
        avgDuration: Math.round(totalDuration / workouts.length / 60),
      },
    });
  } catch (error) {
    logger.error('Weekly summary error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
