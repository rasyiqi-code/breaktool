import { prisma } from '@/lib/prisma'

export interface TrustScore {
  userId: string
  score: number
  lastCalculated: string
  badge: string | null
  displayName?: string
  profileImageUrl?: string
  factors?: TrustScoreFactors
}

export interface TrustScoreFactors {
  reviewCount: number
  reviewQuality: number
  helpfulVotesReceived: number
  activityRecency: number
  verifiedExpertise: boolean
}

export class TrustScoreService {
  // Get trust score for a user
  static async getTrustScore(userId: string): Promise<TrustScore | null> {
    try {
      const data = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          trustScore: true,
          name: true,
          avatarUrl: true
        }
      })
      
      if (!data) return null
      
      return {
        userId: data.id,
        score: data.trustScore || 0,
        lastCalculated: new Date().toISOString(),
        badge: this.determineBadge(data.trustScore || 0)
      }
    } catch (error) {
      console.error('Error getting trust score:', error)
      return null
    }
  }

  // Get top trusted users
  static async getTopTrustedUsers(limit: number = 10): Promise<TrustScore[]> {
    try {
      const data = await prisma.user.findMany({
        where: {
          trustScore: {
            gt: 0
          }
        },
        select: {
          id: true,
          trustScore: true,
          name: true,
          avatarUrl: true
        },
        orderBy: {
          trustScore: 'desc'
        },
        take: limit
      })
      
      return data.map(user => ({
        userId: user.id,
        score: user.trustScore || 0,
        lastCalculated: new Date().toISOString(),
        badge: this.determineBadge(user.trustScore || 0),
        displayName: user.name || undefined,
        profileImageUrl: user.avatarUrl || undefined
      }))
    } catch (error) {
      console.error('Error getting top trusted users:', error)
      return []
    }
  }

  // Calculate trust score for a user
  static async calculateTrustScore(userId: string): Promise<TrustScore | null> {
    try {
      // Get user data with reviews and votes
      const userData = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          isVerifiedTester: true,
          helpfulVotesReceived: true,
          reviews: {
            select: {
              id: true,
              helpfulVotes: true,
              totalVotes: true,
              content: true,
              createdAt: true
            }
          }
        }
      })

      if (!userData) return null

      // Calculate factors
      const reviewCount = userData.reviews.length
      const helpfulVotesReceived = userData.helpfulVotesReceived || 0
      
      // Calculate review quality (average helpfulness)
      const reviewQuality = userData.reviews.length > 0 
        ? userData.reviews.reduce((sum, review) => {
            const helpfulness = review.totalVotes > 0 ? review.helpfulVotes / review.totalVotes : 0
            return sum + helpfulness
          }, 0) / userData.reviews.length
        : 0

      // Calculate activity recency (based on most recent review)
      const mostRecentReview = userData.reviews.reduce((latest, review) => {
        return review.createdAt > latest ? review.createdAt : latest
      }, new Date(0))
      
      const daysSinceLastActivity = Math.floor(
        (Date.now() - mostRecentReview.getTime()) / (1000 * 60 * 60 * 24)
      )
      const activityRecency = Math.max(0, 1 - (daysSinceLastActivity / 365)) // Decay over a year

      // Calculate overall score
      const factors: TrustScoreFactors = {
        reviewCount,
        reviewQuality,
        helpfulVotesReceived,
        activityRecency,
        verifiedExpertise: userData.isVerifiedTester || false
      }

      let score = 0
      score += Math.min(reviewCount * 5, 30) // Max 30 points for reviews
      score += reviewQuality * 25 // Max 25 points for quality
      score += Math.min(helpfulVotesReceived * 2, 20) // Max 20 points for helpful votes
      score += activityRecency * 15 // Max 15 points for recency
      score += factors.verifiedExpertise ? 10 : 0 // 10 points for verification

      score = Math.min(Math.round(score), 100) // Cap at 100

      // Update user's trust score in database
      await prisma.user.update({
        where: { id: userId },
        data: { trustScore: score }
      })

      return {
        userId: userData.id,
        score,
        lastCalculated: new Date().toISOString(),
        badge: this.determineBadge(score),
        displayName: userData.name || undefined,
        profileImageUrl: userData.avatarUrl || undefined,
        factors
      }
    } catch (error) {
      console.error('Error calculating trust score:', error)
      return null
    }
  }

  // Simple badge determination based on score
  private static determineBadge(score: number): string | null {
    if (score >= 90) return '🔥 Top Expert'
    if (score >= 80) return '✅ Verified Expert'
    if (score >= 70) return '⭐ Trusted Reviewer'
    if (score >= 50) return '📝 Active Contributor'
    if (score >= 30) return '👋 New Reviewer'
    return null
  }
}
