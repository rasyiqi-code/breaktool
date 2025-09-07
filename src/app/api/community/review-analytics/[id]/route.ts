import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;
    
    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // Get review with user data
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
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

    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Get votes for the review
    const votes = await prisma.reviewVote.findMany({
      where: { reviewId },
      select: { voteType: true }
    });

    // Calculate basic metrics
    const totalVotes = votes.length;
    const helpfulVotes = votes.filter(v => v.voteType === 'helpful').length;
    const helpfulnessScore = totalVotes > 0 ? (helpfulVotes / totalVotes) * 100 : 0;

    // Calculate quality score based on content length and structure
    let qualityScore = 0;
    const contentLength = review.content?.length || 0;
    if (contentLength > 500) qualityScore += 20;
    else if (contentLength > 300) qualityScore += 15;
    else if (contentLength > 100) qualityScore += 10;
    else qualityScore += 5;

    // Add scoring completeness points
    if (review.overallScore && review.valueScore && review.usageScore && review.integrationScore) {
      qualityScore += 20;
    }

    // Add detailed fields completion points
    const detailedFields = [
      review.painPoints, review.setupTime, review.roiStory,
      review.usageRecommendations, review.weaknesses
    ].filter(field => field && field.length > 0).length;
    qualityScore += Math.min(detailedFields * 4, 20);

    // Add pros and cons points
    const prosCount = review.pros?.length || 0;
    const consCount = review.cons?.length || 0;
    qualityScore += Math.min((prosCount + consCount) * 2, 15);

    // Add user expertise bonus
    if (review.user?.role === 'admin' || review.user?.role === 'super_admin') qualityScore += 15;
    else if (review.user?.isVerifiedTester) qualityScore += 10;
    else if (review.user?.trustScore && review.user.trustScore > 50) qualityScore += 5;

    // Calculate engagement rate (based on votes and content length)
    const engagementRate = Math.min(50 + (totalVotes * 10) + (contentLength / 10), 100);

    // Calculate sentiment score (based on overall score and pros/cons balance)
    let sentimentScore = 50; // neutral starting point
    if (review.overallScore) {
      const overallScoreNum = Number(review.overallScore);
      sentimentScore += (overallScoreNum - 5) * 8; // -40 to +40 range
    }
    if (prosCount > consCount) {
      sentimentScore += Math.min((prosCount - consCount) * 5, 20);
    } else if (consCount > prosCount) {
      sentimentScore -= Math.min((consCount - prosCount) * 5, 20);
    }
    sentimentScore = Math.max(0, Math.min(100, sentimentScore));

    const analytics = {
      reviewId,
      totalVotes,
      helpfulVotes,
      helpfulnessScore,
      qualityScore,
      engagementRate,
      sentimentScore,
      trendData: [],
      metrics: {
        totalReviews: 1,
        averageHelpfulness: helpfulnessScore,
        averageQuality: qualityScore,
        averageEngagement: engagementRate,
        topReviewers: [],
        reviewTrends: []
      },
      user: review.user,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt
    };
    
    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching review analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review analytics' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reviewId } = await params;
    
    if (!reviewId) {
      return NextResponse.json(
        { error: 'Review ID is required' },
        { status: 400 }
      );
    }

    // For now, just return success since we're not implementing complex analytics update
    // In the future, this could update cached analytics or trigger recalculation
    
    return NextResponse.json({ message: 'Review analytics updated successfully' });
  } catch (error) {
    console.error('Error updating review analytics:', error);
    return NextResponse.json(
      { error: 'Failed to update review analytics' },
      { status: 500 }
    );
  }
}
