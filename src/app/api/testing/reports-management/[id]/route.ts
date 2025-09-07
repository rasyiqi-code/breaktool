import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    });

    if (!userData || !['verified_tester', 'admin', 'super_admin'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get testing report with related data
    const report = await prisma.testingReport.findUnique({
      where: { id: reportId },
      include: {
        tool: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            website: true,
            description: true
          }
        },
        tester: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            status: true,
            deadline: true
          }
        }
      }
    });

    if (!report) {
      return NextResponse.json({ error: 'Testing report not found' }, { status: 404 });
    }

    // For non-admin users, only allow access to their own reports
    if (userData.role === 'verified_tester' && report.testerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json(report);

  } catch (error) {
    console.error('Error fetching testing report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    });

    if (!userData || !['verified_tester', 'admin', 'super_admin'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json();

    // Check if report exists
    const existingReport = await prisma.testingReport.findUnique({
      where: { id: reportId },
      select: { testerId: true, status: true }
    });

    if (!existingReport) {
      return NextResponse.json({ error: 'Testing report not found' }, { status: 404 });
    }

    // For non-admin users, only allow editing their own reports
    if (userData.role === 'verified_tester' && existingReport.testerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Prepare update data
    const updateData: Record<string, unknown> = {};
    
    // Only update provided fields
    const allowedFields = [
      'title', 'summary', 'detailedAnalysis', 'overallScore', 'valueScore',
      'usageScore', 'integrationScore', 'pros', 'cons', 'recommendations',
      'useCases', 'setupTime', 'learningCurve', 'supportQuality',
      'documentation', 'performance', 'security', 'scalability',
      'costEffectiveness', 'verdict', 'status'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        if (['overallScore', 'valueScore', 'usageScore', 'integrationScore'].includes(field)) {
          updateData[field] = body[field] ? parseFloat(body[field]) : null;
        } else {
          updateData[field] = body[field];
        }
      }
    }

    // Admin/super_admin can approve reports
    if (['admin', 'super_admin'].includes(userData.role)) {
      if (body.isApproved !== undefined) {
        updateData.isApproved = body.isApproved;
        if (body.isApproved) {
          updateData.approvedBy = user.id;
          updateData.approvedAt = new Date();
        } else {
          updateData.approvedBy = null;
          updateData.approvedAt = null;
        }
      }
      if (body.reviewNotes !== undefined) {
        updateData.reviewNotes = body.reviewNotes;
      }
    }

    // Update the report
    const updatedReport = await prisma.testingReport.update({
      where: { id: reportId },
      data: updateData,
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
      }
    });

    return NextResponse.json(updatedReport);

  } catch (error) {
    console.error('Error updating testing report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: reportId } = await params;
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user role
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true }
    });

    if (!userData || !['verified_tester', 'admin', 'super_admin'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Check if report exists
    const existingReport = await prisma.testingReport.findUnique({
      where: { id: reportId },
      select: { testerId: true, status: true }
    });

    if (!existingReport) {
      return NextResponse.json({ error: 'Testing report not found' }, { status: 404 });
    }

    // For non-admin users, only allow deleting their own reports
    if (userData.role === 'verified_tester' && existingReport.testerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete the report
    await prisma.testingReport.delete({
      where: { id: reportId }
    });

    return NextResponse.json({ message: 'Testing report deleted successfully' });

  } catch (error) {
    console.error('Error deleting testing report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}