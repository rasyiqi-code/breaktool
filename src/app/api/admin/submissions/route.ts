import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const submissions = await prisma.toolSubmission.findMany({
      where: {
        status: 'pending'
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error in submissions API:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch submissions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
