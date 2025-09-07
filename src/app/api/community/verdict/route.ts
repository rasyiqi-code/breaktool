import { NextRequest, NextResponse } from 'next/server'
import { VerdictAggregationService } from '@/lib/services/reviews/verdict-aggregation.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('toolId')
    const action = searchParams.get('action') || 'get'
    
    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 })
    }

    switch (action) {
      case 'calculate':
        const calculatedVerdict = await VerdictAggregationService.calculateToolVerdict(toolId)
        return NextResponse.json(calculatedVerdict)
      
      case 'get':
        const verdict = await VerdictAggregationService.getToolVerdict(toolId)
        return NextResponse.json(verdict)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in verdict API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { toolId } = await request.json()
    
    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 })
    }

    const calculatedVerdict = await VerdictAggregationService.calculateToolVerdict(toolId)
    return NextResponse.json(calculatedVerdict)
  } catch (error) {
    console.error('Error calculating verdict:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
