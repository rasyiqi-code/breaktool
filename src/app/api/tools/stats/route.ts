import { NextRequest, NextResponse } from 'next/server'
import { StatsService } from '@/lib/services/admin/stats.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('toolId')

    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 })
    }

    const stats = await StatsService.getToolStats(toolId)
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching tool stats:', error)
    return NextResponse.json({ error: 'Failed to fetch tool stats' }, { status: 500 })
  }
}
