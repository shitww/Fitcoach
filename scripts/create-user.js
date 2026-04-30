const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

async function main() {
  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findUnique({ where: { email: '783002775@qq.com' } });
    if (existing) {
      console.log('User already exists, id:', existing.id);
      return;
    }
    const hash = await bcrypt.hash('123456', 10);
    const user = await prisma.user.create({
      data: {
        email: '783002775@qq.com',
        name: '谢嘉炜',
        password: hash,
      }
    });
    console.log('SUCCESS: Created user id=' + user.id + ' email=' + user.email);
  } catch (e) {
    console.error('ERROR:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
