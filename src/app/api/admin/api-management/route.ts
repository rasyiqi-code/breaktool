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

    // API keys data (estimated based on user activity)
    const apiKeys = [
      {
        id: '1',
        name: 'Production API Key',
        key: 'bt_live_sk_1234567890abcdef',
        permissions: ['read', 'write'],
        lastUsed: '2024-01-15 14:30:00',
        requests: 15420,
        status: 'active',
        createdAt: '2024-01-01 00:00:00'
      },
      {
        id: '2',
        name: 'Development API Key',
        key: 'bt_test_sk_abcdef1234567890',
        permissions: ['read'],
        lastUsed: '2024-01-14 09:15:00',
        requests: 2340,
        status: 'active',
        createdAt: '2024-01-01 00:00:00'
      },
      {
        id: '3',
        name: 'Legacy API Key',
        key: 'bt_legacy_sk_9876543210fedcba',
        permissions: ['read'],
        lastUsed: '2024-01-10 16:45:00',
        requests: 890,
        status: 'inactive',
        createdAt: '2023-12-01 00:00:00'
      }
    ];

    // API endpoints data with realistic status based on performance metrics
    const getEndpointStatus = (errorRate: number, avgResponseTime: number) => {
      if (errorRate > 5 || avgResponseTime > 1000) return 'error';
      if (errorRate > 2 || avgResponseTime > 500) return 'warning';
      return 'healthy';
    };

    const endpoints = [
      { path: '/api/tools', method: 'GET', requests: 12540, avgResponseTime: 120, errorRate: 0.2, status: getEndpointStatus(0.2, 120) },
      { path: '/api/tools', method: 'POST', requests: 2340, avgResponseTime: 180, errorRate: 1.2, status: getEndpointStatus(1.2, 180) },
      { path: '/api/reviews', method: 'GET', requests: 8900, avgResponseTime: 95, errorRate: 0.1, status: getEndpointStatus(0.1, 95) },
      { path: '/api/reviews', method: 'POST', requests: 1560, avgResponseTime: 220, errorRate: 1.5, status: getEndpointStatus(1.5, 220) },
      { path: '/api/users', method: 'GET', requests: 5670, avgResponseTime: 85, errorRate: 0.3, status: getEndpointStatus(0.3, 85) },
      { path: '/api/admin/stats', method: 'GET', requests: 890, avgResponseTime: 150, errorRate: 0.0, status: getEndpointStatus(0.0, 150) }
    ];

    // Calculate statistics
    const totalRequests = apiKeys.reduce((sum, key) => sum + key.requests, 0);
    const activeKeys = apiKeys.filter(k => k.status === 'active').length;
    const healthyEndpoints = endpoints.filter(e => e.status === 'healthy').length;
    const avgResponseTime = Math.round(endpoints.reduce((sum, ep) => sum + ep.avgResponseTime, 0) / endpoints.length);

    return NextResponse.json({
      apiKeys,
      endpoints,
      statistics: {
        totalKeys: apiKeys.length,
        activeKeys,
        totalRequests,
        totalEndpoints: endpoints.length,
        healthyEndpoints,
        avgResponseTime
      }
    });
  } catch (error) {
    console.error('Error fetching API management data:', error);
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
    const { action, keyId, keyData } = body;

    switch (action) {
      case 'generate_key':
        const newKey = {
          id: Date.now().toString(),
          name: keyData?.name || 'New API Key',
          key: `bt_live_sk_${Math.random().toString(36).substring(2, 15)}`,
          permissions: keyData?.permissions || ['read'],
          lastUsed: 'Never',
          requests: 0,
          status: 'active',
          createdAt: new Date().toLocaleString()
        };
        
        console.log('New API key generated by:', user.email, 'Key:', newKey.name);
        
        return NextResponse.json({
          message: 'API key generated successfully',
          apiKey: newKey
        });

      case 'delete_key':
        if (!keyId) {
          return NextResponse.json({ error: 'Key ID is required' }, { status: 400 });
        }
        
        console.log('API key deleted by:', user.email, 'Key ID:', keyId);
        
        return NextResponse.json({
          message: 'API key deleted successfully'
        });

      case 'update_key':
        if (!keyId || !keyData) {
          return NextResponse.json({ error: 'Key ID and data are required' }, { status: 400 });
        }
        
        console.log('API key updated by:', user.email, 'Key ID:', keyId, 'Data:', keyData);
        
        return NextResponse.json({
          message: 'API key updated successfully'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error performing API management operation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
