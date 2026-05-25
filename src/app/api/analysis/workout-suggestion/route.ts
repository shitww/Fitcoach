import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

import { completeJSON } from '@/lib/ai/orchestrator';

const SUGGESTION_SYSTEM = '你是专业私人健身教练AI。根据用户真实训练历史数据，给出个性化、具体、有实用价值的今日训练推荐。结合用户的肌群训练频率、上次训练内容、恢复时间等因素。只输出严格JSON，不含任何多余文字。';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface ExercisePlan {
  name: string;
  sets: number;
  reps: string;
  tip: string;
}

interface WorkoutSuggestion {
  muscleFocus: string;
  exercises: Exercise[];
  recommendationReason: string;
  aiPlan?: ExercisePlan[];
}

const workoutSetsInclude = {
  include: {
    exerciseRel: { select: { muscleGroup: true } },
  },
} as const;

const getRecentSessions = async (userId: string, n: number = 3) => {
  return await prisma.workout.findMany({
    where: { userId },
    include: {
      workoutSets: workoutSetsInclude,
    },
    orderBy: { date: 'desc' },
    take: n,
  });
};

/** 从训练记录中提取各肌群训练频次。优先使用 FK exerciseRel，兜底 set.muscleGroup */
const extractMuscleGroups = (sessions: any[]): Record<string, number> => {
  const muscleFrequency: Record<string, number> = {
    chest: 0, back: 0, legs: 0, shoulders: 0, arms: 0,
  };

  sessions.forEach(session => {
    session.workoutSets.forEach((set: any) => {
      // 优先: FK exerciseRel → Exercise.muscleGroup（最准确）
      let muscleGroup = set.exerciseRel?.muscleGroup?.toLowerCase();
      // 兜底: WorkoutSet.muscleGroup（训练时写入）
      if (!muscleGroup && set.muscleGroup) {
        muscleGroup = set.muscleGroup.toLowerCase();
      }

      if (muscleGroup && muscleFrequency[muscleGroup] !== undefined) {
        muscleFrequency[muscleGroup]++;
      }
    });
  });

  return muscleFrequency;
};

const getLeastTrainedMuscle = async (userId: string, muscleFrequency: Record<string, number>) => {
  const allMuscleGroups = ['chest', 'back', 'legs', 'shoulders', 'arms'];

  let leastTrained = allMuscleGroups[0];
  let minFrequency = muscleFrequency[leastTrained];

  allMuscleGroups.forEach(group => {
    if (muscleFrequency[group] < minFrequency) {
      minFrequency = muscleFrequency[group];
      leastTrained = group;
    }
  });

  return leastTrained;
};

const generateWorkoutPlan = async (muscleGroup: string): Promise<Exercise[]> => {
  const exercises = await prisma.exercise.findMany({
    where: {
      muscleGroup: muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1),
    },
    take: 6,
  });

  if (exercises.length < 4) {
    const defaultExercises: Exercise[] = {
      chest: [
        { id: '1', name: '杠铃卧推', muscleGroup: 'chest' },
        { id: '2', name: '上斜哑铃卧推', muscleGroup: 'chest' },
        { id: '3', name: '哑铃飞鸟', muscleGroup: 'chest' },
        { id: '4', name: '俯卧撑', muscleGroup: 'chest' },
        { id: '5', name: '绳索夹胸', muscleGroup: 'chest' },
        { id: '6', name: '哑铃仰卧臂屈伸', muscleGroup: 'chest' },
      ],
      back: [
        { id: '1', name: '高位下拉', muscleGroup: 'back' },
        { id: '2', name: '杠铃划船', muscleGroup: 'back' },
        { id: '3', name: '坐姿划船', muscleGroup: 'back' },
        { id: '4', name: '硬拉', muscleGroup: 'back' },
        { id: '5', name: '引体向上', muscleGroup: 'back' },
        { id: '6', name: '哑铃划船', muscleGroup: 'back' },
      ],
      legs: [
        { id: '1', name: '杠铃深蹲', muscleGroup: 'legs' },
        { id: '2', name: '硬拉', muscleGroup: 'legs' },
        { id: '3', name: '腿举', muscleGroup: 'legs' },
        { id: '4', name: '腿弯举', muscleGroup: 'legs' },
        { id: '5', name: '提踵', muscleGroup: 'legs' },
        { id: '6', name: '弓步蹲', muscleGroup: 'legs' },
      ],
      shoulders: [
        { id: '1', name: '肩推', muscleGroup: 'shoulders' },
        { id: '2', name: '侧平举', muscleGroup: 'shoulders' },
        { id: '3', name: '前平举', muscleGroup: 'shoulders' },
        { id: '4', name: '面拉', muscleGroup: 'shoulders' },
        { id: '5', name: '俯身飞鸟', muscleGroup: 'shoulders' },
        { id: '6', name: '耸肩', muscleGroup: 'shoulders' },
      ],
      arms: [
        { id: '1', name: '二头弯举', muscleGroup: 'arms' },
        { id: '2', name: '三头臂屈伸', muscleGroup: 'arms' },
        { id: '3', name: '锤式弯举', muscleGroup: 'arms' },
        { id: '4', name: '绳索下压', muscleGroup: 'arms' },
        { id: '5', name: '牧师弯举', muscleGroup: 'arms' },
        { id: '6', name: '双杠臂屈伸', muscleGroup: 'arms' },
      ],
    }[muscleGroup] || [];

    return defaultExercises.slice(0, 6);
  }

  return exercises.map(ex => ({
    id: ex.id,
    name: ex.alias || ex.name,
    muscleGroup: ex.muscleGroup.toLowerCase(),
  }));
};

export async function GET(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recentWorkouts = await prisma.workout.findMany({
      where: {
        userId,
        date: {
          gte: threeDaysAgo,
        },
      },
      include: {
        workoutSets: workoutSetsInclude,
      },
      orderBy: {
        date: 'desc',
      },
    });

    let todayVolume = 0;
    let recentVolume = 0;

    recentWorkouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      workoutDate.setHours(0, 0, 0, 0);

      let workoutVolume = 0;
      workout.workoutSets.forEach(set => {
        workoutVolume += set.weight * set.reps;
      });

      if (workoutDate.getTime() === today.getTime()) {
        todayVolume = workoutVolume;
      }
      recentVolume += workoutVolume;
    });

    const fatigueScore = Math.round((recentVolume * 0.5) + todayVolume);
    const recentSessions = await getRecentSessions(userId);

    const muscleGroupCN: Record<string, string> = {
      chest: '胸部', back: '背部', legs: '腿部', shoulders: '肩部', arms: '手臂',
    };

    // Build full history context for Qwen
    const isNewUser = recentSessions.length === 0;
    const hoursSinceLast = recentSessions.length > 0
      ? (Date.now() - new Date(recentSessions[0].date).getTime()) / 3600000
      : null;
    const needsRest = fatigueScore >= 10000 || (hoursSinceLast !== null && hoursSinceLast < 24);

    const historyLines = recentSessions.map((w, i) => {
      const dateStr = new Date(w.date).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' });
      const sets = w.workoutSets.slice(0, 12);
      const exMap: Record<string, { maxW: number; reps: number }> = {};
      sets.forEach((s: any) => {
        const key = s.exercise;
        if (!exMap[key]) exMap[key] = { maxW: 0, reps: 0 };
        exMap[key].maxW = Math.max(exMap[key].maxW, s.weight);
        exMap[key].reps += s.reps;
      });
      const detail = Object.entries(exMap)
        .map(([name, d]) => `${name}(最大${d.maxW}kg)`)
        .join('、') || '（自由训练）';
      return `  ${i + 1}. ${dateStr}：${detail}，时长${Math.round((w.duration ?? 0) / 60)}分钟`;
    }).join('\n');

    const muscleFrequency = extractMuscleGroups(recentSessions);
    const leastTrainedMuscle = await getLeastTrainedMuscle(userId, muscleFrequency);
    const exercises = await generateWorkoutPlan(leastTrainedMuscle);
    const focusCN = muscleGroupCN[leastTrainedMuscle] || leastTrainedMuscle;
    const selectedExercises = exercises.slice(0, 4);
    const exerciseNames = selectedExercises.map(e => e.name).join('、');

    const freqDesc = Object.entries(muscleFrequency)
      .map(([k, v]) => `${muscleGroupCN[k] || k}:${v}组`)
      .join('、');

    let prompt: string;
    if (isNewUser) {
      prompt = `这是一位新用户，还没有训练记录。请为他推荐一个适合初学者的入门训练计划（${focusCN}方向），动作：${exerciseNames}。
输出严格JSON：{"reason":"2句激励性欢迎语+推荐理由","plan":[{"name":"动作名","sets":3,"reps":"10-12","tip":"动作要点1句"}]}`;
    } else if (needsRest) {
      const hoursText = hoursSinceLast !== null ? `上次训练距今${Math.round(hoursSinceLast)}小时` : '近期训练量较大';
      prompt = `用户近期训练记录：\n${historyLines}\n\n${hoursText}，疲劳指数${fatigueScore}。请给出恢复建议。
输出严格JSON：{"reason":"1-2句说明为何需要休息并给出恢复建议","plan":[]}`;
    } else {
      prompt = `用户近期训练记录：
${historyLines}

各肌群训练频次：${freqDesc}
今日推荐重点：${focusCN}（训练最少的肌群）
推荐动作：${exerciseNames}

请根据以上真实训练数据，输出严格JSON（不含其他文字）：
{"reason":"2-3句个性化推荐理由，引用具体训练数据","plan":[{"name":"动作名","sets":4,"reps":"8-10","tip":"针对该用户的具体动作要点"}]}`;
    }

    let recommendationReason = '';
    let aiPlan: ExercisePlan[] | undefined;

    try {
      const parsed = await completeJSON<{ reason?: string; plan?: ExercisePlan[] }>({
        messages: [
          { role: 'system', content: SUGGESTION_SYSTEM },
          { role: 'user', content: prompt },
        ],
        model: 'qwen-turbo',
        temperature: 0.7,
        maxTokens: 600,
      });
      recommendationReason = parsed.reason || `建议今天训练${focusCN}。`;
      if (Array.isArray(parsed.plan)) aiPlan = parsed.plan;
    } catch {
      recommendationReason = isNewUser
        ? '欢迎开始你的健身之旅！推荐从基础动作开始，循序渐进。'
        : needsRest
        ? '近期训练量较大，建议今天安排主动恢复或充分休息。'
        : `${focusCN}近期训练较少，建议今天重点加强，平衡肌群发展。`;
    }

    const suggestion: WorkoutSuggestion = {
      muscleFocus: needsRest ? '休息恢复' : `${focusCN}日`,
      exercises: needsRest ? [] : selectedExercises,
      recommendationReason,
      aiPlan,
    };

    return NextResponse.json(suggestion);
  } catch (error) {
    logger.error('Error generating workout suggestion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}