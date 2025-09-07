import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SubscriptionService } from '@/lib/services/vendor/subscription.service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  try {
    // Get the current user
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { featureSlug } = await request.json();

    if (!featureSlug) {
      return NextResponse.json(
        { error: 'Feature slug is required' },
        { status: 400 }
      );
    }

    const hasAccess = await SubscriptionService.hasFeatureAccess(user.id, featureSlug);
    
    return NextResponse.json({ hasAccess });
  } catch (error) {
    console.error('Error checking feature access:', error);
    return NextResponse.json(
      { error: 'Failed to check feature access' },
      { status: 500 }
    );
  }
}
