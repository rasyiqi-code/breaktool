import { NextResponse } from 'next/server'
import { VerdictAggregationService } from '@/lib/services/reviews/verdict-aggregation.service'

export async function GET() {
  try {
    const allVerdicts = await VerdictAggregationService.getAllToolVerdicts()
    return NextResponse.json(allVerdicts)
  } catch (error) {
    console.error('Error getting all verdicts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
