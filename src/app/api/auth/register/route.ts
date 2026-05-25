import { NextRequest, NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { logger } from "@/lib/logger"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "请填写所有字段" },
        { status: 400 }
      )
    }

    // 输入格式校验
    const trimmedEmail = String(email).trim().toLowerCase()
    const trimmedName = String(name).trim()

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      return NextResponse.json({ error: "邮箱格式不正确" }, { status: 400 })
    }

    if (trimmedName.length < 1 || trimmedName.length > 50) {
      return NextResponse.json({ error: "用户名长度需在1-50个字符之间" }, { status: 400 })
    }

    if (String(password).length < 6 || String(password).length > 128) {
      return NextResponse.json({ error: "密码长度需在6-128个字符之间" }, { status: 400 })
    }

    // 检查用户是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: trimmedEmail }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "该邮箱已被注册" },
        { status: 400 }
      )
    }

    // 加密密码
    const hashedPassword = await hash(password, 12)

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email: trimmedEmail,
        password: hashedPassword,
        name: trimmedName,
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      message: "注册成功"
    })
  } catch (error) {
    logger.error("注册失败:", error)
    return NextResponse.json(
      { error: "注册失败" },
      { status: 500 }
    )
  }
}
