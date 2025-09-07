import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack-server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await stackServerApp.getUser();
    
    // For testing purposes, use a default user if not authenticated
    const userId = user?.id || '40f5207c-74ae-4185-85d1-cb64a386ed8c'; // Default test user
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { review_id, vote_type } = body;

    // Validate required fields
    if (!review_id || !vote_type || !['helpful', 'not_helpful'].includes(vote_type)) {
      return NextResponse.json(
        { error: 'Missing or invalid required fields' },
        { status: 400 }
      );
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Check if user already voted on this review
      const existingVote = await tx.reviewVote.findUnique({
        where: {
          reviewId_userId: {
            reviewId: review_id,
            userId: userId
          }
        }
      });

      if (existingVote) {
        // Update existing vote
        await tx.reviewVote.update({
          where: {
            reviewId_userId: {
              reviewId: review_id,
              userId: userId
            }
          },
          data: { voteType: vote_type }
        });
      } else {
        // Create new vote
        await tx.reviewVote.create({
          data: {
            reviewId: review_id,
            userId: userId,
            voteType: vote_type
          }
        });
      }

      // Update review vote counts
      const votes = await tx.reviewVote.findMany({
        where: { reviewId: review_id },
        select: { voteType: true }
      });

      const helpfulVotes = votes.filter(v => v.voteType === 'helpful').length;
      const totalVotes = votes.length;

      await tx.review.update({
        where: { id: review_id },
        data: {
          helpfulVotes: helpfulVotes,
          totalVotes: totalVotes
        }
      });

      return { helpfulVotes, totalVotes };
    });

    return NextResponse.json({ 
      success: true,
      helpful_votes: result.helpfulVotes,
      total_votes: result.totalVotes,
      message: 'Vote recorded successfully' 
    });

  } catch (error) {
    console.error('Error in vote API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
