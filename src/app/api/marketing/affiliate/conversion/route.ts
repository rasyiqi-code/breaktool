import { NextRequest, NextResponse } from 'next/server';
import { AffiliateLeadGenerationService } from '@/lib/services/marketing/affiliate-lead-generation.service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { partnerId, programId, referralCode, conversionValue } = body;

    if (!partnerId || !programId || !referralCode) {
      return NextResponse.json(
        { success: false, error: 'Partner ID, program ID, and referral code are required' },
        { status: 400 }
      );
    }

    const service = new AffiliateLeadGenerationService();
    const conversion = await service.trackConversion({
      partner_id: partnerId,
      program_id: programId,
      referral_code: referralCode,
      conversion_value: conversionValue || 0,
      commission_amount: (conversionValue || 0) * 0.1, // 10% commission
      status: 'pending'
    });

    if (!conversion) {
      return NextResponse.json(
        { success: false, error: 'Failed to track conversion' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { conversionId: conversion.id }
    });
  } catch (error) {
    console.error('Error recording affiliate conversion:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record affiliate conversion' },
      { status: 500 }
    );
  }
}
