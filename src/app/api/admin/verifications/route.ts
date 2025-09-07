import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const verificationRequests = await prisma.verificationRequest.findMany({
      where: {
        status: 'pending'
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json(verificationRequests);
  } catch (error) {
    console.error('Error in verifications API:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch verification requests',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
