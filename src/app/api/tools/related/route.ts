import { NextRequest, NextResponse } from 'next/server'
import { ToolsService } from '@/lib/services/tools/tools.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const exclude = searchParams.get('exclude')
    const limit = parseInt(searchParams.get('limit') || '4')

    let relatedTools

    if (category) {
      // Get tools from same category
      relatedTools = await ToolsService.getToolsByCategory(category, limit + 1)
    } else {
      // Get trending tools as fallback
      relatedTools = await ToolsService.getTrendingTools(limit + 1)
    }

    // Filter out the current tool
    const filteredTools = relatedTools.filter((tool: { id: string }) => tool.id !== exclude)

    // Return only the requested limit
    const result = filteredTools.slice(0, limit)

    return NextResponse.json(result, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Error fetching related tools:', error)
    return NextResponse.json({ error: 'Failed to fetch related tools' }, { status: 500 })
  }
}
