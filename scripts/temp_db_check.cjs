const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const wsCount = await p.workoutSet.count();
  const exCount = await p.exercise.count();
  console.log('WorkoutSets:', wsCount, '| Exercises:', exCount);

  // Check unique exercise names in WorkoutSet
  const uniqueExercises = await p.workoutSet.findMany({
    select: { exercise: true },
    distinct: ['exercise'],
    take: 50,
  });
  console.log('\nUnique exercises in WorkoutSet (first 50):');
  uniqueExercises.forEach(r => console.log(' -', r.exercise));

  // Check Exercise table names
  const exerciseNames = await p.exercise.findMany({
    select: { name: true },
    take: 30,
  });
  console.log('\nExercises in Exercise table (first 30):');
  exerciseNames.forEach(r => console.log(' -', r.name));
}

main().finally(() => p.$disconnect());