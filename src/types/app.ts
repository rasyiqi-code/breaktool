// BreakTool Application Types
// These are simplified types for the application layer

export interface Tool {
  id: string
  name: string
  slug: string
  description?: string
  long_description?: string
  website: string
  logo_url?: string
  category_id?: string
  pricing_model?: 'free' | 'freemium' | 'paid' | 'enterprise'
  starting_price?: number
  pricing_details?: Record<string, unknown>
  verdict?: 'keep' | 'try' | 'stop'
  verdict_updated_at?: string
  upvotes: number
  total_reviews: number
  verified_reviews: number
  admin_reviews: number
  overall_score: number
  value_score: number
  usage_score: number
  integration_score: number
  featured: boolean
  status: 'active' | 'archived' | 'pending'
  submitted_by?: string
  view_count: number
  tags: string[]
  created_at: string
  updated_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  icon?: string
  color?: string
  created_at: string
}

export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  role: 'user' | 'verified_tester' | 'admin' | 'super_admin' | 'vendor'
  trust_score: number
  badges?: string[]
  bio?: string
  company?: string
  linkedin_url?: string
  website_url?: string
  location?: string
  expertise?: string[]
  is_verified_tester: boolean
  verification_status: 'pending' | 'approved' | 'rejected'
  verified_at?: string
  verified_by?: string
  vendor_status?: 'pending' | 'approved' | 'rejected'
  vendor_approved_at?: string
  vendor_approved_by?: string
  helpful_votes_received: number
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  tool_id: string
  user_id: string
  type: 'admin' | 'verified_tester' | 'community'
  title: string
  content: string
  overall_score?: number
  value_score?: number
  usage_score?: number
  integration_score?: number
  pain_points?: string
  setup_time?: string
  roi_story?: string
  usage_recommendations?: string
  weaknesses?: string
  pros?: string[]
  cons?: string[]
  recommendation?: 'keep' | 'try' | 'stop'
  use_case?: string
  company_size?: string
  industry?: string
  usage_duration?: string
  helpful_votes: number
  total_votes: number
  status: 'active' | 'inactive' | 'pending'
  featured: boolean
  created_at: string
  updated_at: string
}

export interface ReviewVote {
  id: string
  review_id: string
  user_id: string
  vote_type: 'helpful' | 'not_helpful'
  created_at: string
}

export interface ToolUpvote {
  id: string
  tool_id: string
  user_id: string
  created_at: string
}

export interface ToolSubmission {
  id: string
  name: string
  website: string
  description?: string
  category_id?: string
  logo_url?: string
  submitted_by?: string
  submitter_relationship?: string
  additional_info?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string
  reviewed_at?: string
  review_notes?: string
  created_at: string
  updated_at: string
}

export interface VerificationRequest {
  id: string
  user_id: string
  expertise_areas?: string[]
  company?: string
  job_title?: string
  linkedin_url?: string
  website_url?: string
  portfolio_url?: string
  motivation?: string
  experience_years?: number
  previous_reviews?: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string
  reviewed_at?: string
  review_notes?: string
  created_at: string
  updated_at: string
}

export interface VendorApplication {
  id: string
  user_id: string
  company_name: string
  company_size: string
  industry: string
  website_url: string
  linkedin_url?: string
  company_description: string
  products_services: string
  target_audience: string
  business_model: string
  motivation: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_by?: string
  reviewed_at?: string
  review_notes?: string
  created_at: string
  updated_at: string
}

// Composite Types
export interface ToolWithCategory extends Tool {
  category?: Category
}

export interface ToolWithDetails extends Tool {
  category?: Category
  reviews?: ReviewWithUser[]
}

export interface ReviewWithUser extends Review {
  user?: User
  tool?: {
    name: string
    slug: string
    logo_url?: string
  }
}

export interface UserWithStats extends User {
  reviewCount: number
  helpfulVotes: number
  toolsUpvoted: number
}

// Enums
export type ToolStatus = 'active' | 'archived' | 'pending'
export type PricingModel = 'free' | 'freemium' | 'paid' | 'enterprise'
export type ReviewType = 'admin' | 'verified_tester' | 'community'
export type UserRole = 'user' | 'verified_tester' | 'admin' | 'super_admin' | 'vendor'
export type Verdict = 'keep' | 'try' | 'stop'
export type ReviewStatus = 'active' | 'inactive' | 'pending'
export type VoteType = 'helpful' | 'not_helpful'
export type VerificationStatus = 'pending' | 'approved' | 'rejected'

// API Response Types
export interface PaginatedResponse<T> {
  data: T[]
  totalCount: number
  totalPages: number
  currentPage: number
  hasMore: boolean
}

export type ToolsResponse = PaginatedResponse<ToolWithCategory>

export type ReviewsResponse = PaginatedResponse<ReviewWithUser>

// Stats Types
export interface PlatformStats {
  totalTools: number
  totalReviews: number
  verifiedTesters: number
  totalUsers: number
}

export interface ToolStats {
  upvotes: number
  totalReviews: number
  verifiedReviews: number
  adminReviews: number
  averageScore: number
}

export interface UserStats {
  reviewCount: number
  helpfulVotes: number
  toolsUpvoted: number
  trustScore: number
}

// Community Types
export interface Notification {
  id: string
  user_id: string
  type: 'discussion_reply' | 'discussion_mention' | 'follow' | 'review_like' | 'review_reply' | 'tool_approved' | 'tester_approved' | 'subscription_expiring' | 'affiliate_commission' | 'lead_generated'
  title: string
  message: string
  data?: Record<string, unknown>
  read_at?: string
  created_at: string
}

export interface DiscussionCategory {
  id: string
  name: string
  description?: string
  slug: string
  icon: string
  color: string
  discussion_count: number
  created_at: string
}

export interface Discussion {
  id: string
  title: string
  content: string
  user_id: string
  category: string
  category_id?: string
  tags: string[]
  status: 'active' | 'closed' | 'archived'
  is_pinned: boolean
  is_featured: boolean
  view_count: number
  reply_count: number
  last_reply_at?: string
  created_at: string
  updated_at: string
  user?: User
  category_details?: DiscussionCategory
}

export interface DiscussionReply {
  id: string
  discussion_id: string
  user_id: string
  content: string
  parent_reply_id?: string
  is_solution: boolean
  helpful_votes: number
  total_votes: number
  created_at: string
  updated_at: string
  user?: User
  parent_reply?: DiscussionReply
}

export interface DiscussionVote {
  id: string
  discussion_id?: string
  reply_id?: string
  user_id: string
  vote_type: 'upvote' | 'downvote'
  created_at: string
}

export interface DiscussionBookmark {
  id: string
  user_id: string
  discussion_id: string
  created_at: string
  discussion?: Discussion
}

export interface UserFollow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
  follower?: User
  following?: User
}
