import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ exists: false });
    }

    return NextResponse.json({ exists: true, user });
  } catch (error) {
    console.error('Error in check-user-exists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
