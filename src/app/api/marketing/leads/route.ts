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

    if (userData?.role !== 'admin' && userData?.role !== 'super_admin') {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    const service = new AffiliateLeadGenerationService();
    const leads = await service.getLeads();
    
    return NextResponse.json({
      success: true,
      data: leads
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const service = new AffiliateLeadGenerationService();
    const lead = await service.createLead(body);
    
    return NextResponse.json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
