import { NextRequest, NextResponse } from 'next/server'
import { TrustScoreService } from '@/lib/services/reviews/trust-score.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    
    const topUsers = await TrustScoreService.getTopTrustedUsers(limit)
    return NextResponse.json(topUsers)
  } catch (error) {
    console.error('Error getting top trusted users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
