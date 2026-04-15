import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    if (body.date) body.date = new Date(body.date);
    const transaction = await prisma.transaction.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(transaction);
  } catch (e) {
    console.error('PUT /api/transactions/[id] error:', e);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.transaction.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/transactions/[id] error:', e);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
