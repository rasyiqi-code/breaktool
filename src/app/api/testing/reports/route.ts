import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    console.log('API /api/testing/reports called');
    
    // Tester reports are now public - no authentication required

    const { searchParams } = new URL(request.url);
    const toolId = searchParams.get('toolId');

    console.log('Tool ID:', toolId);

    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 });
    }

    // Get testing reports for the tool (public view) - show submitted and published reports
    const reports = await prisma.testingReport.findMany({
      where: {
        toolId: toolId,
        status: {
          in: ['submitted', 'published']
        }
      },
      include: {
        tester: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log(`Found ${reports.length} reports for tool ${toolId}`);
    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching testing reports:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}