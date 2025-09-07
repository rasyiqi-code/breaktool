import { NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get user from Stack Auth
    const stackUser = await stackServerApp.getUser();
    
    if (!stackUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user data from Prisma database (including multi-role fields)
    const userData = await prisma.user.findUnique({
      where: { id: stackUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true, // Legacy field
        activeRole: true, // Multi-role field
        primaryRole: true, // Multi-role field
        avatarUrl: true,
        trustScore: true,
        isVerifiedTester: true,
        verificationStatus: true,
        bio: true,
        company: true,
        linkedinUrl: true,
        websiteUrl: true,
        location: true,
        expertise: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!userData) {
      // If user not found, return basic user info with default role
      return NextResponse.json({
        id: stackUser.id,
        email: stackUser.primaryEmail,
        name: stackUser.displayName,
        role: 'user', // Default role
        profileImageUrl: stackUser.profileImageUrl
      });
    }

    // Return user data with role from database (prioritize activeRole, fallback to legacy role)
    const currentRole = userData.activeRole || userData.role || 'user';
    
    return NextResponse.json({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: currentRole, // Use activeRole if available, otherwise legacy role
      activeRole: userData.activeRole,
      primaryRole: userData.primaryRole,
      profileImageUrl: userData.avatarUrl || stackUser.profileImageUrl,
      isVerifiedTester: userData.isVerifiedTester || false,
      verificationStatus: userData.verificationStatus || 'pending',
      bio: userData.bio,
      company: userData.company,
      linkedin_url: userData.linkedinUrl,
      website_url: userData.websiteUrl,
      location: userData.location,
      expertise: userData.expertise,
      trust_score: userData.trustScore,
      created_at: userData.createdAt,
      updated_at: userData.updatedAt
    });

  } catch (error) {
    console.error('Error in /api/users/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
