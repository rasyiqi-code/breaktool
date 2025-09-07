import { NextResponse } from 'next/server';
import { AffiliateLeadGenerationService } from '@/lib/services/marketing/affiliate-lead-generation.service';

export async function GET() {
  try {
    const service = new AffiliateLeadGenerationService();
    const programs = await service.getAffiliatePrograms();
    
    return NextResponse.json({
      success: true,
      data: programs
    });
  } catch (error) {
    console.error('Error fetching affiliate programs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch affiliate programs' },
      { status: 500 }
    );
  }
}
