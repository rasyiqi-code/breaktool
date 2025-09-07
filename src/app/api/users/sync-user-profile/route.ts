import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack-server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const updates = await request.json();

    // Update user data in Prisma database
    const result = await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        email: user.primaryEmail,
        name: user.displayName,
        avatarUrl: user.profileImageUrl,
        ...updates,
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in sync-user-profile API:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
