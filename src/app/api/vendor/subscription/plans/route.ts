import { NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/services/vendor/subscription.service';

export async function GET() {
  try {
    const plans = await SubscriptionService.getSubscriptionPlans();
    
    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}
