import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack-server';

export async function GET(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role (check both legacy role and activeRole for multi-role support)
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        role: true,
        activeRole: true,
        primaryRole: true
      }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has required role (prioritize activeRole, fallback to legacy role)
    const userRole = userData.activeRole || userData.role;
    
    if (!['verified_tester', 'admin', 'super_admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const verdict = searchParams.get('verdict');
    const toolId = searchParams.get('toolId');
    const testerId = searchParams.get('testerId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: {
      status?: string;
      verdict?: string;
      toolId?: string;
      testerId?: string;
    } = {};
    
    if (status && status !== 'all') {
      where.status = status;
    }
    
    if (verdict && verdict !== 'all') {
      where.verdict = verdict;
    }
    
    if (toolId) {
      where.toolId = toolId;
    }
    
    if (testerId) {
      where.testerId = testerId;
    }

    // For non-admin users, only show their own reports
    if (userRole === 'verified_tester') {
      where.testerId = user.id;
    }

    // Get testing reports with related data
    const reports = await prisma.testingReport.findMany({
      where,
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true
          }
        },
        tester: {
          select: {
            id: true,
            name: true,
            email: true
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
      },
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalCount = await prisma.testingReport.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching testing reports:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role (check both legacy role and activeRole for multi-role support)
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        role: true,
        activeRole: true,
        primaryRole: true
      }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has required role (prioritize activeRole, fallback to legacy role)
    const userRole = userData.activeRole || userData.role;
    
    if (!['verified_tester', 'admin', 'super_admin'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden - insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const {
      taskId,
      toolId,
      title,
      summary,
      detailedAnalysis,
      overallScore,
      valueScore,
      usageScore,
      integrationScore,
      pros,
      cons,
      recommendations,
      useCases,
      setupTime,
      learningCurve,
      supportQuality,
      documentation,
      performance,
      security,
      scalability,
      costEffectiveness,
      verdict,
      status = 'submitted'
    } = body;

    // Validate required fields
    if (!taskId || !toolId || !title || !summary) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create testing report
    const report = await prisma.testingReport.create({
      data: {
        taskId,
        toolId,
        testerId: user.id,
        title,
        summary,
        detailedAnalysis,
        overallScore: overallScore ? parseFloat(overallScore) : null,
        valueScore: valueScore ? parseFloat(valueScore) : null,
        usageScore: usageScore ? parseFloat(usageScore) : null,
        integrationScore: integrationScore ? parseFloat(integrationScore) : null,
        pros: pros || [],
        cons: cons || [],
        recommendations,
        useCases: useCases || [],
        setupTime,
        learningCurve,
        supportQuality,
        documentation,
        performance,
        security,
        scalability,
        costEffectiveness,
        verdict,
        status
      },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true
          }
        },
        tester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(report, { status: 201 });

  } catch (error) {
    console.error('Error creating testing report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}