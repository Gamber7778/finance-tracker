import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const account = await prisma.account.update({
      where: { id },
      data: body,
    });
    return NextResponse.json(account);
  } catch (e) {
    console.error('PUT /api/accounts/[id] error:', e);
    return NextResponse.json({ error: 'Failed to update account' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.account.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/accounts/[id] error:', e);
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
