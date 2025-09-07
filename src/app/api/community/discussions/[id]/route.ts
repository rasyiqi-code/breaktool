import { NextRequest, NextResponse } from 'next/server'
import { DiscussionsService } from '@/lib/services/community/discussions.service'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Discussion ID is required' }, { status: 400 })
    }

    const discussion = await DiscussionsService.getDiscussionById(id)

    if (!discussion) {
      return NextResponse.json({ error: 'Discussion not found' }, { status: 404 })
    }

    // Increment view count
    await DiscussionsService.incrementViewCount(id)

    // Add caching headers for better performance
    const response = NextResponse.json(discussion)
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
    
    return response
  } catch (error) {
    console.error('Error fetching discussion:', error)
    return NextResponse.json({ error: 'Failed to fetch discussion' }, { status: 500 })
  }
}
