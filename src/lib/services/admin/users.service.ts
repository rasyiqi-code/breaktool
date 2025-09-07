import { supabase } from '@/lib/supabase'
import { createSupabaseClient } from '@/utils/supabase-client'
import type { User, UserRole, VerificationRequest } from '@/types/app'

export class UsersService {
  // Get pending verification requests (for admin)
  static async getPendingVerificationRequests(): Promise<VerificationRequest[]> {
    try {
      const { data, error } = await supabase
        .from('verification_requests')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as VerificationRequest[] || [];
    } catch (error) {
      console.error('Error fetching pending verification requests:', error);
      return [];
    }
  }

  // Submit verification request
  static async submitVerificationRequest(request: {
    expertise_areas?: string[]
    company?: string
    job_title?: string
    linkedin_url?: string
    website_url?: string
    portfolio_url?: string
    motivation?: string
    experience_years?: number
    previous_reviews?: string
  }): Promise<VerificationRequest> {
    try {
      // Use RLS-enabled Supabase client
      const supabaseClient = createSupabaseClient();

      const { data, error } = await supabaseClient
        .from('verification_requests')
        .insert({
          ...request,
          status: 'pending'
          // user_id will be automatically set by RLS using auth.uid()
        })
        .select()
        .single();

      if (error) throw error;
      return data as VerificationRequest;
    } catch (error) {
      console.error('Error submitting verification request:', error);
      throw error;
    }
  }

  // Approve verification request (admin)
  static async approveVerificationRequest(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin' // TODO: Get actual admin user ID
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error approving verification request:', error);
      throw error;
    }
  }

  // Reject verification request (admin)
  static async rejectVerificationRequest(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('verification_requests')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: 'admin' // TODO: Get actual admin user ID
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error rejecting verification request:', error);
      throw error;
    }
  }

  // Get user by ID
  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data as User
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data as User
  }

  // Create new user
  static async createUser(user: {
    id: string
    email: string
    name?: string
    avatar_url?: string
  }): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        ...user,
        role: 'user',
        trust_score: 0,
        is_verified_tester: false,
        verification_status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return data as User
  }

  // Update user profile
  static async updateUser(id: string, updates: {
    name?: string
    avatar_url?: string
    bio?: string
    company?: string
    linkedin_url?: string
    website_url?: string
    location?: string
    expertise?: string[]
  }): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return data as User
  }

  // Update user role (admin only)
  static async updateUserRole(id: string, role: UserRole): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ role })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return data as User
  }





  // Get verification request by user ID
  static async getVerificationRequest(userId: string): Promise<VerificationRequest | null> {
    const { data, error } = await supabase
      .from('verification_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null // Not found
      throw error
    }

    return data as VerificationRequest
  }



  // Calculate and update user trust score
  static async updateUserTrustScore(userId: string): Promise<void> {
    // This would be implemented based on your trust score algorithm
    // For now, we'll use a simple calculation based on reviews and votes
    await supabase.rpc('calculate_user_trust_score', { user_id: userId })
  }

  // Get user stats
  static async getUserStats(userId: string): Promise<{
    reviewCount: number
    helpfulVotes: number
    toolsUpvoted: number
    trustScore: number
  }> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        trust_score,
        reviews:reviews(count),
        helpful_votes_received,
        tool_upvotes:tool_upvotes(count)
      `)
      .eq('id', userId)
      .single()

    if (error) throw error

    return {
      reviewCount: data.reviews?.[0]?.count || 0,
      helpfulVotes: data.helpful_votes_received || 0,
      toolsUpvoted: data.tool_upvotes?.[0]?.count || 0,
      trustScore: data.trust_score || 0
    }
  }
}
