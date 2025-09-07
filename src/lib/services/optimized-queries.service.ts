import { prisma } from '@/lib/prisma'

/**
 * Optimized query service with caching and performance improvements
 * This service provides optimized database queries with proper indexing
 */
export class OptimizedQueriesService {
  /**
   * Get tools with optimized query - uses indexes for better performance
   */
  static async getToolsOptimized({
    page = 1,
    limit = 20,
    category,
    featured,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  }: {
    page?: number
    limit?: number
    category?: string
    featured?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const skip = (page - 1) * limit
    
    // Build where clause using indexes
    const where: { status: string; categoryId?: string; featured?: boolean } = {
      status: 'active'
    }
    
    if (category) {
      where.categoryId = category
    }
    
    if (featured !== undefined) {
      where.featured = featured
    }
    
    // Use indexed fields for sorting
    const orderBy: { createdAt?: 'asc' | 'desc'; upvotes?: 'asc' | 'desc'; overallScore?: 'asc' | 'desc' } = {}
    if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder
    } else if (sortBy === 'upvotes') {
      orderBy.upvotes = sortOrder
    } else if (sortBy === 'overallScore') {
      orderBy.overallScore = sortOrder
    } else {
      orderBy.createdAt = 'desc' // fallback to indexed field
    }
    
    // Optimized query with selective fields and proper includes
    const [tools, total] = await Promise.all([
      prisma.tool.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          logoUrl: true,
          website: true,
          categoryId: true,
          pricingModel: true,
          startingPrice: true,
          verdict: true,
          upvotes: true,
          totalReviews: true,
          overallScore: true,
          featured: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true
            }
          }
        }
      }),
      prisma.tool.count({ where })
    ])
    
    return {
      tools,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
  
  /**
   * Get trending tools with optimized query
   */
  static async getTrendingToolsOptimized(limit = 6) {
    return prisma.tool.findMany({
      where: {
        status: 'active',
        upvotes: { gt: 0 } // Only tools with upvotes
      },
      orderBy: [
        { upvotes: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        website: true,
        upvotes: true,
        totalReviews: true,
        overallScore: true,
        featured: true,
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })
  }
  
  /**
   * Get featured tools with optimized query
   */
  static async getFeaturedToolsOptimized(limit = 6) {
    return prisma.tool.findMany({
      where: {
        status: 'active',
        featured: true
      },
      orderBy: [
        { overallScore: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        logoUrl: true,
        website: true,
        upvotes: true,
        totalReviews: true,
        overallScore: true,
        featured: true,
        category: {
          select: {
            name: true,
            slug: true
          }
        }
      }
    })
  }
  
  /**
   * Get tool by slug with optimized query
   */
  static async getToolBySlugOptimized(slug: string) {
    return prisma.tool.findUnique({
      where: { slug },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        longDescription: true,
        website: true,
        logoUrl: true,
        categoryId: true,
        pricingModel: true,
        startingPrice: true,
        pricingDetails: true,
        verdict: true,
        upvotes: true,
        totalReviews: true,
        verifiedReviews: true,
        adminReviews: true,
        overallScore: true,
        valueScore: true,
        usageScore: true,
        integrationScore: true,
        featured: true,
        status: true,
        viewCount: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true
          }
        }
      }
    })
  }
  
  /**
   * Get reviews with optimized query
   */
  static async getReviewsOptimized({
    toolId,
    limit = 20,
    page = 1,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  }: {
    toolId: string
    limit?: number
    page?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  }) {
    const skip = (page - 1) * limit
    
    const where = {
      toolId,
      status: 'active'
    }
    
    const orderBy: { createdAt?: 'asc' | 'desc'; overallScore?: 'asc' | 'desc'; helpfulVotes?: 'asc' | 'desc' } = {}
    if (sortBy === 'createdAt') {
      orderBy.createdAt = sortOrder
    } else if (sortBy === 'overallScore') {
      orderBy.overallScore = sortOrder
    } else if (sortBy === 'helpfulVotes') {
      orderBy.helpfulVotes = sortOrder
    } else {
      orderBy.createdAt = 'desc'
    }
    
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          content: true,
          overallScore: true,
          valueScore: true,
          usageScore: true,
          integrationScore: true,
          recommendation: true,
          helpfulVotes: true,
          totalVotes: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              trustScore: true,
              isVerifiedTester: true
            }
          }
        }
      }),
      prisma.review.count({ where })
    ])
    
    return {
      reviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  }
  
  /**
   * Get platform stats with optimized query
   */
  static async getPlatformStatsOptimized() {
    const [
      totalTools,
      totalReviews,
      verifiedTesters,
      totalUsers
    ] = await Promise.all([
      prisma.tool.count({
        where: { status: 'active' }
      }),
      prisma.review.count({
        where: { status: 'active' }
      }),
      prisma.user.count({
        where: { isVerifiedTester: true }
      }),
      prisma.user.count()
    ])
    
    return {
      totalTools,
      totalReviews,
      verifiedTesters,
      totalUsers
    }
  }
}
