import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { transactions: true } } },
  });
  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const body = await req.json();
  const category = await prisma.category.create({
    data: {
      name: body.name,
      icon: body.icon,
      type: body.type,
      color: body.color,
    },
  });
  return NextResponse.json(category);
}
