import { NextRequest, NextResponse } from 'next/server'
import { ToolsService } from '@/lib/services/tools/tools.service'

export async function POST(request: NextRequest) {
  try {
    const { toolId, userId } = await request.json()

    if (!toolId || !userId) {
      return NextResponse.json({ error: 'Tool ID and User ID are required' }, { status: 400 })
    }

    await ToolsService.upvoteTool(toolId, userId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error upvoting tool:', error)
    return NextResponse.json({ error: 'Failed to upvote tool' }, { status: 500 })
  }
}
