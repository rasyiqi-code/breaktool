import { NextRequest, NextResponse } from 'next/server'
import { ToolsService } from '@/lib/services/tools/tools.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const upvotes = await ToolsService.getUserUpvotedTools(userId)
    return NextResponse.json(upvotes)
  } catch (error) {
    console.error('Error fetching user upvotes:', error)
    return NextResponse.json({ error: 'Failed to fetch user upvotes' }, { status: 500 })
  }
}
