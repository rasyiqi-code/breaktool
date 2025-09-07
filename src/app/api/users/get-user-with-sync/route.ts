import { NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Sync user with Prisma database
    const userData = await prisma.user.upsert({
      where: {
        id: user.id,
      },
      update: {
        email: user.primaryEmail || `user-${user.id}@breaktool.local`,
        name: user.displayName || 'User',
        avatarUrl: user.profileImageUrl,
        updatedAt: new Date(),
      },
      create: {
        id: user.id,
        email: user.primaryEmail || `user-${user.id}@breaktool.local`,
        name: user.displayName || 'User',
        avatarUrl: user.profileImageUrl,
        role: 'user',
        trustScore: 0,
        badges: [],
        bio: null,
        company: null,
        linkedinUrl: null,
        websiteUrl: null,
        location: null,
        expertise: [],
        isVerifiedTester: false,
        verificationStatus: 'pending',
        verifiedAt: null,
        verifiedBy: null,
        helpfulVotesReceived: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    
    return NextResponse.json({ user: userData });
  } catch (error) {
    console.error('Error in get-user-with-sync API:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
