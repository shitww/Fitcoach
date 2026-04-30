import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

async function getExerciseMaxWeight(userId: string, exerciseName: string): Promise<number> {
  const result = await prisma.workoutSet.findFirst({
    where: {
      exercise: exerciseName,
      type: "S",
      workout: {
        userId: userId
      }
    },
    orderBy: {
      weight: "desc"
    },
    select: {
      weight: true
    }
  });
  return result?.weight || 0;
}

async function detectAndMarkPRs(
  userId: string,
  exercises: Array<{
    name: string;
    sets: Array<{ weight: number; reps: number; rir: number }>;
  }>
): Promise<Array<{ exerciseName: string; weight: number; reps: number; previousMax: number }>> {
  const newPRs: Array<{ exerciseName: string; weight: number; reps: number; previousMax: number }> = [];

  for (const exercise of exercises) {
    const previousMax = await getExerciseMaxWeight(userId, exercise.name);

    for (const set of exercise.sets) {
      if (set.weight > previousMax) {
        newPRs.push({
          exerciseName: exercise.name,
          weight: set.weight,
          reps: set.reps,
          previousMax: previousMax,
        });
        break;
      }
    }
  }

  return newPRs;
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { exercises, totalVolume, duration, notes } = data;

    if (!exercises || exercises.length === 0) {
      return NextResponse.json({ error: 'No exercises provided' }, { status: 400 });
    }

    const detectedPRs = await detectAndMarkPRs(session.user.id, exercises);

    const prSet = new Set(
      detectedPRs.map((pr) => `${pr.exerciseName}-${pr.weight}`)
    );

    const muscleGroups = Array.from(
      new Set(exercises.map((exercise: any) => exercise.muscleGroup).filter(Boolean))
    ).join(',');

    let setNumber = 1;
    const workoutSetsData = exercises.flatMap((exercise: any) =>
      exercise.sets.map((set: any, index: number) => ({
        exercise: exercise.name,
        muscleGroup: exercise.muscleGroup || '',
        type: set.isWarmup ? "W" : "S",
        setNumber: setNumber++,
        weight: set.weight,
        reps: set.reps,
        rir: set.rir,
        isPR: prSet.has(`${exercise.name}-${set.weight}`),
      }))
    );

    const workout = await prisma.workout.create({
      data: {
        userId: session.user.id,
        date: new Date(),
        duration: duration || 0,
        notes: notes || '',
        totalVolume: totalVolume || 0,
        workoutSets: {
          create: workoutSetsData,
        },
      },
      include: {
        workoutSets: true,
      },
    });

    return NextResponse.json(
      {
        ...workout,
        newPRs: detectedPRs,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("❌ REAL ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const limit = parseInt(searchParams.get("limit") || "10");

    if (id) {
      // Single workout by ID
      const workout = await prisma.workout.findUnique({
        where: {
          id: id,
          userId: session.user.id
        },
        include: {
          workoutSets: true
        }
      });

      if (!workout) {
        return NextResponse.json({ error: 'Workout not found' }, { status: 404 });
      }

      const exerciseMap = new Map<string, any>();
      workout.workoutSets.forEach(set => {
        if (!exerciseMap.has(set.exercise)) {
          exerciseMap.set(set.exercise, {
            id: set.id,
            name: set.exercise,
            muscleGroup: set.muscleGroup,
            sets: []
          });
        }
        exerciseMap.get(set.exercise).sets.push({
          weight: set.weight,
          reps: set.reps,
          rir: set.rir ?? 0,
          isFailure: set.rir === 0,
          isPR: set.isPR,
          setNumber: set.setNumber,
        });
      });

      const transformedWorkout = {
        id: workout.id,
        exercises: Array.from(exerciseMap.values()),
        totalVolume: workout.totalVolume,
        duration: workout.duration || 0,
        date: workout.date,
        notes: workout.notes
      };

      return NextResponse.json({ data: transformedWorkout });
    } else {
      // Workout list
      const [workouts, total] = await Promise.all([
        prisma.workout.findMany({
          where: { userId: session.user.id },
          orderBy: { date: 'desc' },
          take: limit,
          include: {
            workoutSets: true
          }
        }),
        prisma.workout.count({
          where: { userId: session.user.id }
        })
      ]);

      const transformedWorkouts = workouts.map(workout => {
        const exerciseMap = new Map<string, any>();
        workout.workoutSets.forEach(set => {
          if (!exerciseMap.has(set.exercise)) {
            exerciseMap.set(set.exercise, {
              id: set.id,
              name: set.exercise,
              muscleGroup: set.muscleGroup,
              sets: []
            });
          }
          exerciseMap.get(set.exercise).sets.push({
            weight: set.weight,
            reps: set.reps,
            rir: set.rir ?? 0,
            isFailure: set.rir === 0,
            isPR: set.isPR,
            setNumber: set.setNumber,
          });
        });

        return {
          id: workout.id,
          exercises: Array.from(exerciseMap.values()),
          totalVolume: workout.totalVolume,
          duration: workout.duration || 0,
          date: workout.date,
          notes: workout.notes
        };
      });

      return NextResponse.json({ data: transformedWorkouts, total });
    }
  } catch (error) {
    logger.error("❌ REAL ERROR:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}