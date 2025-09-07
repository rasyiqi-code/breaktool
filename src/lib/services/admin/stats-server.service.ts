import "server-only";
import { prisma } from '@/lib/prisma';
import type { PlatformStats } from '@/types/app'

export class StatsServerService {
  // Get platform statistics
  static async getPlatformStats(): Promise<PlatformStats> {
    try {
      const [totalTools, totalReviews, verifiedTesters, totalUsers] = await Promise.all([
        // Count active tools
        prisma.tool.count({
          where: { status: 'active' }
        }),
        
        // Count active reviews
        prisma.review.count({
          where: { status: 'active' }
        }),
        
        // Count verified testers
        prisma.user.count({
          where: { role: 'verified_tester' }
        }),
        
        // Count total users
        prisma.user.count()
      ]);

      return {
        totalTools,
        totalReviews,
        verifiedTesters,
        totalUsers
      };
    } catch (error) {
      console.error('Error fetching platform stats:', error);
      return {
        totalTools: 0,
        totalReviews: 0,
        verifiedTesters: 0,
        totalUsers: 0
      };
    }
  }

  // Get tool statistics
  static async getToolStats(toolId: string): Promise<{
    upvotes: number
    totalReviews: number
    verifiedReviews: number
    adminReviews: number
    averageScore: number
  }> {
    try {
      const [tool, reviews] = await Promise.all([
        // Get tool data
        prisma.tool.findUnique({
          where: { id: toolId },
          select: {
            upvotes: true,
            totalReviews: true,
            verifiedReviews: true,
            adminReviews: true,
            overallScore: true
          }
        }),
        
        // Get review stats
        prisma.review.findMany({
          where: {
            toolId: toolId,
            status: 'active'
          },
          select: {
            overallScore: true,
            type: true
          }
        })
      ]);

      const verifiedReviews = reviews.filter(r => r.type === 'verified_tester').length;
      const adminReviews = reviews.filter(r => r.type === 'admin').length;
      const averageScore = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + (Number(r.overallScore) || 0), 0) / reviews.length 
        : 0;

      return {
        upvotes: tool?.upvotes || 0,
        totalReviews: tool?.totalReviews || 0,
        verifiedReviews: verifiedReviews,
        adminReviews: adminReviews,
        averageScore: averageScore
      };
    } catch (error) {
      console.error('Error fetching tool stats:', error);
      return {
        upvotes: 0,
        totalReviews: 0,
        verifiedReviews: 0,
        adminReviews: 0,
        averageScore: 0
      };
    }
  }

  // Get user statistics
  static async getUserStats(userId: string): Promise<{
    reviewCount: number
    helpfulVotes: number
    toolsUpvoted: number
    trustScore: number
  }> {
    try {
      const [user, reviewCount, upvoteCount] = await Promise.all([
        // Get user data
        prisma.user.findUnique({
          where: { id: userId },
          select: {
            trustScore: true,
            helpfulVotesReceived: true
          }
        }),
        
        // Count user reviews
        prisma.review.count({
          where: {
            userId: userId,
            status: 'active'
          }
        }),
        
        // Count user upvotes
        prisma.toolUpvote.count({
          where: {
            userId: userId
          }
        })
      ]);

      return {
        reviewCount: reviewCount,
        helpfulVotes: user?.helpfulVotesReceived || 0,
        toolsUpvoted: upvoteCount,
        trustScore: user?.trustScore || 0
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        reviewCount: 0,
        helpfulVotes: 0,
        toolsUpvoted: 0,
        trustScore: 0
      };
    }
  }

  // Get category statistics
  static async getCategoryStats(): Promise<Array<{
    id: string
    name: string
    toolCount: number
  }>> {
    try {
      const categories = await prisma.category.findMany({
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              tools: true
            }
          }
        },
        orderBy: {
          name: 'asc'
        }
      });

      return categories.map(category => ({
        id: category.id,
        name: category.name,
        toolCount: category._count.tools
      }));
    } catch (error) {
      console.error('Error fetching category stats:', error);
      return [];
    }
  }

  // Get trending stats (for dashboard)
  static async getTrendingStats(): Promise<{
    topCategories: Array<{ name: string; count: number }>
    recentActivity: Array<{ type: string; count: number; date: string }>
    topTools: Array<{ name: string; upvotes: number; reviews: number }>
  }> {
    try {
      const [topCategories, topTools] = await Promise.all([
        // Get top categories by tool count
        prisma.category.findMany({
          select: {
            name: true,
            _count: {
              select: {
                tools: true
              }
            }
          },
          orderBy: {
            tools: {
              _count: 'desc'
            }
          },
          take: 5
        }),
        
        // Get top tools by upvotes
        prisma.tool.findMany({
          where: {
            status: 'active'
          },
          select: {
            name: true,
            upvotes: true,
            totalReviews: true
          },
          orderBy: {
            upvotes: 'desc'
          },
          take: 5
        })
      ]);

      const formattedCategories = topCategories.map(cat => ({
        name: cat.name,
        count: cat._count.tools
      }));

      const formattedTools = topTools.map(tool => ({
        name: tool.name,
        upvotes: tool.upvotes || 0,
        reviews: tool.totalReviews || 0
      }));

      return {
        topCategories: formattedCategories,
        recentActivity: [], // Could be implemented with activity tracking
        topTools: formattedTools
      };
    } catch (error) {
      console.error('Error fetching trending stats:', error);
      return {
        topCategories: [],
        recentActivity: [],
        topTools: []
      };
    }
  }
}
