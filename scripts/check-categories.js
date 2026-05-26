const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Weighted exercises incorrectly seeded as 'stretching'
const WRONG_CATEGORIES = [
  { name: '夹胸', fix: { category: 'isolation', muscleGroup: 'chest', equipment: 'Machine' } },
];

async function main() {
  for (const { name, fix } of WRONG_CATEGORIES) {
    const result = await prisma.exercise.updateMany({
      where: { name, category: 'stretching', isCustom: false },
      data: fix,
    });
    console.log(`Fixed '${name}': ${result.count} row(s) updated`);
  }
}
main().then(() => prisma.$disconnect());
