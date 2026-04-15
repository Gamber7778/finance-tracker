import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const accounts = await prisma.account.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json(accounts);
  } catch (e) {
    console.error('GET /api/accounts error:', e);
    return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const account = await prisma.account.create({
      data: {
        name: body.name,
        type: body.type || 'checking',
        icon: body.icon || 'Wallet',
        color: body.color || '#3b82f6',
        balance: body.balance || 0,
        includeInSpending: body.includeInSpending ?? true,
      },
    });
    return NextResponse.json(account);
  } catch (e) {
    console.error('POST /api/accounts error:', e);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
