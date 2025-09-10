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
    console.log('POST /api/testing/reports-management - Starting request');
    const user = await stackServerApp.getUser();
    
    if (!user) {
      console.log('POST /api/testing/reports-management - No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('POST /api/testing/reports-management - User found:', user.id);

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
    console.log('POST /api/testing/reports-management - Request body:', JSON.stringify(body, null, 2));
    
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
    if (!toolId || !title || !summary) {
      console.log('POST /api/testing/reports-management - Missing required fields:', { toolId, title, summary });
      return NextResponse.json(
        { error: 'Missing required fields: toolId, title, and summary are required' },
        { status: 400 }
      );
    }
    
    console.log('POST /api/testing/reports-management - Validation passed, creating report...');

    // Create testing report
    try {
      // First, create a TestingTask if taskId is not provided
      let finalTaskId = taskId;
      if (!taskId) {
        // Get tool name for task title
        const tool = await prisma.tool.findUnique({
          where: { id: toolId },
          select: { name: true }
        });
        
        const task = await prisma.testingTask.create({
          data: {
            toolId,
            testerId: user.id,
            title: `Manual Test Task - ${tool?.name || 'Unknown Tool'}`,
            description: 'Manual test task created for direct report submission',
            status: 'completed',
            priority: 'medium',
            deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            reward: 0,
            completedAt: new Date()
          }
        });
        finalTaskId = task.id;
        console.log('Created TestingTask:', task.id);
      }
      
      const report = await prisma.testingReport.create({
      data: {
        taskId: finalTaskId,
        toolId,
        testerId: user.id,
        title,
        summary,
        detailedAnalysis,
        overallScore: overallScore && overallScore > 0 ? parseFloat(overallScore) : null,
        valueScore: valueScore && valueScore > 0 ? parseFloat(valueScore) : null,
        usageScore: usageScore && usageScore > 0 ? parseFloat(usageScore) : null,
        integrationScore: integrationScore && integrationScore > 0 ? parseFloat(integrationScore) : null,
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

    console.log('POST /api/testing/reports-management - Report created successfully:', report.id);
    return NextResponse.json(report, { status: 201 });
    
    } catch (dbError: any) {
      console.error('Database error creating testing report:', dbError);
      console.error('Database error details:', dbError.message);
      console.error('Database error code:', dbError.code);
      return NextResponse.json(
        { error: 'Database error', details: dbError.message, code: dbError.code },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error creating testing report:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}