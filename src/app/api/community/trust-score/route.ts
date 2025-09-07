import { NextRequest, NextResponse } from 'next/server'
import { TrustScoreService } from '@/lib/services/reviews/trust-score.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const action = searchParams.get('action') || 'get'
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    switch (action) {
      case 'calculate':
        const calculatedScore = await TrustScoreService.calculateTrustScore(userId)
        return NextResponse.json(calculatedScore)
      
      case 'get':
        const score = await TrustScoreService.getTrustScore(userId)
        return NextResponse.json(score)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in trust score API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const calculatedScore = await TrustScoreService.calculateTrustScore(userId)
    return NextResponse.json(calculatedScore)
  } catch (error) {
    console.error('Error calculating trust score:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
