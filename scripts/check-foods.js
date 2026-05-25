const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
async function main() {
  const count = await p.food.count();
  console.log('Food count:', count);
  if (count > 0) {
    const samples = await p.food.findMany({ take: 5, select: { id: true, name: true, category: true, calories: true } });
    console.log('Samples:', JSON.stringify(samples, null, 2));
  }
  await p.$disconnect();
}
main().catch(e => { console.error(e); p.$disconnect(); });
