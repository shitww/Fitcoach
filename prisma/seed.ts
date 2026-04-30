import { hash } from "bcryptjs"
import { prisma } from "../lib/prisma"

async function main() {
  console.log("创建演示账号...")

  // 检查是否已存在
  const existing = await prisma.user.findUnique({
    where: { email: "demo@fitcoach.com" }
  })

  if (existing) {
    console.log("演示账号已存在")
    return
  }

  // 创建演示账号
  const hashedPassword = await hash("demo123", 12)
  
  await prisma.user.create({
    data: {
      email: "demo@fitcoach.com",
      password: hashedPassword,
      name: "演示用户",
    }
  })

  console.log("演示账号创建成功!")
  console.log("邮箱: demo@fitcoach.com")
  console.log("密码: demo123")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
