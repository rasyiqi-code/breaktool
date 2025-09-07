export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          role: 'user' | 'admin' | 'verified_tester' | 'super_admin' | 'vendor'
          trust_score: number
          is_verified_tester: boolean
          expertise: string[] | null
          company: string | null
          linkedin_url: string | null
          website_url: string | null
          bio: string | null
          location: string | null
          verification_status: 'pending' | 'approved' | 'rejected'
          verification_data: Record<string, unknown> | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'verified_tester' | 'super_admin' | 'vendor'
          trust_score?: number
          is_verified_tester?: boolean
          expertise?: string[] | null
          company?: string | null
          linkedin_url?: string | null
          website_url?: string | null
          bio?: string | null
          location?: string | null
          verification_status?: 'pending' | 'approved' | 'rejected'
          verification_data?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          role?: 'user' | 'admin' | 'verified_tester' | 'super_admin' | 'vendor'
          trust_score?: number
          is_verified_tester?: boolean
          expertise?: string[] | null
          company?: string | null
          linkedin_url?: string | null
          website_url?: string | null
          bio?: string | null
          location?: string | null
          verification_status?: 'pending' | 'approved' | 'rejected'
          verification_data?: Record<string, unknown> | null
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
      }
      tools: {
        Row: {
          id: string
          name: string
          slug: string
          description: string | null
          long_description: string | null
          website: string
          logo_url: string | null
          category_id: string | null
          pricing_model: string | null
          starting_price: number | null
          pricing_details: Record<string, unknown> | null
          verdict: 'keep' | 'try' | 'stop' | null
          verdict_updated_at: string | null
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
          submitted_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          description?: string | null
          long_description?: string | null
          website: string
          logo_url?: string | null
          category_id?: string | null
          pricing_model?: string | null
          starting_price?: number | null
          pricing_details?: Record<string, unknown> | null
          verdict?: 'PERTAHANKAN' | 'COBA' | 'HENTIKAN' | null
          verdict_updated_at?: string | null
          upvotes?: number
          total_reviews?: number
          verified_reviews?: number
          admin_reviews?: number
          overall_score?: number
          value_score?: number
          usage_score?: number
          integration_score?: number
          featured?: boolean
          status?: 'active' | 'archived' | 'pending'
          submitted_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          description?: string | null
          long_description?: string | null
          website?: string
          logo_url?: string | null
          category_id?: string | null
          pricing_model?: string | null
          starting_price?: number | null
          pricing_details?: Record<string, unknown> | null
          verdict?: 'PERTAHANKAN' | 'COBA' | 'HENTIKAN' | null
          verdict_updated_at?: string | null
          upvotes?: number
          total_reviews?: number
          verified_reviews?: number
          admin_reviews?: number
          overall_score?: number
          value_score?: number
          usage_score?: number
          integration_score?: number
          featured?: boolean
          status?: 'active' | 'archived' | 'pending'
          submitted_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          tool_id: string
          user_id: string
          type: 'admin' | 'verified' | 'community'
          overall_score: number | null
          value_score: number | null
          usage_score: number | null
          integration_score: number | null
          title: string
          content: string
          pain_points: string | null
          setup_time: string | null
          roi_story: string | null
          usage_recommendations: string | null
          weaknesses: string | null
          pros: string[] | null
          cons: string[] | null
          recommendation: 'keep' | 'try' | 'stop' | null
          use_case: string | null
          company_size: string | null
          industry: string | null
          usage_duration: string | null
          helpful_votes: number
          total_votes: number
          status: 'active' | 'archived' | 'flagged'
          featured: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tool_id: string
          user_id: string
          type: 'admin' | 'verified' | 'community'
          overall_score?: number | null
          value_score?: number | null
          usage_score?: number | null
          integration_score?: number | null
          title: string
          content: string
          pain_points?: string | null
          setup_time?: string | null
          roi_story?: string | null
          usage_recommendations?: string | null
          weaknesses?: string | null
          pros?: string[] | null
          cons?: string[] | null
          recommendation?: 'PERTAHANKAN' | 'COBA' | 'HENTIKAN' | null
          use_case?: string | null
          company_size?: string | null
          industry?: string | null
          usage_duration?: string | null
          helpful_votes?: number
          total_votes?: number
          status?: 'active' | 'archived' | 'flagged'
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tool_id?: string
          user_id?: string
          type?: 'admin' | 'verified' | 'community'
          overall_score?: number | null
          value_score?: number | null
          usage_score?: number | null
          integration_score?: number | null
          title?: string
          content?: string
          pain_points?: string | null
          setup_time?: string | null
          roi_story?: string | null
          usage_recommendations?: string | null
          weaknesses?: string | null
          pros?: string[] | null
          cons?: string[] | null
          recommendation?: 'PERTAHANKAN' | 'COBA' | 'HENTIKAN' | null
          use_case?: string | null
          company_size?: string | null
          industry?: string | null
          usage_duration?: string | null
          helpful_votes?: number
          total_votes?: number
          status?: 'active' | 'archived' | 'flagged'
          featured?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      review_votes: {
        Row: {
          id: string
          review_id: string
          user_id: string
          vote_type: 'helpful' | 'not_helpful'
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          vote_type: 'helpful' | 'not_helpful'
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          vote_type?: 'helpful' | 'not_helpful'
          created_at?: string
        }
      }
      tool_upvotes: {
        Row: {
          id: string
          tool_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          tool_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          tool_id?: string
          user_id?: string
          created_at?: string
        }
      }
      verification_requests: {
        Row: {
          id: string
          user_id: string
          expertise_areas: string[] | null
          company: string | null
          job_title: string | null
          linkedin_url: string | null
          website_url: string | null
          portfolio_url: string | null
          motivation: string | null
          experience_years: number | null
          previous_reviews: string | null
          status: 'pending' | 'approved' | 'rejected'
          reviewed_by: string | null
          review_notes: string | null
          reviewed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          expertise_areas?: string[] | null
          company?: string | null
          job_title?: string | null
          linkedin_url?: string | null
          website_url?: string | null
          portfolio_url?: string | null
          motivation?: string | null
          experience_years?: number | null
          previous_reviews?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          expertise_areas?: string[] | null
          company?: string | null
          job_title?: string | null
          linkedin_url?: string | null
          website_url?: string | null
          portfolio_url?: string | null
          motivation?: string | null
          experience_years?: number | null
          previous_reviews?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tool_submissions: {
        Row: {
          id: string
          submitted_by: string | null
          name: string
          website: string
          description: string | null
          category_id: string | null
          logo_url: string | null
          submitter_relationship: string | null
          additional_info: string | null
          status: 'pending' | 'approved' | 'rejected'
          reviewed_by: string | null
          review_notes: string | null
          reviewed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          submitted_by?: string | null
          name: string
          website: string
          description?: string | null
          category_id?: string | null
          logo_url?: string | null
          submitter_relationship?: string | null
          additional_info?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          submitted_by?: string | null
          name?: string
          website?: string
          description?: string | null
          category_id?: string | null
          logo_url?: string | null
          submitter_relationship?: string | null
          additional_info?: string | null
          status?: 'pending' | 'approved' | 'rejected'
          reviewed_by?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types for common use cases
export type User = Database['public']['Tables']['users']['Row']
export type Tool = Database['public']['Tables']['tools']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type VerificationRequest = Database['public']['Tables']['verification_requests']['Row']
export type ToolSubmission = Database['public']['Tables']['tool_submissions']['Row']

// Extended types with relationships
export type ToolWithCategory = Tool & {
  category: Category | null
}

export type ReviewWithUser = Review & {
  user: User
}

export type ToolWithDetails = Tool & {
  category: Category | null
  reviews: ReviewWithUser[]
}

// Verdict type for consistency
export type Verdict = 'keep' | 'try' | 'stop'

// User roles
export type UserRole = 'user' | 'admin' | 'verified_tester' | 'super_admin' | 'vendor'

// Review types
export type ReviewType = 'admin' | 'verified' | 'community'
