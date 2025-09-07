import { supabase } from '@/lib/supabase'

interface VisitorData {
  ip?: string;
  userAgent?: string;
  referrer?: string;
  [key: string]: unknown;
}

interface TesterContactRequest {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  [key: string]: unknown;
}

export interface AffiliateProgram {
  id: string
  name: string
  description: string
  commission_rate: number
  requirements: string
  status: 'active' | 'inactive'
  created_at: string
}

export interface AffiliatePartner {
  id: string
  user_id: string
  program_id: string
  status: 'pending' | 'approved' | 'rejected'
  commission_earned: number
  total_referrals: number
  created_at: string
}

export interface AffiliateConversion {
  id: string
  partner_id: string
  program_id: string
  referral_code: string
  conversion_value: number
  commission_amount: number
  status: 'pending' | 'approved' | 'paid'
  created_at: string
}

export interface AffiliatePayout {
  id: string
  partner_id: string
  amount: number
  status: 'pending' | 'processed' | 'paid'
  payment_method: string
  created_at: string
}

export interface LeadData {
  id: string
  email: string
  name: string
  company: string
  phone?: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'converted'
  created_at: string
}

export class AffiliateLeadGenerationService {
  private supabase = supabase

  // Affiliate Programs
  async getAffiliatePrograms(): Promise<AffiliateProgram[]> {
    const { data, error } = await this.supabase
      .from('affiliate_programs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching affiliate programs:', error)
      return []
    }

    return data || []
  }

  async createAffiliateProgram(program: Omit<AffiliateProgram, 'id' | 'created_at'>): Promise<AffiliateProgram | null> {
    const { data, error } = await this.supabase
      .from('affiliate_programs')
      .insert(program)
      .select()
      .single()

    if (error) {
      console.error('Error creating affiliate program:', error)
      return null
    }

    return data
  }

  // Affiliate Partners
  async getAffiliatePartners(): Promise<AffiliatePartner[]> {
    const { data, error } = await this.supabase
      .from('affiliate_partners')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching affiliate partners:', error)
      return []
    }

    return data || []
  }

  async createAffiliatePartner(partner: Omit<AffiliatePartner, 'id' | 'created_at'>): Promise<AffiliatePartner | null> {
    const { data, error } = await this.supabase
      .from('affiliate_partners')
      .insert(partner)
      .select()
      .single()

    if (error) {
      console.error('Error creating affiliate partner:', error)
      return null
    }

    return data
  }

  async updatePartnerStatus(partnerId: string, status: AffiliatePartner['status']): Promise<boolean> {
    const { error } = await this.supabase
      .from('affiliate_partners')
      .update({ status })
      .eq('id', partnerId)

    if (error) {
      console.error('Error updating partner status:', error)
      return false
    }

    return true
  }

  // Affiliate Conversions
  async trackConversion(conversion: Omit<AffiliateConversion, 'id' | 'created_at'>): Promise<AffiliateConversion | null> {
    const { data, error } = await this.supabase
      .from('affiliate_conversions')
      .insert(conversion)
      .select()
      .single()

    if (error) {
      console.error('Error tracking conversion:', error)
      return null
    }

    return data
  }

  async getConversions(partnerId?: string): Promise<AffiliateConversion[]> {
    let query = this.supabase
      .from('affiliate_conversions')
      .select('*')
      .order('created_at', { ascending: false })

    if (partnerId) {
      query = query.eq('partner_id', partnerId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching conversions:', error)
      return []
    }

    return data || []
  }

  // Affiliate Payouts
  async getPayouts(partnerId?: string): Promise<AffiliatePayout[]> {
    let query = this.supabase
      .from('affiliate_payouts')
      .select('*')
      .order('created_at', { ascending: false })

    if (partnerId) {
      query = query.eq('partner_id', partnerId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching payouts:', error)
      return []
    }

    return data || []
  }

  async createPayout(payout: Omit<AffiliatePayout, 'id' | 'created_at'>): Promise<AffiliatePayout | null> {
    const { data, error } = await this.supabase
      .from('affiliate_payouts')
      .insert(payout)
      .select()
      .single()

    if (error) {
      console.error('Error creating payout:', error)
      return null
    }

    return data
  }

  // Lead Generation
  async createLead(lead: Omit<LeadData, 'id' | 'created_at'>): Promise<LeadData | null> {
    const { data, error } = await this.supabase
      .from('leads')
      .insert(lead)
      .select()
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      return null
    }

    return data
  }

  async getLeads(): Promise<LeadData[]> {
    const { data, error } = await this.supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching leads:', error)
      return []
    }

    return data || []
  }

  async updateLeadStatus(leadId: string, status: LeadData['status']): Promise<boolean> {
    const { error } = await this.supabase
      .from('leads')
      .update({ status })
      .eq('id', leadId)

    if (error) {
      console.error('Error updating lead status:', error)
      return false
    }

    return true
  }

  // Tracking
  async trackAffiliateClick(trackingCode: string, partnerId?: string, visitorData?: VisitorData): Promise<string> {
    const clickId = `click_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
    
    const { error } = await this.supabase
      .from('affiliate_clicks')
      .insert({
        id: clickId,
        tracking_code: trackingCode,
        partner_id: partnerId,
        visitor_data: visitorData,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error tracking affiliate click:', error)
    }

    return clickId
  }

  async createTesterContactRequest(requestData: Omit<TesterContactRequest, 'id' | 'created_at'>): Promise<TesterContactRequest | null> {
    const { data, error } = await this.supabase
      .from('tester_contact_requests')
      .insert(requestData)
      .select()
      .single()

    if (error) {
      console.error('Error creating tester contact request:', error)
      return null
    }

    return data
  }

  async getTesterContactRequests(userId: string): Promise<TesterContactRequest[]> {
    const { data, error } = await this.supabase
      .from('tester_contact_requests')
      .select('*')
      .eq('requester_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tester contact requests:', error)
      return []
    }

    return data || []
  }

  // Analytics
  async getAffiliateStats(partnerId?: string) {
    try {
      let partnerQuery = this.supabase
        .from('affiliate_partners')
        .select('*')

      if (partnerId) {
        partnerQuery = partnerQuery.eq('id', partnerId)
      }

      const { data: partners, error: partnerError } = await partnerQuery

      if (partnerError) {
        console.error('Error fetching partner stats:', partnerError)
        return {
          totalPartners: 0,
          totalEarnings: 0,
          totalConversions: 0,
          averageCommission: 0
        }
      }

      const totalPartners = partners?.length || 0
      const totalEarnings = partners?.reduce((sum, partner) => sum + (partner.commission_earned || 0), 0) || 0
      const totalConversions = partners?.reduce((sum, partner) => sum + (partner.total_referrals || 0), 0) || 0
      const averageCommission = totalPartners > 0 ? totalEarnings / totalPartners : 0

      return {
        totalPartners,
        totalEarnings,
        totalConversions,
        averageCommission
      }
    } catch (error) {
      console.error('Error calculating affiliate stats:', error)
      return {
        totalPartners: 0,
        totalEarnings: 0,
        totalConversions: 0,
        averageCommission: 0
      }
    }
  }
}
