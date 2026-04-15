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

    await prisma.$transaction(async (tx) => {
      const t = await tx.transaction.findUnique({ where: { id } });
      if (!t) return;

      if (t.accountId) {
        if (t.type === 'income' || t.type === 'adjustment') {
          await tx.account.update({
            where: { id: t.accountId },
            data: { balance: { decrement: t.amount } },
          });
        } else if (t.type === 'expense') {
          await tx.account.update({
            where: { id: t.accountId },
            data: { balance: { increment: t.amount } },
          });
        } else if (t.type === 'transfer' && t.toAccountId) {
          await tx.account.update({
            where: { id: t.accountId },
            data: { balance: { increment: t.amount } },
          });
          await tx.account.update({
            where: { id: t.toAccountId },
            data: { balance: { decrement: t.amount } },
          });
        }
      }

      await tx.transaction.delete({ where: { id } });
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('DELETE /api/transactions/[id] error:', e);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
}
