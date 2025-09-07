import { createSupabaseClient } from "@/utils/supabase-client";
import { User, Notification } from "@/types/app";

interface NotificationData {
  [key: string]: unknown;
}

interface ActivityData {
  [key: string]: unknown;
}

export class CommunityService {
  private static supabase = createSupabaseClient();

  // User Following System
  static async followUser(userIdToFollow: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_follows')
      .insert({
        following_id: userIdToFollow
      });

    if (error) throw error;
  }

  static async unfollowUser(userIdToUnfollow: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_follows')
      .delete()
      .eq('following_id', userIdToUnfollow);

    if (error) throw error;
  }

  static async getFollowers(userId: string, options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<{ followers: User[]; total: number }> {
    const { limit = 20, offset = 0 } = options;

    const { data, error, count } = await this.supabase
      .from('user_follows')
      .select(`
        follower:users!user_follows_follower_id_fkey(
          id, name, avatar_url, role, trust_score, created_at
        )
      `, { count: 'exact' })
      .eq('following_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    
    const followers = data?.map(item => item.follower).filter(Boolean) || [];
    return { followers: followers as unknown as User[], total: count || 0 };
  }

  static async getFollowing(userId: string, options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<{ following: User[]; total: number }> {
    const { limit = 20, offset = 0 } = options;

    const { data, error, count } = await this.supabase
      .from('user_follows')
      .select(`
        following:users!user_follows_following_id_fkey(
          id, name, avatar_url, role, trust_score, created_at
        )
      `, { count: 'exact' })
      .eq('follower_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    
    const following = data?.map(item => item.following).filter(Boolean) || [];
    return { following: following as unknown as User[], total: count || 0 };
  }

  static async isFollowing(userIdToCheck: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from('user_follows')
      .select('id')
      .eq('following_id', userIdToCheck)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  static async getFollowStats(userId: string): Promise<{
    followers: number;
    following: number;
  }> {
    const [followersResult, followingResult] = await Promise.all([
      this.getFollowers(userId, { limit: 1 }),
      this.getFollowing(userId, { limit: 1 })
    ]);

    return {
      followers: followersResult.total,
      following: followingResult.total
    };
  }

  // Notifications System
  static async getNotifications(options: {
    limit?: number;
    offset?: number;
    unreadOnly?: boolean;
  } = {}): Promise<{ notifications: Notification[]; total: number }> {
    const { limit = 20, offset = 0, unreadOnly = false } = options;

    let query = this.supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (unreadOnly) {
      query = query.is('read_at', null);
    }

    const { data, error, count } = await query
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { notifications: data || [], total: count || 0 };
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) throw error;
  }

  static async markAllNotificationsAsRead(): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .is('read_at', null);

    if (error) throw error;
  }

  static async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await this.supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  }

  static async getUnreadCount(): Promise<number> {
    const { count, error } = await this.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .is('read_at', null);

    if (error) throw error;
    return count || 0;
  }

  // Create notification using database function
  static async createNotification(notification: {
    userId: string;
    type: string;
    title: string;
    message: string;
    data?: NotificationData;
  }): Promise<string> {
    const { data, error } = await this.supabase
      .rpc('create_notification', {
        p_user_id: notification.userId,
        p_type: notification.type,
        p_title: notification.title,
        p_message: notification.message,
        p_data: notification.data || {}
      });

    if (error) throw error;
    return data;
  }

  // Community Guidelines
  static async getCommunityGuidelines(): Promise<{
    title: string;
    content: string;
    lastUpdated: string;
  }> {
    // This would typically come from a database or CMS
    // For now, returning static content
    return {
      title: "Community Guidelines",
      content: `
# Community Guidelines

## Be Respectful
- Treat all community members with respect and kindness
- Avoid personal attacks, harassment, or discriminatory language
- Be constructive in your feedback and discussions

## Stay On Topic
- Keep discussions relevant to SaaS tools, business, and technology
- Use appropriate categories for your posts
- Avoid spam, self-promotion, or off-topic content

## Share Quality Content
- Provide detailed, helpful information in your posts
- Cite sources when making claims
- Share your real experiences and insights

## Follow Platform Rules
- No illegal content or activities
- Respect intellectual property rights
- Follow platform terms of service

## Help Others
- Answer questions when you can
- Share your expertise and experiences
- Be patient with newcomers

## Report Issues
- Report inappropriate content or behavior
- Help maintain a positive community environment
- Contact moderators for serious issues

Violation of these guidelines may result in content removal, warnings, or account suspension.
      `,
      lastUpdated: new Date().toISOString()
    };
  }

  // User Activity Feed
  static async getUserActivityFeed(userId: string, options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<{
    activities: Array<{
      id: string;
      type: 'discussion' | 'reply' | 'review' | 'follow' | 'vote';
      title: string;
      description: string;
      timestamp: string;
      data: ActivityData;
    }>;
    total: number;
  }> {
    const { limit = 20, offset = 0 } = options;

    // Get user's recent activities from various tables
    const [discussions, replies, reviews, follows] = await Promise.all([
      this.supabase
        .from('discussions')
        .select('id, title, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit),
      
      this.supabase
        .from('discussion_replies')
        .select('id, content, created_at, discussion:discussions(title)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit),
      
      this.supabase
        .from('reviews')
        .select('id, title, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit),
      
      this.supabase
        .from('user_follows')
        .select('id, created_at, following_id')
        .eq('follower_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
    ]);

    // Combine and sort activities
    const activities = [
      ...discussions.data?.map(d => ({
        id: d.id,
        type: 'discussion' as const,
        title: d.title,
        description: `Created a new discussion`,
        timestamp: d.created_at,
        data: d
      })) || [],
      
      ...replies.data?.map(r => ({
        id: r.id,
        type: 'reply' as const,
        title: (r.discussion as { title?: string })?.title || 'Discussion',
        description: `Replied to a discussion`,
        timestamp: r.created_at,
        data: r
      })) || [],
      
      ...reviews.data?.map(r => ({
        id: r.id,
        type: 'review' as const,
        title: r.title,
        description: `Wrote a review`,
        timestamp: r.created_at,
        data: r
      })) || [],
      
      ...follows.data?.map(f => ({
        id: f.id,
        type: 'follow' as const,
        title: 'User',
        description: `Started following`,
        timestamp: f.created_at,
        data: f
      })) || []
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      activities: activities.slice(offset, offset + limit),
      total: activities.length
    };
  }

  // Search Users
  static async searchUsers(query: string, options: {
    limit?: number;
    offset?: number;
  } = {}): Promise<{ users: User[]; total: number }> {
    const { limit = 20, offset = 0 } = options;

    const { data, error, count } = await this.supabase
      .from('users')
      .select('id, name, avatar_url, role, trust_score, created_at', { count: 'exact' })
      .or(`name.ilike.%${query}%`)
      .order('trust_score', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return { users: (data || []) as unknown as User[], total: count || 0 };
  }

  // Get User Profile with Stats
  static async getUserProfile(userId: string): Promise<{
    user: User;
    stats: {
      discussions: number;
      replies: number;
      reviews: number;
      followers: number;
      following: number;
      trustScore: number;
    };
  }> {
    const [userResult, statsResult] = await Promise.all([
      this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single(),
      
      this.supabase
        .rpc('get_user_discussion_stats', { p_user_id: userId })
    ]);

    if (userResult.error) throw userResult.error;
    if (statsResult.error) throw statsResult.error;

    const stats = statsResult.data?.[0] || {};

    return {
      user: userResult.data,
      stats: {
        discussions: stats.total_discussions || 0,
        replies: stats.total_replies || 0,
        reviews: 0, // Would need to be calculated separately
        followers: stats.total_followers || 0,
        following: stats.total_following || 0,
        trustScore: userResult.data.trust_score || 0
      }
    };
  }
}
