import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  billing_cycle: 'monthly' | 'yearly';
  features: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'canceled' | 'expired' | 'pending';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  canceled_at?: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  created_at: string;
  updated_at: string;
  plan?: SubscriptionPlan;
}

export interface SubscriptionFeature {
  id: string;
  name: string;
  slug: string;
  description: string;
  feature_type: 'boolean' | 'numeric' | 'text';
  default_value: unknown;
  is_active: boolean;
  created_at: string;
}

export interface UserSubscriptionWithPlan {
  plan_id: string;
  plan_name: string;
  plan_slug: string;
  status: string;
  current_period_end: string;
  features: Record<string, unknown>;
}

export interface FeatureLimits {
  feature_slug: string;
  limit_value: number;
}

export class SubscriptionService {
  /**
   * Get all active subscription plans
   */
  static async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
  }

  /**
   * Get a specific subscription plan by slug
   */
  static async getSubscriptionPlan(slug: string): Promise<SubscriptionPlan | null> {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching subscription plan:', error);
      return null;
    }
  }

  /**
   * Get user's current subscription using database function
   */
  static async getUserSubscription(userId: string): Promise<UserSubscriptionWithPlan | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_subscription', { user_id_param: userId });

      if (error) throw error;
      return data?.[0] || null;
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return null;
    }
  }

  /**
   * Get user's subscription with full details
   */
  static async getUserSubscriptionDetails(userId: string): Promise<UserSubscription | null> {
    try {
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:subscription_plans(*)
        `)
        .eq('user_id', userId)
        .eq('status', 'active')
        .gte('current_period_end', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user subscription details:', error);
      return null;
    }
  }

  /**
   * Check if user has access to a specific feature
   */
  static async hasFeatureAccess(userId: string, featureSlug: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('has_feature_access', { 
          user_id_param: userId, 
          feature_slug_param: featureSlug 
        });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Error checking feature access:', error);
      return false;
    }
  }

  /**
   * Get user's feature limits
   */
  static async getUserFeatureLimits(userId: string): Promise<FeatureLimits[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_feature_limits', { user_id_param: userId });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching user feature limits:', error);
      return [];
    }
  }

  /**
   * Create a new subscription for a user
   */
  static async createSubscription(
    userId: string,
    planId: string,
    stripeSubscriptionId?: string,
    stripeCustomerId?: string
  ): Promise<UserSubscription> {
    try {
      // Get the plan to determine billing period
      const plan = await this.getSubscriptionPlan(planId);
      if (!plan) {
        throw new Error('Plan not found');
      }

      const now = new Date();
      const periodEnd = new Date(now);
      
      // Set period end based on billing cycle
      if (plan.billing_cycle === 'monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else if (plan.billing_cycle === 'yearly') {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          plan_id: planId,
          status: 'active',
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          stripe_subscription_id: stripeSubscriptionId,
          stripe_customer_id: stripeCustomerId
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  }

  /**
   * Cancel a user's subscription
   */
  static async cancelSubscription(userId: string, cancelAtPeriodEnd: boolean = true): Promise<void> {
    try {
      const updateData: Record<string, unknown> = {
        cancel_at_period_end: cancelAtPeriodEnd,
        updated_at: new Date().toISOString()
      };

      if (!cancelAtPeriodEnd) {
        updateData.status = 'canceled';
        updateData.canceled_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('user_subscriptions')
        .update(updateData)
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  }

  /**
   * Update subscription status (for webhook handling)
   */
  static async updateSubscriptionStatus(
    stripeSubscriptionId: string,
    status: 'active' | 'canceled' | 'expired' | 'pending'
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_subscriptions')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('stripe_subscription_id', stripeSubscriptionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw error;
    }
  }

  /**
   * Get subscription usage statistics
   */
  static async getSubscriptionStats(): Promise<{
    totalSubscriptions: number;
    activeSubscriptions: number;
    canceledSubscriptions: number;
    revenue: number;
  }> {
    try {
      const { data: subscriptions, error } = await supabase
        .from('user_subscriptions')
        .select(`
          status,
          plan:subscription_plans(price, billing_cycle)
        `);

      if (error) throw error;

      const stats = {
        totalSubscriptions: subscriptions?.length || 0,
        activeSubscriptions: subscriptions?.filter(s => s.status === 'active').length || 0,
        canceledSubscriptions: subscriptions?.filter(s => s.status === 'canceled').length || 0,
        revenue: 0
      };

      // Calculate revenue from active subscriptions
      subscriptions?.forEach(sub => {
        if (sub.status === 'active' && sub.plan) {
          // Handle the case where plan is an array from Supabase join
          const planData = Array.isArray(sub.plan) ? sub.plan[0] : sub.plan;
          if (planData && planData.billing_cycle && planData.price) {
            if (planData.billing_cycle === 'monthly') {
              stats.revenue += planData.price;
            } else if (planData.billing_cycle === 'yearly') {
              stats.revenue += planData.price / 12; // Monthly equivalent
            }
          }
        }
      });

      return stats;
    } catch (error) {
      console.error('Error fetching subscription stats:', error);
      throw error;
    }
  }

  /**
   * Check if user can perform an action based on their limits
   */
  static async checkUserLimit(
    userId: string,
    featureSlug: string,
    currentUsage: number
  ): Promise<{ allowed: boolean; limit: number; remaining: number }> {
    try {
      const limits = await this.getUserFeatureLimits(userId);
      const limit = limits.find(l => l.feature_slug === featureSlug);
      
      if (!limit) {
        return { allowed: false, limit: 0, remaining: 0 };
      }

      const remaining = Math.max(0, limit.limit_value - currentUsage);
      const allowed = remaining > 0;

      return { allowed, limit: limit.limit_value, remaining };
    } catch (error) {
      console.error('Error checking user limit:', error);
      return { allowed: false, limit: 0, remaining: 0 };
    }
  }

  /**
   * Get all subscription features
   */
  static async getSubscriptionFeatures(): Promise<SubscriptionFeature[]> {
    try {
      const { data, error } = await supabase
        .from('subscription_features')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching subscription features:', error);
      throw error;
    }
  }
}
