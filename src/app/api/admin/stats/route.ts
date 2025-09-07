import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get total users
    const totalUsers = await prisma.user.count();

    // Get total tools
    const totalTools = await prisma.tool.count();

    // Get total reviews
    const totalReviews = await prisma.review.count();

    // Get verified testers
    const verifiedTesters = await prisma.user.count({
      where: {
        isVerifiedTester: true
      }
    });

    // Get pending verification requests
    const pendingVerifications = await prisma.verificationRequest.count({
      where: {
        status: 'pending'
      }
    });

    // Get active tools (tools with status 'active')
    const activeTools = await prisma.tool.count({
      where: {
        status: 'active'
      }
    });

    // Get pending tool submissions
    const pendingToolSubmissions = await prisma.toolSubmission.count({
      where: {
        status: 'pending'
      }
    });

    // Get total testing tasks
    const totalTestingTasks = await prisma.testingTask.count();

    // Get completed testing tasks
    const completedTestingTasks = await prisma.testingTask.count({
      where: {
        status: 'completed'
      }
    });

    return NextResponse.json({
      totalUsers,
      totalTools,
      totalReviews,
      verifiedTesters,
      pendingVerifications,
      pendingToolSubmissions,
      activeTools,
      totalTestingTasks,
      completedTestingTasks
    });

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
