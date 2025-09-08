import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get user growth data (last 12 months)
    const userGrowthData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as users,
        LAG(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', "createdAt")) as prev_users
      FROM "User"
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month
    `;

    // Get tool categories data
    const toolCategoryData = await prisma.tool.groupBy({
      by: ['categoryId'],
      _count: {
        id: true
      },
      where: {
        status: 'active'
      }
    });

    // Get review trends (last 4 periods)
    const reviewTrendData = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('week', "createdAt") as period,
        COUNT(*) as reviews,
        AVG(rating) as average_rating
      FROM "Review"
      WHERE "createdAt" >= NOW() - INTERVAL '4 weeks'
      GROUP BY DATE_TRUNC('week', "createdAt")
      ORDER BY period DESC
      LIMIT 4
    `;

    // Get monthly review data for the last 6 months
    const monthlyReviews = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', "createdAt") as month,
        COUNT(*) as reviews,
        AVG(rating) as average_rating
      FROM "Review"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month
    `;

    // Get testing task completion rates
    const testingStats = await prisma.testingTask.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Get user verification rates
    const verificationStats = await prisma.user.groupBy({
      by: ['isVerifiedTester'],
      _count: {
        id: true
      }
    });

    // Get tool approval rates
    const toolApprovalStats = await prisma.tool.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Calculate growth percentages for user growth data
    const processedUserGrowth = (userGrowthData as Array<{ month: Date; users: bigint; prev_users: bigint | null }>).map((item) => {
      const growth = item.prev_users ? 
        ((Number(item.users) - Number(item.prev_users)) / Number(item.prev_users) * 100) : 0;
      
      return {
        month: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
        users: Number(item.users),
        growth: Number(growth.toFixed(1))
      };
    });

    // Process tool category data
    const totalTools = toolCategoryData.reduce((sum, item) => sum + item._count.id, 0);
    const processedToolCategories = toolCategoryData.map(item => ({
      category: item.categoryId || 'Uncategorized',
      count: item._count.id,
      percentage: totalTools > 0 ? Math.round((item._count.id / totalTools) * 100) : 0
    }));

    // Process review trend data
    const processedReviewTrends = (reviewTrendData as Array<{ period: Date; reviews: bigint; average_rating: number }>).map((item) => ({
      period: new Date(item.period).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      reviews: Number(item.reviews),
      averageRating: Number(Number(item.average_rating).toFixed(1))
    }));

    // Process monthly reviews
    const processedMonthlyReviews = (monthlyReviews as Array<{ month: Date; reviews: bigint; average_rating: number }>).map((item) => ({
      month: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
      reviews: Number(item.reviews),
      averageRating: Number(Number(item.average_rating).toFixed(1))
    }));

    // Process testing stats
    const totalTestingTasks = testingStats.reduce((sum, item) => sum + item._count.id, 0);
    const completedTasks = testingStats.find(item => item.status === 'completed')?._count.id || 0;
    const pendingTasks = testingStats.find(item => item.status === 'pending')?._count.id || 0;
    const inProgressTasks = testingStats.find(item => item.status === 'in_progress')?._count.id || 0;

    // Process verification stats
    const totalUsers = verificationStats.reduce((sum, item) => sum + item._count.id, 0);
    const verifiedUsers = verificationStats.find(item => item.isVerifiedTester === true)?._count.id || 0;

    // Process tool approval stats
    const totalToolSubmissions = toolApprovalStats.reduce((sum, item) => sum + item._count.id, 0);
    const activeTools = toolApprovalStats.find(item => item.status === 'active')?._count.id || 0;
    const pendingTools = toolApprovalStats.find(item => item.status === 'pending')?._count.id || 0;

    return NextResponse.json({
      userGrowthData: processedUserGrowth,
      toolCategoryData: processedToolCategories,
      reviewTrendData: processedReviewTrends,
      monthlyReviews: processedMonthlyReviews,
      testingStats: {
        total: totalTestingTasks,
        completed: completedTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks
      },
      verificationStats: {
        total: totalUsers,
        verified: verifiedUsers,
        verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers * 100) : 0
      },
      toolApprovalStats: {
        total: totalToolSubmissions,
        active: activeTools,
        pending: pendingTools,
        approvalRate: totalToolSubmissions > 0 ? (activeTools / totalToolSubmissions * 100) : 0
      }
    });

  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}