import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '@/lib/services/admin/analytics.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const toolAnalytics = await AnalyticsService.getToolAnalytics(id)
    
    if (!toolAnalytics) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }
    
    return NextResponse.json(toolAnalytics)
  } catch (error) {
    console.error('Error getting tool analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
