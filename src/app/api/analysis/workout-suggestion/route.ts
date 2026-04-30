import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
}

interface WorkoutSuggestion {
  muscleFocus: string;
  exercises: Exercise[];
  recommendationReason: string;
}

const getRecentSessions = async (userId: string, n: number = 3) => {
  return await prisma.workout.findMany({
    where: {
      userId,
    },
    include: {
      workoutSets: true,
    },
    orderBy: {
      date: 'desc',
    },
    take: n,
  });
};

const extractMuscleGroups = (sessions: any[]): Record<string, number> => {
  const muscleFrequency: Record<string, number> = {
    chest: 0,
    back: 0,
    legs: 0,
    shoulders: 0,
    arms: 0
  };

  sessions.forEach(session => {
    session.workoutSets.forEach((set: any) => {
      let muscleGroup: string | undefined;

      if (set.muscleGroup) {
        muscleGroup = set.muscleGroup.toLowerCase();
      } else {
        const exerciseName = set.exercise.toLowerCase();
        if (exerciseName.includes('chest') || exerciseName.includes('bench')) {
          muscleGroup = 'chest';
        } else if (exerciseName.includes('back') || exerciseName.includes('row')) {
          muscleGroup = 'back';
        } else if (exerciseName.includes('leg') || exerciseName.includes('squat')) {
          muscleGroup = 'legs';
        } else if (exerciseName.includes('shoulder') || exerciseName.includes('press')) {
          muscleGroup = 'shoulders';
        } else if (exerciseName.includes('arm') || exerciseName.includes('curl') || exerciseName.includes('tricep')) {
          muscleGroup = 'arms';
        }
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
        { id: '1', name: 'Barbell Bench Press', muscleGroup: 'chest' },
        { id: '2', name: 'Incline Dumbbell Press', muscleGroup: 'chest' },
        { id: '3', name: 'Chest Fly', muscleGroup: 'chest' },
        { id: '4', name: 'Push-ups', muscleGroup: 'chest' },
        { id: '5', name: 'Cable Crossover', muscleGroup: 'chest' },
        { id: '6', name: 'Dumbbell Pullover', muscleGroup: 'chest' },
      ],
      back: [
        { id: '1', name: 'Lat Pulldown', muscleGroup: 'back' },
        { id: '2', name: 'Barbell Row', muscleGroup: 'back' },
        { id: '3', name: 'Seated Row', muscleGroup: 'back' },
        { id: '4', name: 'Deadlift', muscleGroup: 'back' },
        { id: '5', name: 'Pull-ups', muscleGroup: 'back' },
        { id: '6', name: 'Dumbbell Row', muscleGroup: 'back' },
      ],
      legs: [
        { id: '1', name: 'Squat', muscleGroup: 'legs' },
        { id: '2', name: 'Deadlift', muscleGroup: 'legs' },
        { id: '3', name: 'Leg Press', muscleGroup: 'legs' },
        { id: '4', name: 'Leg Curl', muscleGroup: 'legs' },
        { id: '5', name: 'Calf Raise', muscleGroup: 'legs' },
        { id: '6', name: 'Lunges', muscleGroup: 'legs' },
      ],
      shoulders: [
        { id: '1', name: 'Overhead Press', muscleGroup: 'shoulders' },
        { id: '2', name: 'Lateral Raise', muscleGroup: 'shoulders' },
        { id: '3', name: 'Front Raise', muscleGroup: 'shoulders' },
        { id: '4', name: 'Face Pull', muscleGroup: 'shoulders' },
        { id: '5', name: 'Rear Delt Fly', muscleGroup: 'shoulders' },
        { id: '6', name: 'Shrug', muscleGroup: 'shoulders' },
      ],
      arms: [
        { id: '1', name: 'Bicep Curl', muscleGroup: 'arms' },
        { id: '2', name: 'Tricep Extension', muscleGroup: 'arms' },
        { id: '3', name: 'Hammer Curl', muscleGroup: 'arms' },
        { id: '4', name: 'Tricep Pushdown', muscleGroup: 'arms' },
        { id: '5', name: 'Preacher Curl', muscleGroup: 'arms' },
        { id: '6', name: 'Dip', muscleGroup: 'arms' },
      ],
    }[muscleGroup] || [];

    return defaultExercises.slice(0, 6);
  }

  return exercises.map(ex => ({
    id: ex.id,
    name: ex.name,
    muscleGroup: ex.muscleGroup.toLowerCase(),
  }));
};

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

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
        workoutSets: true,
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

    if (fatigueScore >= 10000) {
      const suggestion: WorkoutSuggestion = {
        muscleFocus: 'Rest Day',
        exercises: [],
        recommendationReason: `当前疲劳指数较高（${fatigueScore}）。建议充分休息后再进行训练，以达到最佳训练效果。`,
      };
      return NextResponse.json(suggestion);
    }

    const recentSessions = await getRecentSessions(userId);

    if (recentSessions.length > 0) {
      const lastWorkout = recentSessions[0];
      const lastWorkoutTime = new Date(lastWorkout.date).getTime();
      const now = Date.now();
      const hoursSinceLastWorkout = (now - lastWorkoutTime) / (1000 * 60 * 60);

      if (hoursSinceLastWorkout < 24) {
        const suggestion: WorkoutSuggestion = {
          muscleFocus: 'Rest Day',
          exercises: [],
          recommendationReason: `你训练后仅过了 ${Math.round(hoursSinceLastWorkout)} 小时。充分休息对肌肉恢复很重要！`,
        };
        return NextResponse.json(suggestion);
      }
    }

    const muscleFrequency = extractMuscleGroups(recentSessions);

    const leastTrainedMuscle = await getLeastTrainedMuscle(userId, muscleFrequency);

    const exercises = await generateWorkoutPlan(leastTrainedMuscle);

    let recommendationReason = '';
    if (Object.values(muscleFrequency).every(freq => freq === 0)) {
      recommendationReason = '你还没有最近的训练记录。让我们开始训练吧！';
    } else {
      recommendationReason = `今日建议：\n👉 ${leastTrainedMuscle.charAt(0).toUpperCase() + leastTrainedMuscle.slice(1)}\n原因：\n👉 本周训练不足`;
    }

    const suggestion: WorkoutSuggestion = {
      muscleFocus: leastTrainedMuscle.charAt(0).toUpperCase() + leastTrainedMuscle.slice(1) + ' Day',
      exercises: exercises.slice(0, 4),
      recommendationReason,
    };

    return NextResponse.json(suggestion);
  } catch (error) {
    logger.error('Error generating workout suggestion:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}