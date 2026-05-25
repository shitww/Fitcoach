import { NextRequest, NextResponse } from 'next/server';
import { compare, hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getDbUserId } from '@/lib/get-db-user';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const userId = await getDbUserId();
    if (!userId) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: '请填写当前密码和新密码' }, { status: 400 });
    }

    if (String(newPassword).length < 6) {
      return NextResponse.json({ error: '新密码长度至少6位' }, { status: 400 });
    }

    if (String(newPassword).length > 128) {
      return NextResponse.json({ error: '新密码长度不能超过128位' }, { status: 400 });
    }

    // 获取用户当前密码哈希
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json({ error: '用户不存在' }, { status: 404 });
    }

    // 验证当前密码
    const isValid = await compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: '当前密码不正确' }, { status: 400 });
    }

    // 哈希新密码并更新
    const hashedPassword = await hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    logger.info(`[change-password] User ${userId} changed password`);
    return NextResponse.json({ message: '密码修改成功' });
  } catch (error) {
    logger.error('POST /api/auth/change-password error:', error);
    return NextResponse.json({ error: '修改密码失败，请稍后重试' }, { status: 500 });
  }
}
