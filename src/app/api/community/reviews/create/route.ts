import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack-server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      tool_id,
      title,
      content,
      value_score,
      usage_score,
      integration_score,
      pain_points,
      setup_time,
      roi_story,
      usage_recommendations,
      weaknesses,
      pros,
      cons,
      recommendation,
      use_case,
      company_size,
      industry,
      usage_duration,
      review_type
    } = body;

    // Validate required fields
    if (!tool_id || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate overall score
    const overall_score = Math.round((value_score + usage_score + integration_score) / 3);

    // Use provided review type or determine based on user role
    let finalReviewType = review_type || 'community';
    
    // Get user data to validate review type
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, isVerifiedTester: true }
    });

    // Validate review type based on user permissions
    if (finalReviewType === 'admin' && userData?.role !== 'admin' && userData?.role !== 'super_admin') {
      finalReviewType = 'community';
    } else if (finalReviewType === 'verified_tester' && !userData?.isVerifiedTester) {
      finalReviewType = 'community';
    }

    // Create review using Prisma
    const review = await prisma.review.create({
      data: {
        toolId: tool_id,
        userId: user.id,
        type: finalReviewType,
        title,
        content,
        overallScore: overall_score,
        valueScore: value_score,
        usageScore: usage_score,
        integrationScore: integration_score,
        painPoints: pain_points,
        setupTime: setup_time,
        roiStory: roi_story,
        usageRecommendations: usage_recommendations,
        weaknesses,
        pros: pros || [],
        cons: cons || [],
        recommendation,
        useCase: use_case,
        companySize: company_size,
        industry,
        usageDuration: usage_duration,
        status: 'active',
        helpfulVotes: 0,
        totalVotes: 0
      }
    });

    // Update tool statistics (we'll implement this later)
    // await updateToolStats(tool_id);

    return NextResponse.json({ 
      success: true, 
      review,
      message: 'Review created successfully' 
    });

  } catch (error) {
    console.error('Error in create review API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
