import { NextResponse } from 'next/server';
import { createSupabaseClient } from '@/utils/supabase-client';

interface Activity {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
}

export async function GET() {
  try {
    const supabase = createSupabaseClient();
    
    // Get recent tool submissions
    const { data: recentTools } = await supabase
      .from('tools')
      .select('id, name, testing_status, submission_date')
      .order('submission_date', { ascending: false })
      .limit(5);

    // Get recent reviews
    const { data: recentReviews } = await supabase
      .from('reviews')
      .select('id, tool_id, user_id, review_type, createdAt')
      .order('createdAt', { ascending: false })
      .limit(5);

    // Get recent user verifications
    const { data: recentVerifications } = await supabase
      .from('users')
      .select('id, name, isVerifiedTester, verification_date')
      .eq('isVerifiedTester', true)
      .order('verification_date', { ascending: false })
      .limit(5);

    // Combine and format activities
    const activities: Activity[] = [];

    // Add tool submissions
    if (recentTools) {
      recentTools.forEach(tool => {
        activities.push({
          id: `tool_${tool.id}`,
          type: 'tool_submitted',
          title: `New tool submitted: ${tool.name}`,
          description: `Tool "${tool.name}" was submitted for review`,
          timestamp: tool.submission_date,
          status: tool.testing_status === 'pending' ? 'pending' : 
                 tool.testing_status === 'completed' ? 'approved' : 'rejected'
        });
      });
    }

    // Add reviews
    if (recentReviews) {
      recentReviews.forEach(review => {
        activities.push({
          id: `review_${review.id}`,
          type: 'review_created',
          title: `New ${review.review_type} review`,
          description: `A ${review.review_type} review was created`,
          timestamp: review.createdAt,
          status: 'approved'
        });
      });
    }

    // Add user verifications
    if (recentVerifications) {
      recentVerifications.forEach(user => {
        activities.push({
          id: `verification_${user.id}`,
          type: 'user_verified',
          title: `User verified: ${user.name || 'Unknown'}`,
          description: `User was verified as a tester`,
          timestamp: user.verification_date,
          status: 'approved'
        });
      });
    }

    // Sort by timestamp and return top 10
    const sortedActivities: Activity[] = activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10);

    return NextResponse.json(sortedActivities);

  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}
