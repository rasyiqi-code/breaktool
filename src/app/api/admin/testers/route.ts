import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const testers = await prisma.user.findMany({
      where: {
        OR: [
          { isVerifiedTester: true },
          { role: { in: ['admin', 'super_admin'] } },
          { activeRole: { in: ['admin', 'super_admin'] } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        activeRole: true,
        trustScore: true,
        isVerifiedTester: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ testers });
  } catch (error) {
    console.error('Error fetching testers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
