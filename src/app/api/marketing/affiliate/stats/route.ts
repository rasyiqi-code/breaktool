import { NextResponse } from 'next/server';
import { AffiliateLeadGenerationService } from '@/lib/services/marketing/affiliate-lead-generation.service';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // const { searchParams } = new URL(request.url);

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const service = new AffiliateLeadGenerationService();
    
    if (userData?.role === 'admin' || userData?.role === 'super_admin') {
      // Admin can get overall stats
      const stats = await service.getAffiliateStats();
      return NextResponse.json({
        success: true,
        data: stats
      });
    } else {
      // Regular user can only get their own partner stats
      const allPartners = await service.getAffiliatePartners();
      const partner = allPartners.find(p => p.user_id === user.id);
      if (!partner) {
        return NextResponse.json({
          success: true,
          data: {
            total_clicks: 0,
            total_conversions: 0,
            conversion_rate: 0,
            total_earnings: 0,
            total_sales: 0,
            pending_commission: 0,
            paid_commission: 0
          }
        });
      }

      const stats = await service.getAffiliateStats(partner.id);
      return NextResponse.json({
        success: true,
        data: stats
      });
    }
  } catch (error) {
    console.error('Error fetching affiliate stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch affiliate stats' },
      { status: 500 }
    );
  }
}
