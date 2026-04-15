import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const hasDbUrl = !!process.env.DATABASE_URL;
  const dbUrlPrefix = process.env.DATABASE_URL
    ? process.env.DATABASE_URL.substring(0, 30) + '...'
    : 'NOT SET';

  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', hasDbUrl, dbUrlPrefix });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    console.error('Health check failed:', e);
    return NextResponse.json(
      { status: 'error', hasDbUrl, dbUrlPrefix, message },
      { status: 503 }
    );
  }
}
