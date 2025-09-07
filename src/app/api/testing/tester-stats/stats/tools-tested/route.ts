import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Count unique tools that have been reviewed
    const count = await prisma.review.groupBy({
      by: ['toolId'],
      _count: {
        toolId: true
      }
    });

    return NextResponse.json({ count: count.length });
  } catch (error) {
    console.error('Error fetching tools tested:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
