import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '@/lib/services/admin/analytics.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ industry: string }> }
) {
  try {
    const { industry } = await params;
    const industryInsights = await AnalyticsService.getIndustryInsights(industry)
    
    if (!industryInsights) {
      return NextResponse.json({ error: 'Industry not found' }, { status: 404 })
    }
    
    return NextResponse.json(industryInsights)
  } catch (error) {
    console.error('Error getting industry insights:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
