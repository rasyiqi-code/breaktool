import { NextRequest, NextResponse } from 'next/server';
import { AffiliateLeadGenerationService } from '@/lib/services/marketing/affiliate-lead-generation.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackingCode, partnerId, visitorData } = body;

    if (!trackingCode) {
      return NextResponse.json(
        { success: false, error: 'Tracking code is required' },
        { status: 400 }
      );
    }

    const service = new AffiliateLeadGenerationService();
    const clickId = await service.trackAffiliateClick(trackingCode, partnerId, visitorData);

    return NextResponse.json({
      success: true,
      data: { clickId }
    });
  } catch (error) {
    console.error('Error tracking affiliate click:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track affiliate click' },
      { status: 500 }
    );
  }
}
