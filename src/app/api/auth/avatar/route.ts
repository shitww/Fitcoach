import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('avatar') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // 验证文件类型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // 验证文件大小 (最大2MB)
    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // 生成文件名
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;

    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
    await mkdir(uploadDir, { recursive: true });

    // 保存文件
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // 更新用户头像URL
    const avatarUrl = `/uploads/avatars/${fileName}`;
    const updatedUser = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        avatar: avatarUrl
      }
    });

    return NextResponse.json({
      success: true,
      avatar: updatedUser.avatar
    });
  } catch (error) {
    logger.error('上传头像错误:', error);
    return NextResponse.json({ error: '上传失败' }, { status: 500 });
  }
}
