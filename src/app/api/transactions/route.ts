import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(transactions);
  } catch (e) {
    console.error('GET /api/transactions error:', e);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, amount, accountId, toAccountId, categoryId, description, date, tags } = body;

    const transaction = await prisma.$transaction(async (tx) => {
      const t = await tx.transaction.create({
        data: {
          amount,
          type,
          categoryId: categoryId || null,
          description: description || '',
          tags: Array.isArray(tags) ? tags : [],
          date: new Date(date),
          accountId: accountId || null,
          toAccountId: toAccountId || null,
        },
      });

      if (accountId) {
        if (type === 'income' || type === 'adjustment') {
          await tx.account.update({
            where: { id: accountId },
            data: { balance: { increment: amount } },
          });
        } else if (type === 'expense') {
          await tx.account.update({
            where: { id: accountId },
            data: { balance: { decrement: amount } },
          });
        } else if (type === 'transfer' && toAccountId) {
          await tx.account.update({
            where: { id: accountId },
            data: { balance: { decrement: amount } },
          });
          await tx.account.update({
            where: { id: toAccountId },
            data: { balance: { increment: amount } },
          });
        }
      }

      return t;
    });

    return NextResponse.json(transaction);
  } catch (e) {
    console.error('POST /api/transactions error:', e);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
