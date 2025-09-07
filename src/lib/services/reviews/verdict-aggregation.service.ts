import { createSupabaseClient } from '@/utils/supabase-client'

export interface VerdictFactors {
  keepPercentage: number
  tryPercentage: number
  stopPercentage: number
  totalReviews: number
  verifiedTesterReviews: number
  adminReviews: number
  communityReviews: number
  averageRating: number
  helpfulVotes: number
  totalVotes: number
  reviewQuality: number
  confidenceScore: number
}

export interface ToolVerdict {
  toolId: string
  verdict: 'keep' | 'try' | 'stop' | 'insufficient_data'
  confidence: number
  factors: VerdictFactors
  explanation: string
  lastCalculated: string
  reviewBreakdown: {
    keep: number
    try: number
    stop: number
  }
}

export class VerdictAggregationService {
  // Calculate verdict for a specific tool
  static async calculateToolVerdict(toolId: string): Promise<ToolVerdict> {
    try {
      const supabase = createSupabaseClient()
      
      // Get all reviews for the tool
      const { data: reviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          id,
          user_id,
          rating,
          pros,
          cons,
          review_type,
          helpful_votes,
          total_votes,
          content,
          created_at,
          users!reviews_user_id_fkey (
            is_verified_tester,
            role,
            trust_score
          )
        `)
        .eq('tool_id', toolId)
        .eq('status', 'active')

      if (reviewsError) throw reviewsError

      if (!reviews || reviews.length === 0) {
        return this.createInsufficientDataVerdict(toolId)
      }

      // Calculate factors
      const factors = this.calculateVerdictFactors(reviews)
      
      // Determine verdict
      const verdict = this.determineVerdict(factors)
      
      // Calculate confidence
      const confidence = this.calculateConfidence(factors)
      
      // Generate explanation
      const explanation = this.generateExplanation(verdict, factors)
      
      // Update tool's verdict in database
      await this.updateToolVerdict(toolId, verdict, confidence, factors)
      
      return {
        toolId,
        verdict,
        confidence,
        factors,
        explanation,
        lastCalculated: new Date().toISOString(),
        reviewBreakdown: {
          keep: Math.round(factors.keepPercentage * factors.totalReviews / 100),
          try: Math.round(factors.tryPercentage * factors.totalReviews / 100),
          stop: Math.round(factors.stopPercentage * factors.totalReviews / 100)
        }
      }
    } catch (error) {
      console.error('Error calculating tool verdict:', error)
      throw error
    }
  }

  // Calculate verdict factors from reviews
  private static calculateVerdictFactors(reviews: Array<{ 
    users?: { is_verified_tester?: boolean; role?: string }[]; 
    rating?: number; 
    verdict?: string;
    helpful_votes?: number;
    total_votes?: number;
    content?: string;
  }>): VerdictFactors {
    const totalReviews = reviews.length
    
    // Count reviews by type
    const verifiedTesterReviews = reviews.filter(r => r.users?.[0]?.is_verified_tester).length
    const adminReviews = reviews.filter(r => r.users?.[0]?.role === 'admin' || r.users?.[0]?.role === 'super_admin').length
    const communityReviews = totalReviews - verifiedTesterReviews - adminReviews
    
    // Calculate average rating
    const averageRating = reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / totalReviews
    
    // Calculate total votes
    const helpfulVotes = reviews.reduce((sum, r) => sum + (r.helpful_votes || 0), 0)
    const totalVotes = reviews.reduce((sum, r) => sum + (r.total_votes || 0), 0)
    
    // Calculate review quality (based on length, votes, and reviewer type)
    const reviewQuality = reviews.reduce((sum, review) => {
      const lengthScore = Math.min((review.content?.length || 0) / 200, 1) // Max 1 for 200+ chars
      const voteScore = (review.total_votes && review.total_votes > 0) ? (review.helpful_votes || 0) / review.total_votes : 0
      const typeScore = review.users?.[0]?.is_verified_tester ? 0.3 : 
                       (review.users?.[0]?.role === 'admin' || review.users?.[0]?.role === 'super_admin') ? 0.4 : 0.1
      return sum + (lengthScore + voteScore + typeScore)
    }, 0) / totalReviews
    
    // Calculate verdict percentages based on rating
    let keepCount = 0, tryCount = 0, stopCount = 0
    
    reviews.forEach(review => {
      const rating = review.rating || 0
      if (rating >= 4.5) keepCount++
      else if (rating >= 3.0) tryCount++
      else stopCount++
    })
    
    const keepPercentage = (keepCount / totalReviews) * 100
    const tryPercentage = (tryCount / totalReviews) * 100
    const stopPercentage = (stopCount / totalReviews) * 100
    
    return {
      keepPercentage,
      tryPercentage,
      stopPercentage,
      totalReviews,
      verifiedTesterReviews,
      adminReviews,
      communityReviews,
      averageRating,
      helpfulVotes,
      totalVotes,
      reviewQuality,
      confidenceScore: 0 // Will be calculated separately
    }
  }

  // Determine verdict based on factors
  private static determineVerdict(factors: VerdictFactors): 'keep' | 'try' | 'stop' | 'insufficient_data' {
    // Weight verified tester and admin reviews more heavily
    const verifiedWeight = 2.0
    const adminWeight = 2.5
    const communityWeight = 1.0
    
    const weightedKeep = (factors.keepPercentage * communityWeight) +
                        (factors.verifiedTesterReviews > 0 ? 20 * verifiedWeight : 0) +
                        (factors.adminReviews > 0 ? 25 * adminWeight : 0)
    
    const weightedTry = (factors.tryPercentage * communityWeight) +
                       (factors.verifiedTesterReviews > 0 ? 10 * verifiedWeight : 0) +
                       (factors.adminReviews > 0 ? 15 * adminWeight : 0)
    
    const weightedStop = (factors.stopPercentage * communityWeight) +
                        (factors.verifiedTesterReviews > 0 ? 5 * verifiedWeight : 0) +
                        (factors.adminReviews > 0 ? 5 * adminWeight : 0)
    
    // Determine verdict based on weighted scores
    if (weightedKeep > weightedTry && weightedKeep > weightedStop && factors.averageRating >= 4.0) {
      return 'keep'
    } else if (weightedTry > weightedStop && factors.averageRating >= 3.0) {
      return 'try'
    } else if (weightedStop > weightedKeep && weightedStop > weightedTry) {
      return 'stop'
    } else {
      return 'try' // Default to try if unclear
    }
  }

  // Calculate confidence score
  private static calculateConfidence(factors: VerdictFactors): number {
    let confidence = 0
    
    // Base confidence on number of reviews
    confidence += Math.min(factors.totalReviews / 10, 1) * 30 // Max 30 points for 10+ reviews
    
    // Confidence from review quality
    confidence += factors.reviewQuality * 20 // Max 20 points
    
    // Confidence from verified tester reviews
    if (factors.verifiedTesterReviews > 0) {
      confidence += Math.min(factors.verifiedTesterReviews / 3, 1) * 25 // Max 25 points for 3+ verified reviews
    }
    
    // Confidence from admin reviews
    if (factors.adminReviews > 0) {
      confidence += Math.min(factors.adminReviews / 2, 1) * 25 // Max 25 points for 2+ admin reviews
    }
    
    // Confidence from vote engagement
    if (factors.totalVotes > 0) {
      confidence += Math.min(factors.helpfulVotes / factors.totalVotes, 1) * 10 // Max 10 points
    }
    
    return Math.min(Math.round(confidence), 100)
  }

  // Generate explanation for verdict
  private static generateExplanation(verdict: string, factors: VerdictFactors): string {
    const explanations = {
      keep: `Based on ${factors.totalReviews} reviews with an average rating of ${factors.averageRating.toFixed(1)}/5.0. ` +
            `${Math.round(factors.keepPercentage)}% of reviewers recommend keeping this tool. ` +
            `${factors.verifiedTesterReviews} verified tester reviews and ${factors.adminReviews} admin reviews support this recommendation.`,
      
      try: `Based on ${factors.totalReviews} reviews with an average rating of ${factors.averageRating.toFixed(1)}/5.0. ` +
           `${Math.round(factors.tryPercentage)}% of reviewers suggest trying this tool. ` +
           `Consider testing it with your specific use case to determine if it fits your needs.`,
      
      stop: `Based on ${factors.totalReviews} reviews with an average rating of ${factors.averageRating.toFixed(1)}/5.0. ` +
            `${Math.round(factors.stopPercentage)}% of reviewers recommend avoiding this tool. ` +
            `Consider alternatives or wait for improvements before investing time and resources.`,
      
      insufficient_data: `Limited review data available (${factors.totalReviews} reviews). ` +
                        `More reviews are needed to provide a reliable recommendation.`
    }
    
    return explanations[verdict as keyof typeof explanations] || explanations.insufficient_data
  }

  // Create insufficient data verdict
  private static createInsufficientDataVerdict(toolId: string): ToolVerdict {
    return {
      toolId,
      verdict: 'insufficient_data',
      confidence: 0,
      factors: {
        keepPercentage: 0,
        tryPercentage: 0,
        stopPercentage: 0,
        totalReviews: 0,
        verifiedTesterReviews: 0,
        adminReviews: 0,
        communityReviews: 0,
        averageRating: 0,
        helpfulVotes: 0,
        totalVotes: 0,
        reviewQuality: 0,
        confidenceScore: 0
      },
      explanation: 'No reviews available yet. More reviews are needed to provide a recommendation.',
      lastCalculated: new Date().toISOString(),
      reviewBreakdown: { keep: 0, try: 0, stop: 0 }
    }
  }

  // Update tool's verdict in database
  private static async updateToolVerdict(
    toolId: string, 
    verdict: string, 
    confidence: number, 
    factors: VerdictFactors
  ): Promise<void> {
    try {
      const supabase = createSupabaseClient()
      
      const { error } = await supabase
        .from('tools')
        .update({
          verdict: verdict === 'insufficient_data' ? null : verdict,
          verdict_confidence: confidence,
          verdict_factors: factors,
          verdict_updated_at: new Date().toISOString()
        })
        .eq('id', toolId)
      
      if (error) throw error
    } catch (error) {
      console.error('Error updating tool verdict:', error)
      throw error
    }
  }

  // Get verdict for a tool
  static async getToolVerdict(toolId: string): Promise<ToolVerdict | null> {
    try {
      const supabase = createSupabaseClient()
      
      const { data, error } = await supabase
        .from('tools')
        .select('verdict, verdict_confidence, verdict_factors, verdict_updated_at')
        .eq('id', toolId)
        .single()
      
      if (error) throw error
      
      if (!data) return null
      
      return {
        toolId,
        verdict: data.verdict || 'insufficient_data',
        confidence: data.verdict_confidence || 0,
        factors: data.verdict_factors || {},
        explanation: this.generateExplanation(data.verdict || 'insufficient_data', data.verdict_factors || {}),
        lastCalculated: data.verdict_updated_at || new Date().toISOString(),
        reviewBreakdown: {
          keep: Math.round((data.verdict_factors?.keepPercentage || 0) * (data.verdict_factors?.totalReviews || 0) / 100),
          try: Math.round((data.verdict_factors?.tryPercentage || 0) * (data.verdict_factors?.totalReviews || 0) / 100),
          stop: Math.round((data.verdict_factors?.stopPercentage || 0) * (data.verdict_factors?.totalReviews || 0) / 100)
        }
      }
    } catch (error) {
      console.error('Error getting tool verdict:', error)
      return null
    }
  }

  // Get all tool verdicts for comparison
  static async getAllToolVerdicts(): Promise<ToolVerdict[]> {
    try {
      const supabase = createSupabaseClient()
      
      const { data, error } = await supabase
        .from('tools')
        .select('id, verdict, verdict_confidence, verdict_factors, verdict_updated_at')
        .not('verdict', 'is', null)
        .order('verdict_confidence', { ascending: false })
      
      if (error) throw error
      
      return (data || []).map(tool => ({
        toolId: tool.id,
        verdict: tool.verdict,
        confidence: tool.verdict_confidence || 0,
        factors: tool.verdict_factors || {},
        explanation: this.generateExplanation(tool.verdict, tool.verdict_factors || {}),
        lastCalculated: tool.verdict_updated_at || new Date().toISOString(),
        reviewBreakdown: {
          keep: Math.round((tool.verdict_factors?.keepPercentage || 0) * (tool.verdict_factors?.totalReviews || 0) / 100),
          try: Math.round((tool.verdict_factors?.tryPercentage || 0) * (tool.verdict_factors?.totalReviews || 0) / 100),
          stop: Math.round((tool.verdict_factors?.stopPercentage || 0) * (tool.verdict_factors?.totalReviews || 0) / 100)
        }
      }))
    } catch (error) {
      console.error('Error getting all tool verdicts:', error)
      return []
    }
  }
}
