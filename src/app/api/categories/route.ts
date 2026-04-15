import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (e) {
    console.error('GET /api/categories error:', e);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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
  } catch (e) {
    console.error('POST /api/categories error:', e);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}
