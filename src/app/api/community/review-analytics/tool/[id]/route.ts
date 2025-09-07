import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: toolId } = await params;
    
    if (!toolId) {
      return NextResponse.json(
        { error: 'Tool ID is required' },
        { status: 400 }
      );
    }

    // Get all reviews for the tool and calculate analytics
    const reviews = await prisma.review.findMany({
      where: { toolId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            isVerifiedTester: true,
            role: true,
            trustScore: true
          }
        }
      }
    });

    if (reviews.length === 0) {
      return NextResponse.json({
        totalReviews: 0,
        averageHelpfulness: 0,
        averageQuality: 0,
        averageEngagement: 0,
        topReviewers: [],
        reviewTrends: []
      });
    }

    // Calculate basic metrics
    const totalReviews = reviews.length;
    const verifiedReviews = reviews.filter(r => r.user?.isVerifiedTester).length;
    
    const analytics = {
      totalReviews,
      verifiedReviews,
      averageRating: 0, // Note: rating field doesn't exist in Review schema
      topReviewers: reviews
        .slice(0, 5)
        .map(r => ({
          userId: r.user?.id || '',
          userName: r.user?.name || 'Anonymous',
          avatarUrl: r.user?.avatarUrl || '',
          reviewCount: 1,
          averageHelpfulness: 0,
          averageQuality: 0,
          trustScore: r.user?.trustScore || 0
        }))
    };
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching tool review analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tool review analytics' },
      { status: 500 }
    );
  }
}
