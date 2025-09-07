import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all users with related data using Prisma, excluding admin and super_admin
    const users = await prisma.user.findMany({
      where: {
        role: {
          notIn: ['admin', 'super_admin']
        }
      },
      include: {
        reviews: {
          select: {
            id: true,
            helpfulVotes: true,
            totalVotes: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calculate total reviews and helpful votes for each user
    const usersWithStats = users.map(user => {
      const reviews = user.reviews || [];
      const totalReviews = reviews.length;
      const helpfulVotesReceived = reviews.reduce((sum: number, review: { helpfulVotes: number }) => 
        sum + (review.helpfulVotes || 0), 0
      );

      return {
        // Transform Prisma camelCase to frontend snake_case
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        is_verified_tester: user.isVerifiedTester,
        verification_status: user.verificationStatus,
        trust_score: user.trustScore,
        total_reviews: totalReviews,
        helpful_votes_received: helpfulVotesReceived,
        badges: user.badges,
        expertise_areas: user.expertise,
        company: user.company,
        location: user.location,
        bio: user.bio,
        created_at: user.createdAt,
        verification_date: user.verifiedAt,
        verification_proof: null, // Not in schema yet
        // Add other fields as needed
        avatarUrl: user.avatarUrl,
        linkedinUrl: user.linkedinUrl,
        websiteUrl: user.websiteUrl,
        updatedAt: user.updatedAt
      };
    });

    return NextResponse.json(usersWithStats);

  } catch (error) {
    console.error('Error in admin users API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
