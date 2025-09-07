// Admin Types
export interface User {
  id: string
  email: string
  display_name: string
  avatar_url?: string
  role: 'user' | 'admin' | 'verified_tester' | 'super_admin' | 'vendor' | 'moderator'
  trust_score: number
  created_at: string
  updated_at: string
  last_login?: string
  is_verified: boolean
  is_banned: boolean
  ban_reason?: string
}

export interface UserStats {
  total_users: number
  active_users: number
  new_users_this_month: number
  verified_testers: number
  admins: number
  banned_users: number
}

export interface AdminAnalytics {
  total_tools: number
  total_reviews: number
  total_discussions: number
  total_users: number
  tools_by_category: {
    [category: string]: number
  }
  reviews_by_month: {
    [month: string]: number
  }
  user_growth: {
    [month: string]: number
  }
  top_tools: {
    tool_id: string
    name: string
    review_count: number
    average_rating: number
  }[]
}

export interface AdminStats {
  total_submissions: number
  pending_submissions: number
  approved_submissions: number
  rejected_submissions: number
  active_subscriptions: number
  revenue_this_month: number
  revenue_total: number
}

export interface UserManagementAction {
  user_id: string
  action: 'ban' | 'unban' | 'promote' | 'demote' | 'verify_tester'
  reason?: string
  admin_id: string
  created_at: string
}

export interface SystemLog {
  id: string
  level: 'info' | 'warning' | 'error'
  message: string
  context: Record<string, unknown>
  created_at: string
  user_id?: string
}
