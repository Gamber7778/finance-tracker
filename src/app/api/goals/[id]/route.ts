import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  if (body.deadline) body.deadline = new Date(body.deadline);
  const goal = await prisma.goal.update({
    where: { id },
    data: body,
  });
  return NextResponse.json(goal);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.goal.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
