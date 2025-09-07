import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const count = await prisma.testingTask.count({
      where: {
        status: 'completed'
      }
    });

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching completed tests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
