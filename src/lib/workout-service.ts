import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { detectNewPRs } from '@/lib/workout-pr';
import { workoutDbToSummary, type WorkoutSummaryDto } from '@/lib/workout-summary';

// ─── 共用类型 ────────────────────────────────────────────
export type IncomingSet = {
  weight?: number;
  reps?: number;
  rir?: number;
  isWarmup?: boolean;
  isCardio?: boolean;
  isFailure?: boolean;
  isPR?: boolean;
};

export type IncomingExercise = {
  exerciseName?: string;
  name?: string;
  muscleGroup?: string;
  sets?: IncomingSet[];
};

// ─── 创建训练记录 ─────────────────────────────────────────
export async function createWorkout(
  userId: string,
  opts: {
    exercises: IncomingExercise[];
    date?: string;
    duration?: number;
    notes?: string;
    totalVolume?: number;
  }
) {
  const { exercises, date, duration, notes, totalVolume: clientVolume } = opts;

  const isFreeRecord = (!exercises || exercises.length === 0) && !!notes?.trim();
  if (!exercises || exercises.length === 0) {
    if (!isFreeRecord) throw new WorkoutValidationError('No exercises provided');
  }

  // Input validation: reject negative/NaN weight and reps
  for (const ex of exercises || []) {
    for (const set of ex.sets || []) {
      const w = Number(set.weight);
      const r = Number(set.reps);
      if (isNaN(w) || w < 0) throw new WorkoutValidationError(`Invalid weight: ${set.weight}`);
      if (isNaN(r) || r < 0) throw new WorkoutValidationError(`Invalid reps: ${set.reps}`);
    }
  }

  const parsedExercises = exercises;

  // PR 检测
  const exercisesForPR = parsedExercises
    .map(ex => ({
      name: ex.exerciseName || ex.name || '',
      sets: (ex.sets || []).map(set => ({
        weight: Number(set.weight) || 0,
        reps: Number(set.reps) || 0,
        rir: Number(set.rir) || 0,
      })),
    }))
    .filter(ex => ex.name);

  const detectedPRs = await detectNewPRs(userId, exercisesForPR);
  const prSet = new Set(detectedPRs.map(pr => `${pr.exerciseName}-${pr.weight}`));

  // 解析 exercise → exerciseId 映射
  const uniqueNames = [
    ...new Set(
      parsedExercises
        .map(ex => ex.exerciseName || ex.name || '')
        .filter(Boolean)
    ),
  ];

  // Fix: build name→muscleGroup map from incoming data so we don't hardcode 'chest'
  const nameToMuscleGroup = new Map<string, string>();
  for (const ex of parsedExercises) {
    const n = ex.exerciseName || ex.name || '';
    if (n && !nameToMuscleGroup.has(n)) {
      nameToMuscleGroup.set(n, ex.muscleGroup || '');
    }
  }

  // Fix: single batch findMany instead of N serial findFirst calls
  const existingExercises = uniqueNames.length > 0
    ? await prisma.exercise.findMany({
        where: { name: { in: uniqueNames } },
        select: { id: true, name: true },
      })
    : [];

  const nameToId = new Map<string, string>(
    existingExercises.map(e => [e.name, e.id])
  );

  // Create only the exercises not yet in DB, using the real muscleGroup from incoming data
  const missingNames = uniqueNames.filter(n => !nameToId.has(n));
  for (const name of missingNames) {
    const rawMuscleGroup = nameToMuscleGroup.get(name) || '';
    const created = await prisma.exercise.create({
      data: {
        name,
        muscleGroup: rawMuscleGroup || 'other',
        category: '力量',
        userId,
        isCustom: true,
      },
      select: { id: true },
    });
    nameToId.set(name, created.id);
  }

  // 构建 WorkoutSet 数据
  let computedVolume = 0;
  const workoutSetsData = parsedExercises.flatMap(ex => {
    const sets = ex.sets || [];
    const exName = ex.exerciseName || ex.name || '';
    const exerciseId = nameToId.get(exName) ?? null;
    let exerciseSetNumber = 1;

    return sets.map(set => {
      const w = Number(set.weight) || 0;
      const r = Number(set.reps) || 0;
      computedVolume += w * r;
      return {
        exercise: exName,
        exerciseId,
        muscleGroup: ex.muscleGroup || '',
        type: set.isWarmup ? 'W' : set.isCardio ? 'C' : 'S',
        setNumber: exerciseSetNumber++,
        weight: w,
        reps: r,
        rir: set.rir ?? 0,
        isFailure:
          typeof set.isFailure === 'boolean'
            ? set.isFailure
            : Number(set.rir ?? 0) === 0,
        isPR: prSet.has(`${exName}-${w}`),
      };
    });
  });

  const finalVolume = clientVolume ?? computedVolume;

  logger.info(
    '[WorkoutService] Creating workout with',
    workoutSetsData.length,
    'sets, totalVolume:',
    finalVolume
  );

  const workout = await prisma.workout.create({
    data: {
      userId,
      date: date ? new Date(date) : new Date(),
      duration: Number(duration) || 0,
      notes: notes || '',
      totalVolume: finalVolume,
      workoutSets: { create: workoutSetsData },
    },
    include: { workoutSets: true },
  });

  return { workout, newPRs: detectedPRs };
}

// ─── 查询训练列表 ─────────────────────────────────────────
export async function listWorkouts(
  userId: string,
  opts: { limit?: number; offset?: number }
): Promise<{ data: WorkoutSummaryDto[]; meta: { total: number; limit: number; offset: number } }> {
  const limit = opts.limit ?? 10;
  const offset = opts.offset ?? 0;

  const [workouts, total] = await Promise.all([
    prisma.workout.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: limit,
      skip: offset,
      include: { workoutSets: true },
    }),
    prisma.workout.count({ where: { userId } }),
  ]);

  return {
    data: workouts.map(w => workoutDbToSummary(w)),
    meta: { total, limit, offset },
  };
}

// ─── 查询单个训练 ─────────────────────────────────────────
export async function getWorkoutById(
  userId: string,
  workoutId: string
): Promise<WorkoutSummaryDto | null> {
  const workout = await prisma.workout.findFirst({
    where: { id: workoutId, userId },
    include: { workoutSets: true },
  });

  if (!workout) return null;
  return workoutDbToSummary(workout);
}

// ─── 全量替换训练记录（编辑页用） ───────────────────────────
export async function replaceWorkout(
  userId: string,
  workoutId: string,
  opts: {
    date: string;
    duration: number;
    notes?: string;
    exercises: IncomingExercise[];
  }
): Promise<WorkoutSummaryDto> {
  const { date, duration, notes, exercises } = opts;

  const existing = await prisma.workout.findFirst({ where: { id: workoutId, userId } });
  if (!existing) throw new Error('Workout not found');

  let totalVolume = 0;
  const workoutSetsData = (exercises || []).flatMap(ex => {
    const exName = ex.exerciseName || ex.name || '';
    let exerciseSetNumber = 1;
    return (ex.sets || []).map(set => {
      const w = Number(set.weight) || 0;
      const r = Number(set.reps) || 0;
      totalVolume += w * r;
      return {
        exercise: exName,
        muscleGroup: ex.muscleGroup || '',
        type: set.isWarmup ? 'W' : set.isCardio ? 'C' : 'S',
        setNumber: exerciseSetNumber++,
        weight: w,
        reps: r,
        rir: set.rir ?? 0,
        isFailure:
          typeof set.isFailure === 'boolean'
            ? set.isFailure
            : Number(set.rir ?? 0) === 0,
        isPR: !!set.isPR,
      };
    });
  });

  await prisma.workoutSet.deleteMany({ where: { workoutId } });
  const updated = await prisma.workout.update({
    where: { id: workoutId },
    data: {
      date: new Date(date),
      duration: Number(duration) || 0,
      notes: notes || '',
      totalVolume,
      workoutSets: { create: workoutSetsData },
    },
    include: { workoutSets: true },
  });

  return workoutDbToSummary(updated);
}

// ─── 校验异常 ─────────────────────────────────────────────
export class WorkoutValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkoutValidationError';
  }
}
