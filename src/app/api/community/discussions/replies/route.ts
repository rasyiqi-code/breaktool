import { NextRequest, NextResponse } from 'next/server'
import { DiscussionsService } from '@/lib/services/community/discussions.service'
import { stackServerApp } from '@/lib/stack-server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const discussionId = searchParams.get('discussionId')

    if (!discussionId) {
      return NextResponse.json({ error: 'Discussion ID is required' }, { status: 400 })
    }

    console.log('Get replies API called for discussion:', discussionId)
    
    const replies = await DiscussionsService.getDiscussionReplies(discussionId)
    
    if (!replies) {
      return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 })
    }

    console.log('Replies fetched successfully:', replies.length, 'replies')
    
    // Add caching headers for better performance
    const response = NextResponse.json({ replies })
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
    
    return response
  } catch (error) {
    console.error('Error fetching replies:', error)
    return NextResponse.json({ error: 'Failed to fetch replies' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Create reply API called')
    console.log('User:', { id: user.id })

    const body = await request.json()
    console.log('Request body:', body)

    const { discussionId, content, parentReplyId } = body

    // Validate required fields
    if (!discussionId || !content) {
      console.error('Missing required fields:', { discussionId: !!discussionId, content: !!content })
      return NextResponse.json({ error: 'Discussion ID and content are required' }, { status: 400 })
    }

    // Validate field types
    if (typeof discussionId !== 'string' || typeof content !== 'string') {
      console.error('Invalid field types:', { discussionId: typeof discussionId, content: typeof content })
      return NextResponse.json({ error: 'Invalid field types' }, { status: 400 })
    }

    // Validate content length
    if (content.trim().length === 0) {
      console.error('Content is empty')
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 })
    }

    console.log('Calling DiscussionsService.createDiscussionReply...')
    
    const reply = await DiscussionsService.createDiscussionReply({
      discussionId,
      userId: user.id,
      content: content.trim(),
      parentReplyId: parentReplyId || undefined
    })

    if (!reply) {
      console.error('Failed to create reply')
      return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 })
    }

    console.log('Reply created successfully:', { id: reply.id })
    return NextResponse.json(reply)
  } catch (error) {
    console.error('Error creating reply:', error)
    return NextResponse.json({ error: 'Failed to create reply' }, { status: 500 })
  }
}