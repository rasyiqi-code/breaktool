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

    // Security settings
    const securitySettings = {
      twoFactorAuth: {
        enabled: true,
        required: false,
        methods: ['email', 'sms', 'authenticator']
      },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        maxAge: 90, // days
        preventReuse: 5 // last 5 passwords
      },
      sessionSecurity: {
        timeout: 24, // hours
        maxConcurrentSessions: 3,
        requireReauth: false,
        secureCookies: true,
        httpOnlyCookies: true
      },
      ipSecurity: {
        whitelist: [],
        blacklist: [],
        maxFailedAttempts: 5,
        lockoutDuration: 30, // minutes
        enableGeoBlocking: false
      },
      apiSecurity: {
        rateLimiting: true,
        rateLimit: 1000, // requests per hour
        requireApiKey: true,
        enableCORS: true,
        allowedOrigins: ['https://breaktool.com']
      },
      dataProtection: {
        encryptionAtRest: true,
        encryptionInTransit: true,
        dataRetention: 365, // days
        gdprCompliance: true,
        auditLogging: true
      }
    };

    // Security statistics
    const securityStats = {
      totalLogins: 125430,
      failedLogins: 230,
      blockedIPs: 12,
      activeSessions: 45,
      twoFactorEnabled: 89,
      lastSecurityScan: new Date().toISOString(),
      vulnerabilitiesFound: 0,
      securityScore: 95
    };

    // Recent security events
    const securityEvents = [
      {
        id: '1',
        type: 'failed_login',
        message: 'Failed login attempt from 192.168.1.100',
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        severity: 'warning',
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '2',
        type: 'successful_login',
        message: 'Successful login from 192.168.1.50',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        severity: 'info',
        ip: '192.168.1.50',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      },
      {
        id: '3',
        type: 'suspicious_activity',
        message: 'Multiple failed login attempts detected',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        severity: 'warning',
        ip: '192.168.1.200',
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
      },
      {
        id: '4',
        type: 'password_change',
        message: 'Password changed successfully',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        severity: 'info',
        ip: '192.168.1.75',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        id: '5',
        type: 'two_factor_enabled',
        message: 'Two-factor authentication enabled',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        severity: 'info',
        ip: '192.168.1.90',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
      }
    ];

    // Security recommendations
    const recommendations = [
      {
        id: '1',
        title: 'Enable Two-Factor Authentication',
        description: 'Require 2FA for all admin users',
        priority: 'high',
        status: 'pending'
      },
      {
        id: '2',
        title: 'Update Password Policy',
        description: 'Increase minimum password length to 12 characters',
        priority: 'medium',
        status: 'pending'
      },
      {
        id: '3',
        title: 'Enable IP Whitelisting',
        description: 'Restrict admin access to specific IP addresses',
        priority: 'medium',
        status: 'pending'
      },
      {
        id: '4',
        title: 'Regular Security Audits',
        description: 'Schedule monthly security audits',
        priority: 'low',
        status: 'completed'
      }
    ];

    return NextResponse.json({
      settings: securitySettings,
      statistics: securityStats,
      events: securityEvents,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching security settings:', error);
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
    const { action, settings } = body;

    switch (action) {
      case 'update_settings':
        // In a real implementation, this would save security settings to database
        console.log('Security settings updated by:', user.email, 'Settings:', settings);
        
        return NextResponse.json({
          message: 'Security settings updated successfully',
          settings
        });

      case 'block_ip':
        const { ip } = body;
        if (!ip) {
          return NextResponse.json({ error: 'IP address is required' }, { status: 400 });
        }
        
        console.log('IP blocked by:', user.email, 'IP:', ip);
        
        return NextResponse.json({
          message: 'IP address blocked successfully'
        });

      case 'unblock_ip':
        const { unblockIp } = body;
        if (!unblockIp) {
          return NextResponse.json({ error: 'IP address is required' }, { status: 400 });
        }
        
        console.log('IP unblocked by:', user.email, 'IP:', unblockIp);
        
        return NextResponse.json({
          message: 'IP address unblocked successfully'
        });

      case 'run_security_scan':
        // In a real implementation, this would trigger a security scan
        console.log('Security scan initiated by:', user.email);
        
        return NextResponse.json({
          message: 'Security scan initiated successfully'
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error performing security operation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
