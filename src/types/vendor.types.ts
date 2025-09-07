// Vendor Types
export interface VendorSubmission {
  id: string
  tool_name: string
  description: string
  url: string
  category_id: string
  vendor_email: string
  vendor_name: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface VendorStats {
  total_submissions: number
  approved_submissions: number
  rejected_submissions: number
  pending_submissions: number
  total_revenue: number
  revenue_this_month: number
}

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  currency: string
  interval: 'monthly' | 'yearly'
  features: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string
  status: 'active' | 'cancelled' | 'expired'
  start_date: string
  end_date: string
  created_at: string
  updated_at: string
}

export interface VendorCampaign {
  id: string
  vendor_email: string
  tool_id: string
  campaign_type: 'promotion'
  budget: number
  start_date: string
  end_date: string
  status: 'active' | 'paused' | 'completed'
  impressions: number
  clicks: number
  conversions: number
  created_at: string
  updated_at: string
}

export interface VendorPayment {
  id: string
  vendor_email: string
  amount: number
  currency: string
  payment_method: string
  status: 'pending' | 'completed' | 'failed'
  description: string
  created_at: string
  updated_at: string
}
