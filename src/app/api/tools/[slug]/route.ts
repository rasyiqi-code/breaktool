import { NextRequest, NextResponse } from 'next/server'
import { ToolsService } from '@/lib/services/tools/tools.service'
import { withRateLimit } from '@/lib/rate-limit'

export const GET = withRateLimit('api')(
  async (request: NextRequest, { params }: { params: Promise<{ slug: string }> }) => {
  try {
    const { slug } = await params

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    const tool = await ToolsService.getToolBySlug(slug)

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    // Add caching headers for better performance
    const response = NextResponse.json(tool)
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300')
    
    return response
  } catch (error) {
    console.error('Error fetching tool by slug:', error)
    return NextResponse.json({ error: 'Failed to fetch tool' }, { status: 500 })
  }
})
