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

    // Get system settings from database or return defaults
    const settings = {
      siteName: 'BreakTool',
      siteDescription: 'Trusted SaaS Reviews by Verified Experts',
      siteUrl: 'https://breaktool.com',
      adminEmail: 'team.breaktool@gmail.com',
      maintenanceMode: false,
      registrationEnabled: true,
      emailNotifications: true,
      maxFileSize: 10,
      sessionTimeout: 24,
      rateLimitEnabled: true,
      apiRateLimit: 1000,
      databaseBackupEnabled: true,
      logLevel: 'info',
      cacheEnabled: true,
      cdnEnabled: false,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching system settings:', error);
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
    
    // Validate required fields
    const requiredFields = ['siteName', 'siteDescription', 'siteUrl', 'adminEmail'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // In a real implementation, you would save these settings to a database
    // For now, we'll just return the updated settings
    const updatedSettings = {
      ...body,
      lastUpdated: new Date().toISOString()
    };

    // Log the settings update
    console.log('System settings updated by:', user.email, 'Settings:', updatedSettings);

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Error updating system settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
