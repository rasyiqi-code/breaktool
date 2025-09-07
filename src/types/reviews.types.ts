// Reviews Types
export interface Review {
  id: string
  tool_id: string
  user_id: string
  rating: number
  title: string
  content: string
  pros: string[]
  cons: string[]
  verdict: 'recommended' | 'not_recommended' | 'neutral'
  trust_score: number
  created_at: string
  updated_at: string
  status: 'published' | 'pending' | 'rejected'
  helpful_votes: number
  total_votes: number
}

export interface ReviewWithUser extends Review {
  user: {
    id: string
    display_name: string
    avatar_url?: string
    trust_score: number
  }
}

export interface ReviewAnalytics {
  total_reviews: number
  average_rating: number
  rating_distribution: {
    [key: number]: number
  }
  verdict_distribution: {
    recommended: number
    not_recommended: number
    neutral: number
  }
  trust_score_average: number
  helpful_votes_total: number
}

export interface ReviewVote {
  id: string
  review_id: string
  user_id: string
  vote_type: 'helpful' | 'not_helpful'
  created_at: string
}

export interface TrustScore {
  id: string
  user_id: string
  score: number
  factors: {
    review_count: number
    helpful_votes: number
    account_age: number
    verified_email: boolean
  }
  created_at: string
  updated_at: string
}

export interface VerdictAggregation {
  tool_id: string
  total_reviews: number
  recommended_count: number
  not_recommended_count: number
  neutral_count: number
  final_verdict: 'recommended' | 'not_recommended' | 'neutral'
  confidence_score: number
  last_updated: string
}
