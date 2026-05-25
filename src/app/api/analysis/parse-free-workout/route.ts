import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';
import { completeJSON } from '@/lib/ai/orchestrator';

export interface FreeWorkoutMeta {
  parsed: true;
  muscleGroups: Array<'chest' | 'back' | 'legs' | 'shoulders' | 'arms' | 'abs' | 'cardio'>;
  trainingType: 'strength' | 'cardio' | 'stretching' | 'mixed' | 'recovery';
  keyExercises: string[];
  estimatedSets: number | null;
  intensityLevel: 'low' | 'moderate' | 'high';
}

async function callQwenParse(notes: string, durationMin: number): Promise<FreeWorkoutMeta> {
  const prompt = `用户训练记录（时长约 ${durationMin} 分钟）：
"${notes}"

从上述文字中提取训练结构信息。

规则：
- muscleGroups 只能从 ["chest","back","legs","shoulders","arms","abs","cardio"] 中选，可多选
- trainingType: strength(有器械/重量) | cardio(跑步/骑行等) | stretching(拉伸/瑜伽) | mixed(多类型) | recovery(康复/放松)
- keyExercises: 原文提取动作名，最多5个，没有则空数组
- estimatedSets: 估算总组数，无法判断则null
- intensityLevel: low(拉伸/放松) | moderate(一般训练) | high(高强度/大重量)

严格JSON，不含其他文字：
{"muscleGroups":[],"trainingType":"","keyExercises":[],"estimatedSets":null,"intensityLevel":""}`;

  const parsed = await completeJSON<{
    muscleGroups?: string[];
    trainingType?: string;
    keyExercises?: string[];
    estimatedSets?: number | null;
    intensityLevel?: string;
  }>({
    messages: [
      { role: 'system', content: '你是运动数据提取助手，只输出严格JSON，不含任何解释文字。' },
      { role: 'user', content: prompt },
    ],
    model: 'qwen-turbo',
    temperature: 0.1,
    maxTokens: 120,
  });

  return {
    parsed: true,
    muscleGroups: Array.isArray(parsed.muscleGroups) ? parsed.muscleGroups as FreeWorkoutMeta['muscleGroups'] : [],
    trainingType: (parsed.trainingType as FreeWorkoutMeta['trainingType']) || 'mixed',
    keyExercises: Array.isArray(parsed.keyExercises) ? parsed.keyExercises.slice(0, 5) : [],
    estimatedSets: typeof parsed.estimatedSets === 'number' ? parsed.estimatedSets : null,
    intensityLevel: (parsed.intensityLevel as FreeWorkoutMeta['intensityLevel']) || 'moderate',
  };
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { workoutId } = await request.json();
    if (!workoutId) return NextResponse.json({ error: 'Missing workoutId' }, { status: 400 });

    // Verify ownership and get notes
    const workout = await prisma.workout.findFirst({
      where: { id: workoutId, userId },
      select: { id: true, notes: true, duration: true },
    });
    if (!workout) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (!workout.notes?.trim()) return NextResponse.json({ error: 'No notes to parse' }, { status: 400 });

    const durationMin = Math.round((workout.duration ?? 0) / 60);
    const meta = await callQwenParse(workout.notes, durationMin);

    await prisma.workout.update({
      where: { id: workoutId },
      data: { metadata: JSON.stringify(meta) },
    });

    logger.info(`[parse-free-workout] workoutId=${workoutId} muscleGroups=${meta.muscleGroups.join(',')}`);
    return NextResponse.json({ success: true, meta });
  } catch (err) {
    logger.error('[parse-free-workout]', err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
