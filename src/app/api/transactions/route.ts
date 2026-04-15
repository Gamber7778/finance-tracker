import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    include: { category: true },
  });
  return NextResponse.json(transactions);
}

export async function POST(req: Request) {
  const body = await req.json();
  const transaction = await prisma.transaction.create({
    data: {
      amount: body.amount,
      type: body.type,
      categoryId: body.categoryId,
      description: body.description || '',
      date: new Date(body.date),
    },
    include: { category: true },
  });
  return NextResponse.json(transaction);
}
