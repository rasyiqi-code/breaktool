import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, name, avatar_url } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    console.log('🔄 Auto-syncing user:', userId);

    // Prepare user data for Prisma
    const userData = {
      id: userId,
      email: email || `user-${userId}@breaktool.local`,
      name: name || 'User',
      avatarUrl: avatar_url,
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
    };

    // Sync to Prisma database
    try {
      const result = await prisma.user.upsert({
        where: { id: userId },
        update: userData,
        create: userData,
      });
      
      console.log('✅ User auto-synced successfully:', userId);
      return NextResponse.json({ 
        success: true, 
        message: 'User synced to database',
        user: result
      });
    } catch (syncError) {
      console.error('❌ Auto-sync error details:', syncError);
      return NextResponse.json({ 
        error: 'Failed to sync user to database',
        details: syncError instanceof Error ? syncError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Error in auto-sync:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
