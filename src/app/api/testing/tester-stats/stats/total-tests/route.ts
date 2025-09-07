import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const count = await prisma.testingReport.count();

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching total tests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
