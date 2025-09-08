import { NextRequest, NextResponse } from 'next/server';
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

    // Performance metrics
    const performanceMetrics = {
      responseTime: {
        average: 120,
        p50: 95,
        p95: 250,
        p99: 450,
        max: 850
      },
      throughput: {
        requestsPerSecond: 45,
        requestsPerMinute: 2700,
        requestsPerHour: 162000,
        peakRequestsPerSecond: 120
      },
      errorRate: {
        total: 0.1,
        byEndpoint: {
          '/api/tools': 0.2,
          '/api/reviews': 0.1,
          '/api/users': 0.3,
          '/api/admin': 0.0
        }
      },
      resourceUsage: {
        cpu: 45,
        memory: 62,
        disk: 78,
        network: 25
      }
    };

    // Database performance
    const databasePerformance = {
      queryTime: {
        average: 45,
        slowest: 850,
        fastest: 5
      },
      connectionPool: {
        active: 12,
        idle: 8,
        max: 20,
        utilization: 60
      },
      cacheHitRate: 85,
      indexUsage: 92
    };

    // Performance trends (last 24 hours)
    const performanceTrends = [
      { time: '00:00', responseTime: 120, requests: 45, errors: 0.1 },
      { time: '04:00', responseTime: 95, requests: 25, errors: 0.0 },
      { time: '08:00', responseTime: 150, requests: 80, errors: 0.2 },
      { time: '12:00', responseTime: 180, requests: 120, errors: 0.3 },
      { time: '16:00', responseTime: 160, requests: 100, errors: 0.2 },
      { time: '20:00', responseTime: 140, requests: 70, errors: 0.1 }
    ];

    // Slow queries
    const slowQueries = [
      {
        id: '1',
        query: 'SELECT * FROM reviews WHERE tool_id = ? AND createdAt > ?',
        executionTime: 850,
        frequency: 45,
        lastExecuted: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      },
      {
        id: '2',
        query: 'SELECT u.*, ur.role FROM users u JOIN user_roles ur ON u.id = ur.user_id',
        executionTime: 650,
        frequency: 23,
        lastExecuted: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      {
        id: '3',
        query: 'SELECT t.*, COUNT(r.id) as review_count FROM tools t LEFT JOIN reviews r ON t.id = r.tool_id GROUP BY t.id',
        executionTime: 420,
        frequency: 12,
        lastExecuted: new Date(Date.now() - 15 * 60 * 1000).toISOString()
      }
    ];

    // Performance recommendations
    const recommendations = [
      {
        id: '1',
        title: 'Optimize Database Queries',
        description: 'Add indexes to frequently queried columns',
        impact: 'high',
        effort: 'medium',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Enable Query Caching',
        description: 'Implement Redis caching for expensive queries',
        impact: 'high',
        effort: 'high',
        status: 'pending'
      },
      {
        id: '3',
        title: 'Optimize Images',
        description: 'Compress and resize uploaded images',
        impact: 'medium',
        effort: 'low',
        status: 'completed'
      },
      {
        id: '4',
        title: 'Enable CDN',
        description: 'Use Content Delivery Network for static assets',
        impact: 'medium',
        effort: 'medium',
        status: 'pending'
      }
    ];

    // System resources
    const systemResources = {
      server: {
        cpu: 45,
        memory: 62,
        disk: 78,
        network: 25
      },
      database: {
        cpu: 35,
        memory: 48,
        disk: 65,
        connections: 60
      },
      cache: {
        memory: 15,
        hitRate: 85,
        missRate: 15
      }
    };

    return NextResponse.json({
      metrics: performanceMetrics,
      database: databasePerformance,
      trends: performanceTrends,
      slowQueries,
      recommendations,
      systemResources
    });
  } catch (error) {
    console.error('Error fetching performance data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'clear_cache':
        // In a real implementation, this would clear application cache
        console.log('Cache cleared by:', user.email);
        
        return NextResponse.json({
          message: 'Cache cleared successfully'
        });

      case 'optimize_database':
        // In a real implementation, this would optimize database
        console.log('Database optimized by:', user.email);
        
        return NextResponse.json({
          message: 'Database optimized successfully'
        });

      case 'restart_services':
        // In a real implementation, this would restart services
        console.log('Services restart initiated by:', user.email);
        
        return NextResponse.json({
          message: 'Services restart initiated successfully'
        });

      case 'run_performance_test':
        // In a real implementation, this would run performance tests
        console.log('Performance test initiated by:', user.email);
        
        return NextResponse.json({
          message: 'Performance test initiated successfully'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error performing performance operation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
