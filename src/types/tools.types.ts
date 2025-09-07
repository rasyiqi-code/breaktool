// Tools Types
import { Review } from './reviews.types'

export interface Tool {
  id: string
  name: string
  description: string
  url: string
  logo_url?: string
  category_id: string
  pricing_model: string
  features: string[]
  pros: string[]
  cons: string[]
  created_at: string
  updated_at: string
  status: 'active' | 'inactive' | 'pending'
  featured: boolean
  featured_review_id?: string
  admin_review_id?: string
  trust_score: number
  verdict: 'recommended' | 'not_recommended' | 'neutral'
  total_reviews: number
  average_rating: number
  slug: string
}

export interface Category {
  id: string
  name: string
  description: string
  slug: string
  icon: string
  color: string
  created_at: string
  updated_at: string
}

// TODO: Featured placement feature - not implemented yet
// export interface FeaturedPlacement {
//   id: string
//   tool_id: string
//   vendor_email: string
//   position: string
//   start_date: string
//   end_date: string
//   status: 'active' | 'inactive' | 'pending'
//   created_at: string
//   updated_at: string
// }

export interface ToolWithCategory extends Tool {
  category: Category
}

export interface ToolWithReviews extends Tool {
  reviews: Review[]
  category: Category
}

export interface ToolSubmission {
  name: string
  description: string
  url: string
  category_id: string
  pricing_model: string
  features: string[]
  pros: string[]
  cons: string[]
}
