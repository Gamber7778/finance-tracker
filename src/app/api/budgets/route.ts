import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const budgets = await prisma.budget.findMany({
      include: { category: true },
    });
    return NextResponse.json(budgets);
  } catch (e) {
    console.error('GET /api/budgets error:', e);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const existing = await prisma.budget.findUnique({
      where: { categoryId: body.categoryId },
    });

    if (existing) {
      const budget = await prisma.budget.update({
        where: { id: existing.id },
        data: { amount: body.amount, period: body.period || 'monthly' },
        include: { category: true },
      });
      return NextResponse.json(budget);
    }

    const budget = await prisma.budget.create({
      data: {
        categoryId: body.categoryId,
        amount: body.amount,
        period: body.period || 'monthly',
      },
      include: { category: true },
    });
    return NextResponse.json(budget);
  } catch (e) {
    console.error('POST /api/budgets error:', e);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}
