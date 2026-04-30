import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ user: null });
    }

    // 从数据库获取完整的用户信息
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        age: true,
        gender: true,
        bio: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      user: dbUser
    });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    logger.info('收到的更新数据:', body);
    const { name, email, age, gender, bio, avatar } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name || null;
    if (email !== undefined) updateData.email = email || null;
    if (age !== undefined) updateData.age = age ? parseInt(String(age)) : null;
    if (gender !== undefined) updateData.gender = gender || null;
    if (bio !== undefined) updateData.bio = bio || null;
    if (avatar !== undefined) updateData.avatar = avatar || null;

    logger.info('准备更新数据库:', updateData);

    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: updateData
    });

    return NextResponse.json({
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        age: updatedUser.age,
        gender: updatedUser.gender,
        bio: updatedUser.bio,
        avatar: updatedUser.avatar
      }
    });
  } catch (error) {
    logger.error('更新用户信息错误:', error);
    return NextResponse.json({ 
      error: '更新失败',
      details: process.env.NODE_ENV === 'development' ? String(error) : '请联系管理员'
    }, { status: 500 });
  }
}
