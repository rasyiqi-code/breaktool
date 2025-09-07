import { NextRequest, NextResponse } from 'next/server'
import { ToolsService } from '@/lib/services/tools/tools.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const limit = parseInt(searchParams.get('limit') || '5')

    if (!query) {
      return NextResponse.json([])
    }

    const results = await ToolsService.searchTools(query, limit)
    return NextResponse.json(results)
  } catch (error) {
    console.error('Error searching tools:', error)
    return NextResponse.json({ error: 'Failed to search tools' }, { status: 500 })
  }
}
