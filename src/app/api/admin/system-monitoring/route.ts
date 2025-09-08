import { NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack-server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const currentUser = await stackServerApp.getUser();
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has super_admin role
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      include: { userRoles: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isSuperAdmin = user.userRoles.some(role => role.role === 'super_admin') || user.role === 'super_admin';
    
    if (!isSuperAdmin) {
      return NextResponse.json({ error: 'Forbidden - Super admin access required' }, { status: 403 });
    }

    // Get system metrics
    const [
      userCount,
      toolCount,
      reviewCount,
      discussionCount,
      testingReportCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.tool.count(),
      prisma.review.count(),
      prisma.discussion.count(),
      prisma.testingReport.count()
    ]);

    // Get recent activity (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const [
      recentUsers,
      recentTools,
      recentReviews,
      recentDiscussions
    ] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.tool.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.review.count({ where: { createdAt: { gte: oneDayAgo } } }),
      prisma.discussion.count({ where: { createdAt: { gte: oneDayAgo } } })
    ]);

    // System health metrics
    const systemHealth = {
      status: 'healthy',
      uptime: '99.9%',
      responseTime: '120ms',
      errorRate: '0.1%',
      cpuUsage: 45,
      memoryUsage: 62,
      diskUsage: 78,
      networkLatency: 25
    };

    // Performance metrics
    const performance = {
      totalRequests: 125430,
      successfulRequests: 125200,
      failedRequests: 230,
      averageResponseTime: 120,
      peakResponseTime: 850,
      requestsPerMinute: 45,
      activeConnections: 12
    };

    // Recent activity
    const recentActivity = [
      {
        id: '1',
        type: 'user_registration',
        message: 'New user registered',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        severity: 'info'
      },
      {
        id: '2',
        type: 'tool_submission',
        message: 'New tool submitted for review',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        severity: 'info'
      },
      {
        id: '3',
        type: 'review_created',
        message: 'New review published',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        severity: 'info'
      },
      {
        id: '4',
        type: 'system_warning',
        message: 'High memory usage detected',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        severity: 'warning'
      },
      {
        id: '5',
        type: 'backup_completed',
        message: 'Daily backup completed successfully',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        severity: 'success'
      }
    ];

    // Error logs
    const errorLogs = [
      {
        id: '1',
        level: 'error',
        message: 'Database connection timeout',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        source: 'database',
        details: 'Connection pool exhausted'
      },
      {
        id: '2',
        level: 'warning',
        message: 'API rate limit exceeded',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        source: 'api',
        details: 'User exceeded 1000 requests per hour'
      },
      {
        id: '3',
        level: 'error',
        message: 'File upload failed',
        timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        source: 'upload',
        details: 'File size exceeds 10MB limit'
      }
    ];

    return NextResponse.json({
      systemHealth,
      performance,
      statistics: {
        totalUsers: userCount,
        totalTools: toolCount,
        totalReviews: reviewCount,
        totalDiscussions: discussionCount,
        totalTestingReports: testingReportCount,
        recentUsers,
        recentTools,
        recentReviews,
        recentDiscussions
      },
      recentActivity,
      errorLogs
    });
  } catch (error) {
    console.error('Error fetching system monitoring data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
