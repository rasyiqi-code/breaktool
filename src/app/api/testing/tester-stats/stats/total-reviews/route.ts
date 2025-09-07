import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const count = await prisma.review.count({
      where: {
        type: 'community' // Community reviews
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching total reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
