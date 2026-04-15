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
    const transaction = await prisma.transaction.create({
      data: {
        amount: body.amount,
        type: body.type,
        categoryId: body.categoryId,
        description: body.description || '',
        date: new Date(body.date),
      },
    });
    return NextResponse.json(transaction);
  } catch (e) {
    console.error('POST /api/transactions error:', e);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
}
