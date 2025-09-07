import { prisma } from '@/lib/prisma'
import type { Review, ReviewWithUser } from '@/types/app'

export class ReviewsService {
  // Get reviews for a tool
  static async getReviewsByToolId(
    toolId: string,
    options: {
      page?: number
      limit?: number
      type?: string
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    } = {}
  ) {
    try {
      const { page = 1, limit = 20, type, sortBy = 'createdAt', sortOrder = 'desc' } = options
      const skip = (page - 1) * limit

      const where: Record<string, unknown> = {
        toolId,
        status: 'active'
      }

      if (type) {
        where.type = type
      }

      const orderBy: Record<string, 'asc' | 'desc'> = {}
      orderBy[sortBy] = sortOrder

      // Optimize: Only fetch reviews without count for better performance
      const reviews = await prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
              trustScore: true,
              isVerifiedTester: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      })

      // Transform Decimal fields to numbers and date fields for better performance
      const transformedReviews = reviews.map(review => ({
        ...review,
        overall_score: review.overallScore ? Number(review.overallScore) : null,
        value_score: review.valueScore ? Number(review.valueScore) : null,
        usage_score: review.usageScore ? Number(review.usageScore) : null,
        integration_score: review.integrationScore ? Number(review.integrationScore) : null,
        helpful_votes: Number(review.helpfulVotes),
        total_votes: Number(review.totalVotes),
        created_at: review.createdAt?.toISOString() || new Date().toISOString(),
        updated_at: review.updatedAt?.toISOString() || new Date().toISOString()
      }))

      return {
        reviews: transformedReviews as unknown as ReviewWithUser[],
        totalCount: reviews.length, // Simplified for performance
        totalPages: 1, // Simplified for performance
        currentPage: page
      }
    } catch (error) {
      console.error('Service error:', error)
      return {
        reviews: [] as ReviewWithUser[],
        totalCount: 0,
        totalPages: 0,
        currentPage: options.page || 1
      }
    }
  }

  // Get review by ID
  static async getReviewById(id: string): Promise<ReviewWithUser | null> {
    try {
      const review = await prisma.review.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
              trustScore: true,
              isVerifiedTester: true
            }
          }
        }
      })

      return review as unknown as ReviewWithUser
    } catch (error) {
      console.error('Service error:', error)
      return null
    }
  }

  // Create new review
  static async createReview(data: {
    toolId: string
    userId: string
    type: string
    title: string
    content: string
    overallScore?: number
    valueScore?: number
    usageScore?: number
    integrationScore?: number
    painPoints?: string
    setupTime?: string
    roiStory?: string
    usageRecommendations?: string
    weaknesses?: string
    pros?: string[]
    cons?: string[]
    recommendation?: string
    useCase?: string
    companySize?: string
    industry?: string
    usageDuration?: string
    pricingModel?: string
    startingPrice?: number
    pricingDetails?: string
  }): Promise<Review> {
    try {
      const review = await prisma.review.create({
        data
      })

      // Update tool review counts
      await prisma.tool.update({
        where: { id: data.toolId },
        data: {
          totalReviews: { increment: 1 },
          verifiedReviews: data.type === 'verified_tester' ? { increment: 1 } : undefined,
          adminReviews: data.type === 'admin' ? { increment: 1 } : undefined
        }
      })

      return review as unknown as Review
    } catch (error) {
      console.error('Service error:', error)
      throw error
    }
  }

  // Update review
  static async updateReview(
    id: string,
    data: Partial<{
      title: string
      content: string
      overallScore: number
      valueScore: number
      usageScore: number
      integrationScore: number
      painPoints: string
      setupTime: string
      roiStory: string
      usageRecommendations: string
      weaknesses: string
      pros: string[]
      cons: string[]
      recommendation: string
      useCase: string
      companySize: string
      industry: string
      usageDuration: string
    }>
  ): Promise<Review> {
    try {
      const review = await prisma.review.update({
        where: { id },
        data
      })

      return review as unknown as Review
    } catch (error) {
      console.error('Service error:', error)
      throw error
    }
  }

  // Delete review
  static async deleteReview(id: string): Promise<void> {
    try {
      const review = await prisma.review.findUnique({
        where: { id },
        select: { toolId: true, type: true }
      })

      if (review) {
        await prisma.$transaction([
          prisma.review.delete({ where: { id } }),
          prisma.tool.update({
            where: { id: review.toolId },
            data: {
              totalReviews: { decrement: 1 },
              verifiedReviews: review.type === 'verified_tester' ? { decrement: 1 } : undefined,
              adminReviews: review.type === 'admin' ? { decrement: 1 } : undefined
            }
          })
        ])
      }
    } catch (error) {
      console.error('Service error:', error)
      throw error
    }
  }

  // Vote on review
  static async voteReview(reviewId: string, userId: string, voteType: 'helpful' | 'not_helpful'): Promise<void> {
    try {
      const existingVote = await prisma.reviewVote.findUnique({
        where: {
          reviewId_userId: {
            reviewId,
            userId
          }
        }
      })

      if (existingVote) {
        // Update existing vote
        await prisma.reviewVote.update({
          where: {
            reviewId_userId: {
              reviewId,
              userId
            }
          },
          data: { voteType }
        })
      } else {
        // Create new vote
        await prisma.reviewVote.create({
          data: { reviewId, userId, voteType }
        })
      }

      // Update review vote counts
      const [helpfulVotes, totalVotes] = await Promise.all([
        prisma.reviewVote.count({
          where: { reviewId, voteType: 'helpful' }
        }),
        prisma.reviewVote.count({
          where: { reviewId }
        })
      ])

      await prisma.review.update({
        where: { id: reviewId },
        data: {
          helpfulVotes,
          totalVotes
        }
      })
    } catch (error) {
      console.error('Service error:', error)
      throw error
    }
  }

  // Get all reviews (for admin/overview)
  static async getAllReviews(): Promise<ReviewWithUser[]> {
    try {
      const reviews = await prisma.review.findMany({
        where: { status: 'active' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
              trustScore: true,
              isVerifiedTester: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      return reviews as unknown as ReviewWithUser[]
    } catch (error) {
      console.error('Service error:', error)
      return []
    }
  }

  // Get tool reviews (legacy method for compatibility)
  static async getToolReviews(toolId: string, options: {
    limit?: number
    offset?: number
  } = {}): Promise<ReviewWithUser[]> {
    try {
      const { limit = 20, offset = 0 } = options
      
      const reviews = await prisma.review.findMany({
        where: {
          toolId,
          status: 'active'
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
              trustScore: true,
              isVerifiedTester: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
      })

      // Transform Decimal fields to numbers and date fields
      const transformedReviews = reviews.map(review => ({
        ...review,
        overall_score: review.overallScore ? Number(review.overallScore) : null,
        value_score: review.valueScore ? Number(review.valueScore) : null,
        usage_score: review.usageScore ? Number(review.usageScore) : null,
        integration_score: review.integrationScore ? Number(review.integrationScore) : null,
        helpful_votes: Number(review.helpfulVotes),
        total_votes: Number(review.totalVotes),
        created_at: review.createdAt?.toISOString() || new Date().toISOString(),
        updated_at: review.updatedAt?.toISOString() || new Date().toISOString()
      }))

      return transformedReviews as unknown as ReviewWithUser[]
    } catch (error) {
      console.error('Service error:', error)
      return []
    }
  }

  // Get user's reviews
  static async getUserReviews(userId: string, options: {
    page?: number
    limit?: number
  } = {}): Promise<{ reviews: ReviewWithUser[], totalCount: number, totalPages: number, currentPage: number }> {
    try {
      const { page = 1, limit = 20 } = options
      const skip = (page - 1) * limit

      const [reviews, totalCount] = await Promise.all([
        prisma.review.findMany({
          where: { userId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
                role: true,
                trustScore: true,
                isVerifiedTester: true
              }
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.review.count({ where: { userId } })
      ])

      return {
        reviews: reviews as unknown as ReviewWithUser[],
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
      }
    } catch (error) {
      console.error('Service error:', error)
      return {
        reviews: [] as ReviewWithUser[],
        totalCount: 0,
        totalPages: 0,
        currentPage: options.page || 1
      }
    }
  }
}
