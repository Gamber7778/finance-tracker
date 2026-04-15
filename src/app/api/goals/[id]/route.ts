import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (body.deadline) body.deadline = new Date(body.deadline);
    const goal = await prisma.goal.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(goal);
  } catch (e) {
    console.error('PUT /api/goals/[id] error:', e);
    return NextResponse.json({ error: 'Failed to update goal' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.goal.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/goals/[id] error:', e);
    return NextResponse.json({ error: 'Failed to delete goal' }, { status: 500 });
  }
}
