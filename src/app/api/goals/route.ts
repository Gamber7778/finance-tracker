import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const goals = await prisma.goal.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(goals);
  } catch (e) {
    console.error('GET /api/goals error:', e);
    return NextResponse.json({ error: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const goal = await prisma.goal.create({
      data: {
        name: body.name,
        targetAmount: body.targetAmount,
        currentAmount: body.currentAmount || 0,
        deadline: new Date(body.deadline),
        icon: body.icon || 'Target',
        color: body.color || '#3b82f6',
      },
    });
    return NextResponse.json(goal);
  } catch (e) {
    console.error('POST /api/goals error:', e);
    return NextResponse.json({ error: 'Failed to create goal' }, { status: 500 });
  }
}
