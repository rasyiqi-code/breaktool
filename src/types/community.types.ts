// Community Types
export interface Discussion {
  id: string
  title: string
  content: string
  user_id: string
  category_id: string
  created_at: string
  updated_at: string
  status: 'active' | 'closed' | 'deleted'
  view_count: number
  reply_count: number
  upvotes: number
  downvotes: number
  is_pinned: boolean
  is_featured: boolean
}

export interface DiscussionWithUser extends Discussion {
  user: {
    id: string
    display_name: string
    avatar_url?: string
    trust_score: number
  }
  category: {
    id: string
    name: string
    slug: string
  }
}

export interface DiscussionReply {
  id: string
  discussion_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
  status: 'active' | 'deleted'
  upvotes: number
  downvotes: number
  is_solution: boolean
}

export interface DiscussionReplyWithUser extends DiscussionReply {
  user: {
    id: string
    display_name: string
    avatar_url?: string
    trust_score: number
  }
}

export interface DiscussionCategory {
  id: string
  name: string
  description: string
  slug: string
  icon: string
  color: string
  created_at: string
  updated_at: string
}

export interface DiscussionVote {
  id: string
  discussion_id: string
  user_id: string
  vote_type: 'upvote' | 'downvote'
  created_at: string
}

export interface DiscussionBookmark {
  id: string
  discussion_id: string
  user_id: string
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'discussion_reply' | 'discussion_vote' | 'review_like' | 'review_reply' | 'system'
  title: string
  message: string
  data: Record<string, unknown>
  read_at?: string
  created_at: string
}

export interface UserFollow {
  id: string
  follower_id: string
  following_id: string
  created_at: string
}
