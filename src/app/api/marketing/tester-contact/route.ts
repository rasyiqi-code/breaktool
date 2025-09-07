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

    const service = new AffiliateLeadGenerationService();
    const requests = await service.getTesterContactRequests(user.id);
    
    return NextResponse.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching tester contact requests:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tester contact requests' },
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
    const requestData = {
      ...body,
      requester_id: user.id,
      created_at: new Date().toISOString()
    };

    const service = new AffiliateLeadGenerationService();
    const contactRequest = await service.createTesterContactRequest(requestData);
    
    return NextResponse.json({
      success: true,
      data: contactRequest
    });
  } catch (error) {
    console.error('Error creating tester contact request:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create tester contact request' },
      { status: 500 }
    );
  }
}
