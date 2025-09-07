import { NextRequest, NextResponse } from 'next/server'
import { DiscussionsService } from '@/lib/services/community/discussions.service'

export async function POST(request: NextRequest) {
  try {
    const { stackServerApp } = await import('@/lib/stack-server')
    const user = await stackServerApp.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { replyId, voteType } = body

    if (!replyId || !voteType) {
      return NextResponse.json(
        { error: 'Reply ID and vote type are required' },
        { status: 400 }
      )
    }

    if (!['helpful', 'not_helpful'].includes(voteType)) {
      return NextResponse.json(
        { error: 'Invalid vote type' },
        { status: 400 }
      )
    }

    const success = await DiscussionsService.voteDiscussionReply({
      replyId,
      userId: user.id,
      voteType
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to vote on reply' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error voting on reply:', error)
    return NextResponse.json(
      { error: 'Failed to vote on reply' },
      { status: 500 }
    )
  }
}
