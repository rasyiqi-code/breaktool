import { NextRequest, NextResponse } from 'next/server';
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

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    const service = new AffiliateLeadGenerationService();
    
    if (userData?.role === 'admin' || userData?.role === 'super_admin') {
      // Admin can see all partners
      const partners = await service.getAffiliatePartners();
      return NextResponse.json({
        success: true,
        data: partners
      });
    } else {
      // Regular user can only see their own partner profile
      const allPartners = await service.getAffiliatePartners();
      const partner = allPartners.find(p => p.user_id === user.id);
      return NextResponse.json({
        success: true,
        data: partner ? [partner] : []
      });
    }
  } catch (error) {
    console.error('Error fetching affiliate partners:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch affiliate partners' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const partnerData = {
      ...body,
      user_id: user.id
    };

    const service = new AffiliateLeadGenerationService();
    const partner = await service.createAffiliatePartner(partnerData);
    
    return NextResponse.json({
      success: true,
      data: partner
    });
  } catch (error) {
    console.error('Error creating affiliate partner:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create affiliate partner' },
      { status: 500 }
    );
  }
}
