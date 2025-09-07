import { createSupabaseClient } from '@/utils/supabase-client'

export interface PlatformStats {
  totalUsers: number
  totalTools: number
  totalReviews: number
  totalUpvotes: number
  verifiedTesters: number
  activeTools: number
  pendingTools: number
  averageRating: number
  topCategories: Array<{
    name: string
    count: number
    percentage: number
  }>
  verdictDistribution: {
    keep: number
    try: number
    stop: number
    insufficient: number
  }
  monthlyGrowth: {
    users: number
    tools: number
    reviews: number
  }
}

export interface ToolAnalytics {
  toolId: string
  toolName: string
  viewCount: number
  reviewCount: number
  averageRating: number
  verdict: string
  verdictConfidence: number
  upvotes: number
  category: string
  created_at: string
  lastReviewDate: string
  reviewTrend: Array<{
    date: string
    count: number
    rating: number
  }>
  reviewerBreakdown: {
    verified: number
    admin: number
    community: number
  }
  ratingDistribution: {
    '5': number
    '4': number
    '3': number
    '2': number
    '1': number
  }
}

export interface ComparisonReport {
  toolIds: string[]
  tools: Array<{
    id: string
    name: string
    category: string
    averageRating: number
    totalReviews: number
    verdict: string
    verdictConfidence: number
    pros: string[]
    cons: string[]
    features: string[]
    pricing: {
      model: string
      range: string
    }
  }>
  comparison: {
    ratingComparison: Array<{
      tool: string
      rating: number
      rank: number
    }>
    reviewComparison: Array<{
      tool: string
      count: number
      rank: number
    }>
    verdictComparison: Array<{
      tool: string
      verdict: string
      confidence: number
      rank: number
    }>
    featureComparison: {
      commonFeatures: string[]
      uniqueFeatures: { [toolId: string]: string[] }
    }
  }
}

export interface IndustryInsights {
  industry: string
  totalTools: number
  averageRating: number
  topTools: Array<{
    id: string
    name: string
    rating: number
    reviews: number
    verdict: string
  }>
  categoryBreakdown: Array<{
    category: string
    count: number
    percentage: number
  }>
  pricingAnalysis: {
    free: number
    freemium: number
    paid: number
    enterprise: number
  }
  verdictDistribution: {
    keep: number
    try: number
    stop: number
  }
}

export class AnalyticsService {
  // Get comprehensive platform statistics
  static async getPlatformStats(): Promise<PlatformStats> {
    try {
      const supabase = createSupabaseClient()
      
      // Get basic counts
      const [
        { count: totalUsers },
        { count: totalTools },
        { count: totalReviews },
        { count: verifiedTesters },
        { count: activeTools },
        { count: pendingTools }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('tools').select('*', { count: 'exact', head: true }),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('users').select('*', { count: 'exact', head: true }).eq('is_verified_tester', true),
        supabase.from('tools').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('tools').select('*', { count: 'exact', head: true }).eq('status', 'pending')
      ])

      // Get total upvotes
      const { data: tools } = await supabase
        .from('tools')
        .select('upvotes')
      
      const totalUpvotes = tools?.reduce((sum, tool) => sum + (tool.upvotes || 0), 0) || 0

      // Get average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating')
        .eq('status', 'active')
      
      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
        : 0

      // Get top categories
      const { data: categoryStats } = await supabase
        .from('tools')
        .select('category')
        .eq('status', 'active')
      
      const categoryCounts: { [key: string]: number } = {}
      categoryStats?.forEach(tool => {
        const category = tool.category || 'Uncategorized'
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      })

      const topCategories = Object.entries(categoryCounts)
        .map(([name, count]) => ({
          name,
          count,
          percentage: (count / (totalTools || 1)) * 100
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Get verdict distribution
      const { data: verdictStats } = await supabase
        .from('tools')
        .select('verdict')
        .eq('status', 'active')
      
      const verdictDistribution = {
        keep: 0,
        try: 0,
        stop: 0,
        insufficient: 0
      }
      
      verdictStats?.forEach(tool => {
        if (tool.verdict) {
          verdictDistribution[tool.verdict as keyof typeof verdictDistribution]++
        } else {
          verdictDistribution.insufficient++
        }
      })

      // Get monthly growth (simplified - last 30 days vs previous 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      const sixtyDaysAgo = new Date()
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

      const [
        { count: recentUsers },
        { count: previousUsers },
        { count: recentTools },
        { count: previousTools },
        { count: recentReviews },
        { count: previousReviews }
      ] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('users').select('*', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgo.toISOString()).lt('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('tools').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('tools').select('*', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgo.toISOString()).lt('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).gte('created_at', thirtyDaysAgo.toISOString()),
        supabase.from('reviews').select('*', { count: 'exact', head: true }).gte('created_at', sixtyDaysAgo.toISOString()).lt('created_at', thirtyDaysAgo.toISOString())
      ])

      const monthlyGrowth = {
        users: (recentUsers || 0) - (previousUsers || 0),
        tools: (recentTools || 0) - (previousTools || 0),
        reviews: (recentReviews || 0) - (previousReviews || 0)
      }

      return {
        totalUsers: totalUsers || 0,
        totalTools: totalTools || 0,
        totalReviews: totalReviews || 0,
        totalUpvotes,
        verifiedTesters: verifiedTesters || 0,
        activeTools: activeTools || 0,
        pendingTools: pendingTools || 0,
        averageRating: Math.round(averageRating * 10) / 10,
        topCategories,
        verdictDistribution,
        monthlyGrowth
      }
    } catch (error) {
      console.error('Error getting platform stats:', error)
      throw error
    }
  }

  // Get analytics for a specific tool
  static async getToolAnalytics(toolId: string): Promise<ToolAnalytics | null> {
    try {
      const supabase = createSupabaseClient()
      
      // Get tool details
      const { data: tool, error: toolError } = await supabase
        .from('tools')
        .select('*')
        .eq('id', toolId)
        .single()

      if (toolError || !tool) return null

      // Get reviews for the tool
      const { data: reviews } = await supabase
        .from('reviews')
        .select(`
          id,
          rating,
          created_at,
          users!reviews_user_id_fkey (
            is_verified_tester,
            role
          )
        `)
        .eq('tool_id', toolId)
        .eq('status', 'active')
        .order('created_at', { ascending: true })

      // Calculate analytics
      const reviewCount = reviews?.length || 0
      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
        : 0

      // Get reviewer breakdown
      const reviewerBreakdown = {
        verified: reviews?.filter(r => (r.users as { is_verified_tester?: boolean })?.is_verified_tester).length || 0,
        admin: reviews?.filter(r => {
          const user = r.users as { role?: string };
          return user?.role === 'admin' || user?.role === 'super_admin';
        }).length || 0,
        community: reviews?.filter(r => {
          const user = r.users as { is_verified_tester?: boolean; role?: string };
          return !user?.is_verified_tester && user?.role !== 'admin' && user?.role !== 'super_admin';
        }).length || 0
      }

      // Get rating distribution
      const ratingDistribution = {
        '5': reviews?.filter(r => r.rating === 5).length || 0,
        '4': reviews?.filter(r => r.rating === 4).length || 0,
        '3': reviews?.filter(r => r.rating === 3).length || 0,
        '2': reviews?.filter(r => r.rating === 2).length || 0,
        '1': reviews?.filter(r => r.rating === 1).length || 0
      }

      // Get review trend (last 6 months)
      const sixMonthsAgo = new Date()
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

      const recentReviews = reviews?.filter(r => new Date(r.created_at) >= sixMonthsAgo) || []
      
      // Group by month
      const reviewTrend = Array.from({ length: 6 }, (_, i) => {
        const date = new Date()
        date.setMonth(date.getMonth() - i)
        const monthKey = date.toISOString().slice(0, 7) // YYYY-MM format
        
        const monthReviews = recentReviews.filter(r => 
          r.created_at.startsWith(monthKey)
        )
        
        return {
          date: monthKey,
          count: monthReviews.length,
          rating: monthReviews.length > 0
            ? monthReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / monthReviews.length
            : 0
        }
      }).reverse()

      // Get last review date
      const lastReviewDate = reviews && reviews.length > 0
        ? Math.max(...reviews.map(r => new Date(r.created_at).getTime()))
        : 0

      return {
        toolId,
        toolName: tool.name,
        viewCount: tool.view_count || 0,
        reviewCount,
        averageRating: Math.round(averageRating * 10) / 10,
        verdict: tool.verdict || 'insufficient_data',
        verdictConfidence: tool.verdict_confidence || 0,
        upvotes: tool.upvotes || 0,
        category: tool.category || 'Uncategorized',
        created_at: tool.created_at,
        lastReviewDate: lastReviewDate ? new Date(lastReviewDate).toISOString() : '',
        reviewTrend,
        reviewerBreakdown,
        ratingDistribution
      }
    } catch (error) {
      console.error('Error getting tool analytics:', error)
      return null
    }
  }

  // Generate comparison report for multiple tools
  static async getComparisonReport(toolIds: string[]): Promise<ComparisonReport | null> {
    try {
      const supabase = createSupabaseClient()
      
      if (toolIds.length < 2) return null

      // Get tools data
      const { data: tools, error: toolsError } = await supabase
        .from('tools')
        .select('*')
        .in('id', toolIds)

      if (toolsError || !tools) return null

      // Get reviews for all tools
      const { data: allReviews } = await supabase
        .from('reviews')
        .select(`
          id,
          tool_id,
          rating,
          pros,
          cons,
          created_at
        `)
        .in('tool_id', toolIds)
        .eq('status', 'active')

      // Process tools data
      const processedTools = tools.map(tool => {
        const toolReviews = allReviews?.filter(r => r.tool_id === tool.id) || []
        const averageRating = toolReviews.length > 0
          ? toolReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / toolReviews.length
          : 0

        return {
          id: tool.id,
          name: tool.name,
          category: tool.category || 'Uncategorized',
          averageRating: Math.round(averageRating * 10) / 10,
          totalReviews: toolReviews.length,
          verdict: tool.verdict || 'insufficient_data',
          verdictConfidence: tool.verdict_confidence || 0,
          pros: tool.pros || [],
          cons: tool.cons || [],
          features: tool.features || [],
          pricing: {
            model: tool.pricing_model || 'Unknown',
            range: tool.pricing_range || 'Unknown'
          }
        }
      })

      // Generate comparison data
      const ratingComparison = processedTools
        .map(tool => ({
          tool: tool.name,
          rating: tool.averageRating,
          rank: 0
        }))
        .sort((a, b) => b.rating - a.rating)
        .map((item, index) => ({ ...item, rank: index + 1 }))

      const reviewComparison = processedTools
        .map(tool => ({
          tool: tool.name,
          count: tool.totalReviews,
          rank: 0
        }))
        .sort((a, b) => b.count - a.count)
        .map((item, index) => ({ ...item, rank: index + 1 }))

      const verdictComparison = processedTools
        .map(tool => ({
          tool: tool.name,
          verdict: tool.verdict,
          confidence: tool.verdictConfidence,
          rank: 0
        }))
        .sort((a, b) => b.confidence - a.confidence)
        .map((item, index) => ({ ...item, rank: index + 1 }))

      // Find common and unique features
      const allFeatures = processedTools.flatMap(tool => tool.features)
      const featureCounts: { [feature: string]: number } = {}
      
      allFeatures.forEach((feature: string) => {
        featureCounts[feature] = (featureCounts[feature] || 0) + 1
      })

      const commonFeatures = Object.entries(featureCounts)
        .filter(([, count]) => count > 1)
        .map(([feature]) => feature)

      const uniqueFeatures: { [toolId: string]: string[] } = {}
      processedTools.forEach(tool => {
        uniqueFeatures[tool.id] = tool.features.filter((feature: string) => 
          !commonFeatures.includes(feature)
        )
      })

      return {
        toolIds,
        tools: processedTools,
        comparison: {
          ratingComparison,
          reviewComparison,
          verdictComparison,
          featureComparison: {
            commonFeatures,
            uniqueFeatures
          }
        }
      }
    } catch (error) {
      console.error('Error generating comparison report:', error)
      return null
    }
  }

  // Get industry-specific insights
  static async getIndustryInsights(industry: string): Promise<IndustryInsights | null> {
    try {
      const supabase = createSupabaseClient()
      
      // Get tools in the industry
      const { data: tools, error: toolsError } = await supabase
        .from('tools')
        .select('*')
        .eq('category', industry)
        .eq('status', 'active')

      if (toolsError || !tools) return null

      const totalTools = tools.length

      // Calculate average rating
      const { data: reviews } = await supabase
        .from('reviews')
        .select('rating, tool_id')
        .in('tool_id', tools.map(t => t.id))
        .eq('status', 'active')

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum, review) => sum + (review.rating || 0), 0) / reviews.length
        : 0

      // Get top tools
      const toolStats = tools.map(tool => {
        const toolReviews = reviews?.filter(r => r.tool_id === tool.id) || []
        const rating = toolReviews.length > 0
          ? toolReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / toolReviews.length
          : 0

        return {
          id: tool.id,
          name: tool.name,
          rating: Math.round(rating * 10) / 10,
          reviews: toolReviews.length,
          verdict: tool.verdict || 'insufficient_data'
        }
      })

      const topTools = toolStats
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 5)

      // Get pricing analysis
      const pricingAnalysis = {
        free: tools.filter(t => t.pricing_model === 'free').length,
        freemium: tools.filter(t => t.pricing_model === 'freemium').length,
        paid: tools.filter(t => t.pricing_model === 'paid').length,
        enterprise: tools.filter(t => t.pricing_model === 'enterprise').length
      }

      // Get verdict distribution
      const verdictDistribution = {
        keep: tools.filter(t => t.verdict === 'keep').length,
        try: tools.filter(t => t.verdict === 'try').length,
        stop: tools.filter(t => t.verdict === 'stop').length
      }

      return {
        industry,
        totalTools,
        averageRating: Math.round(averageRating * 10) / 10,
        topTools,
        categoryBreakdown: [], // Would need subcategories for this
        pricingAnalysis,
        verdictDistribution
      }
    } catch (error) {
      console.error('Error getting industry insights:', error)
      return null
    }
  }
}
