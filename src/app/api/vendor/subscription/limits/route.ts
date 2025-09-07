import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SubscriptionService } from '@/lib/services/vendor/subscription.service';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
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

    const limits = await SubscriptionService.getUserFeatureLimits(user.id);
    
    return NextResponse.json(limits);
  } catch (error) {
    console.error('Error fetching user limits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user limits' },
      { status: 500 }
    );
  }
}

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

    const { featureSlug, currentUsage } = await request.json();

    if (!featureSlug || currentUsage === undefined) {
      return NextResponse.json(
        { error: 'Feature slug and current usage are required' },
        { status: 400 }
      );
    }

    const limitCheck = await SubscriptionService.checkUserLimit(user.id, featureSlug, currentUsage);
    
    return NextResponse.json(limitCheck);
  } catch (error) {
    console.error('Error checking user limit:', error);
    return NextResponse.json(
      { error: 'Failed to check user limit' },
      { status: 500 }
    );
  }
}
