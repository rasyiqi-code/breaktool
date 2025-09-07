import { NextResponse } from 'next/server'
import { AnalyticsService } from '@/lib/services/admin/analytics.service'

export async function GET() {
  try {
    const platformStats = await AnalyticsService.getPlatformStats()
    return NextResponse.json(platformStats)
  } catch (error) {
    console.error('Error getting platform analytics:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
