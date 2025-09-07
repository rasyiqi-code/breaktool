import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('toolId')
    const action = searchParams.get('action')

    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 })
    }

    if (action === 'get') {
      // Get verdict for a specific tool
      try {
        const tool = await prisma.tool.findUnique({
          where: { id: toolId },
          select: {
            verdict: true,
            verdictUpdatedAt: true,
            overallScore: true,
            totalReviews: true
          }
        })

        if (!tool) {
          return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
        }

        return NextResponse.json({
          success: true,
          verdict: tool.verdict || null,
          verdictUpdatedAt: tool.verdictUpdatedAt || null,
          overallScore: Number(tool.overallScore) || 0,
          totalReviews: tool.totalReviews || 0
        })
      } catch (error) {
        console.error('Error fetching tool verdict:', error)
        return NextResponse.json({ error: 'Failed to fetch verdict' }, { status: 500 })
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error in verdict API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('Received POST request to /api/verdict')
    
    const body = await request.json()
    console.log('Request body:', body)
    
    const { toolId, verdict, action } = body

    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 })
    }

    // Handle calculate verdict action
    if (action === 'calculate' || !verdict) {
      console.log('Calculating verdict for tool:', toolId)
      
      // First check if tool exists
      const existingTool = await prisma.tool.findUnique({
        where: { id: toolId },
        select: { 
          id: true, 
          verdict: true,
          overallScore: true,
          totalReviews: true
        }
      })

      if (!existingTool) {
        console.error('Tool not found:', toolId)
        return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
      }

      // Calculate verdict based on tool data
      let calculatedVerdict = 'try' // default
      let confidence = 50 // default

      if (existingTool.overallScore) {
        const score = Number(existingTool.overallScore)
        if (score >= 8.0) {
          calculatedVerdict = 'keep'
          confidence = 85
        } else if (score >= 6.0) {
          calculatedVerdict = 'try'
          confidence = 70
        } else {
          calculatedVerdict = 'stop'
          confidence = 75
        }
      }

      // Update tool with calculated verdict
      const updatedTool = await prisma.tool.update({
        where: { id: toolId },
        data: {
          verdict: calculatedVerdict,
          verdictUpdatedAt: new Date()
        },
        select: {
          verdict: true,
          verdictUpdatedAt: true,
          overallScore: true,
          totalReviews: true
        }
      })

      console.log('Verdict calculated successfully:', updatedTool)

      return NextResponse.json({
        success: true,
        verdict: updatedTool.verdict,
        verdictUpdatedAt: updatedTool.verdictUpdatedAt,
        confidence: confidence,
        overallScore: Number(updatedTool.overallScore) || 0,
        totalReviews: updatedTool.totalReviews || 0
      })
    }

    // Handle manual verdict update
    if (!verdict) {
      return NextResponse.json({ error: 'Verdict is required for manual updates' }, { status: 400 })
    }

    console.log('Updating verdict for tool:', toolId, 'verdict:', verdict)

    // First check if tool exists
    const existingTool = await prisma.tool.findUnique({
      where: { id: toolId },
      select: { id: true, verdict: true }
    })

    if (!existingTool) {
      console.error('Tool not found:', toolId)
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 })
    }

    // Update tool verdict
    const updatedTool = await prisma.tool.update({
      where: { id: toolId },
      data: {
        verdict,
        verdictUpdatedAt: new Date()
      },
      select: {
        verdict: true,
        verdictUpdatedAt: true
      }
    })

    console.log('Verdict updated successfully:', updatedTool)

    return NextResponse.json({
      success: true,
      verdict: updatedTool.verdict,
      verdictUpdatedAt: updatedTool.verdictUpdatedAt
    })
  } catch (error) {
    console.error('Error in verdict API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
