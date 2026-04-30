import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';

async function getDbUserId() {
  const session = await auth();
  const userEmail = session?.user?.email;
  if (!userEmail) return null;
  const user = await prisma.user.findUnique({ where: { email: userEmail } });
  return user?.id || null;
}

async function getPlan(id: string, userId: string) {
  return prisma.trainingPlan.findFirst({ where: { id, userId }, include: { days: { orderBy: { dayIndex: 'asc' } } } });
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const plan = await getPlan(id, userId);
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    return NextResponse.json({ plan });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const plan = await getPlan(id, userId);
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

    const body = await request.json();
    const { name, days } = body;

    // 删除旧的 days，重建
    if (days) {
      await prisma.planDay.deleteMany({ where: { planId: id } });
    }

    const updated = await prisma.trainingPlan.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(days ? {
          days: {
            create: days.map((day: any, index: number) => ({
              dayIndex: index,
              dayName: day.dayName || `第${index + 1}天`,
              exercises: JSON.stringify(day.exercises || [])
            }))
          }
        } : {})
      },
      include: { days: { orderBy: { dayIndex: 'asc' } } }
    });

    return NextResponse.json({ plan: updated });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getDbUserId();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { id } = await params;
    const plan = await getPlan(id, userId);
    if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    await prisma.trainingPlan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
