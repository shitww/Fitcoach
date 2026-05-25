import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';
import { completeJSON } from '@/lib/ai/orchestrator';
import { buildPlanPrompt } from '@/lib/ai/prompts/plan';
import type { PlanContext } from '@/lib/ai/prompts/plan';
import { calculate1RM } from '@/core/calc';

const SYSTEM = '你是专业运动科学教练AI，根据用户真实训练数据生成科学、个性化、可执行的周训练计划。只输出严格JSON，不含任何多余文字。';

const MUSCLE_CN: Record<string, string> = {
  chest: '胸部', back: '背部', legs: '腿部', shoulders: '肩部', arms: '手臂',
};

export async function POST(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { goal, daysPerWeek, level } = await request.json();

    const since28 = new Date(Date.now() - 28 * 86_400_000);
    const [workouts] = await Promise.all([
      prisma.workout.findMany({
        where: { userId, date: { gte: since28 } },
        include: { workoutSets: { where: { type: 'S' } } },
        orderBy: { date: 'desc' },
      }),
    ]);

    // Sets per muscle group over 28 days
    const muscleSetCounts: Record<string, number> = {
      chest: 0, back: 0, legs: 0, shoulders: 0, arms: 0,
    };
    workouts.forEach(w => {
      w.workoutSets.forEach(s => {
        const mg = s.muscleGroup?.toLowerCase();
        if (mg && muscleSetCounts[mg] !== undefined) muscleSetCounts[mg]++;
      });
    });

    // Weak muscles (bottom 2 by set count)
    const weakMuscleGroups = Object.entries(muscleSetCounts)
      .sort((a, b) => a[1] - b[1])
      .slice(0, 2)
      .map(([k]) => MUSCLE_CN[k] || k);

    // Sets/week (normalised over 4 weeks)
    const currentVolume: Record<string, number> = {};
    for (const [k, v] of Object.entries(muscleSetCounts)) {
      currentVolume[k] = Math.round(v / 4);
    }

    // Top-5 PRs from recent workouts
    const prMap: Record<string, { exercise: string; weight: number; reps: number; est: number }> = {};
    workouts.forEach(w => {
      w.workoutSets.forEach(s => {
        const est = calculate1RM(s.weight, s.reps);
        if (est > 0 && (!prMap[s.exercise] || est > prMap[s.exercise].est)) {
          prMap[s.exercise] = { exercise: s.exercise, weight: s.weight, reps: s.reps, est };
        }
      });
    });
    const recentPRs = Object.values(prMap)
      .sort((a, b) => b.est - a.est)
      .slice(0, 5)
      .map(({ exercise, weight, reps }) => ({ exercise, weight, reps }));

    const goalMap: Record<string, string> = {
      muscle: '增肌', strength: '力量提升', fat: '减脂塑形',
    };

    const ctx: PlanContext = {
      fitnessGoal: goalMap[goal] || '增肌',
      daysPerWeek: Math.max(2, Math.min(6, Number(daysPerWeek) || 3)),
      experienceLevel: (level as 'beginner' | 'intermediate' | 'advanced') || 'intermediate',
      weakMuscleGroups: workouts.length > 0 ? weakMuscleGroups : undefined,
      recentPRs: recentPRs.length > 0 ? recentPRs : undefined,
      currentVolume: workouts.length > 0 ? currentVolume : undefined,
    };

    const prompt = buildPlanPrompt(ctx);

    type AIPlan = {
      planName: string;
      overview: string;
      weeklyStructure: Array<{
        day: string;
        focus: string;
        exercises: Array<{ name: string; sets: number; reps: string; rest: string; notes: string }>;
      }>;
      progressionGuide: string;
      deloadRecommendation: string;
      warning: string;
    };

    const result = await completeJSON<AIPlan>({
      messages: [
        { role: 'system', content: SYSTEM },
        { role: 'user', content: prompt },
      ],
      model: 'qwen-plus',
      temperature: 0.7,
      maxTokens: 2000,
    });

    return NextResponse.json({ plan: result });
  } catch (err) {
    logger.error('[generate-plan]', err);
    return NextResponse.json({ error: '生成计划失败，请稍后重试' }, { status: 500 });
  }
}
