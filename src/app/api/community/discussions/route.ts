import { NextRequest, NextResponse } from 'next/server'
import { DiscussionsService } from '@/lib/services/community/discussions.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('toolId')
    const limit = parseInt(searchParams.get('limit') || '20')
    const page = parseInt(searchParams.get('page') || '1')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'

    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 })
    }

    const result = await DiscussionsService.getDiscussionsByToolId(toolId, {
      page,
      limit,
      sortBy,
      sortOrder
    })

    // Add caching headers for better performance
    const response = NextResponse.json(result)
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
    
    return response
  } catch (error) {
    console.error('Error fetching discussions:', error)
    return NextResponse.json({ error: 'Failed to fetch discussions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { stackServerApp } = await import('@/lib/stack-server')
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, content, toolId } = body

    if (!title || !content || !toolId) {
      return NextResponse.json(
        { error: 'Title, content, and toolId are required' },
        { status: 400 }
      )
    }

    const discussion = await DiscussionsService.createDiscussion({
      title,
      content,
      toolId,
      userId: user.id
    })

    if (!discussion) {
      return NextResponse.json(
        { error: 'Failed to create discussion' },
        { status: 500 }
      )
    }

    return NextResponse.json(discussion)
  } catch (error) {
    console.error('Error creating discussion:', error)
    return NextResponse.json(
      { error: 'Failed to create discussion' },
      { status: 500 }
    )
  }
}
