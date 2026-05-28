import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getDbUserId } from '@/lib/get-db-user';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// 生产环境：头像需写入对象存储（Supabase Storage），禁止使用本地文件系统。
// 显式指定 Node runtime，避免 Edge 环境缺少 Node 能力导致上传失败。
export const runtime = 'nodejs';

function encodePathPreserveSlashes(p: string) {
  return p.split('/').map(encodeURIComponent).join('/');
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = await getDbUserId();
    if (!userId) {
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
    const objectKey = `${userId}/${Date.now()}.${fileExt}`;

    const supabaseUrl = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      logger.error('Supabase Storage 未配置：缺少 SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }

    // 上传到 Supabase Storage（server-side only；bucket avatars 为 public read）
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadUrl = `${supabaseUrl}/storage/v1/object/avatars/${encodePathPreserveSlashes(objectKey)}`;
    const uploadRes = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${serviceRoleKey}`,
        apikey: serviceRoleKey,
        'content-type': file.type || 'application/octet-stream',
        'x-upsert': 'true',
      },
      body: buffer,
    });

    if (!uploadRes.ok) {
      const detail = await uploadRes.text().catch(() => '');
      logger.error('上传头像到 Supabase Storage 失败', {
        status: uploadRes.status,
        detail: detail?.slice(0, 500),
      });
      return NextResponse.json({ error: '上传失败' }, { status: 500 });
    }

    // 更新用户头像URL
    const avatarUrl = `${supabaseUrl}/storage/v1/object/public/avatars/${encodePathPreserveSlashes(objectKey)}`;
    const updatedUser = await prisma.user.update({
      where: {
        id: userId
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
