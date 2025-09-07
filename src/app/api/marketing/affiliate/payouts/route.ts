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

    const service = new AffiliateLeadGenerationService();
    
    // Get affiliate partner for the user
    const allPartners = await service.getAffiliatePartners();
    const partner = allPartners.find(p => p.user_id === user.id);
    
    if (!partner) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    const payouts = await service.getPayouts(partner.id);
    
    return NextResponse.json({
      success: true,
      data: payouts
    });
  } catch (error) {
    console.error('Error fetching commission payouts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch commission payouts' },
      { status: 500 }
    );
  }
}
