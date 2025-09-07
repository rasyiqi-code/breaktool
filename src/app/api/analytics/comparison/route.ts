    import { NextRequest, NextResponse } from 'next/server'
import { AnalyticsService } from '@/lib/services/admin/analytics.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const toolIds = searchParams.get('toolIds')
    
    if (!toolIds) {
      return NextResponse.json({ error: 'Tool IDs are required' }, { status: 400 })
    }
    
    const ids = toolIds.split(',')
    const comparisonReport = await AnalyticsService.getComparisonReport(ids)
    
    if (!comparisonReport) {
      return NextResponse.json({ error: 'Could not generate comparison report' }, { status: 400 })
    }
    
    return NextResponse.json(comparisonReport)
  } catch (error) {
    console.error('Error generating comparison report:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
