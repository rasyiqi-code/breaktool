import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { sendReportApproved, sendReportRejected } from '@/lib/websocket';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { reportId, action, adminId } = await request.json();

    if (!reportId || !action || !adminId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action. Must be approve or reject' }, { status: 400 });
    }

    // Update the report status
    const updatedReport = await prisma.testingReport.update({
      where: { id: reportId },
      data: {
        status: action === 'approve' ? 'approved' : 'rejected',
        isApproved: action === 'approve',
        approvedAt: action === 'approve' ? new Date() : null,
        approvedBy: adminId,
        // Note: adminFeedback field removed as it doesn't exist in Prisma schema
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            status: true
          }
        },
        tool: {
          select: {
            id: true,
            name: true,
            slug: true
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

    // If approved, update the associated task status
    if (action === 'approve') {
      await prisma.testingTask.update({
        where: { id: updatedReport.task.id },
        data: {
          status: 'completed',
          completedAt: new Date()
        }
      });
    }

    // Send real-time notification to the tester
    try {
      if (action === 'approve') {
        sendReportApproved(updatedReport, updatedReport.tester.id);
      } else {
        sendReportRejected(updatedReport, updatedReport.tester.id);
      }
    } catch (error) {
      console.error('Error sending real-time notification:', error);
    }

    return NextResponse.json({ 
      success: true, 
      report: updatedReport,
      message: `Report ${action}d successfully`
    });

  } catch (error) {
    console.error('Error updating report status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
