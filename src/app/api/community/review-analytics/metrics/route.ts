import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get platform-wide review metrics
    const totalReviews = await prisma.review.count();
    const totalUsers = await prisma.user.count();
    const totalTools = await prisma.tool.count();
    
    // Get recent reviews (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentReviews = await prisma.review.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo
        }
      }
    });

    // Get verified tester reviews
    const verifiedReviews = await prisma.review.count({
      where: {
        user: {
          isVerifiedTester: true
        }
      }
    });

    // Get average review scores
    const reviewsWithScores = await prisma.review.findMany({
      where: {
        overallScore: {
          not: null
        }
      },
      select: {
        overallScore: true
      }
    });

    const averageScore = reviewsWithScores.length > 0
      ? reviewsWithScores.reduce((sum, r) => sum + Number(r.overallScore || 0), 0) / reviewsWithScores.length
      : 0;

    const metrics = {
      totalReviews,
      totalUsers,
      totalTools,
      recentReviews,
      verifiedReviews,
      averageScore: Math.round(averageScore * 10) / 10,
      reviewGrowth: recentReviews > 0 ? Math.round((recentReviews / totalReviews) * 100) : 0
    };
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching review metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch review metrics' },
      { status: 500 }
    );
  }
}
