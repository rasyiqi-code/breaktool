import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack-server';
import { RoleManagementService } from '@/lib/services/users/role-management.service';

export async function GET() {
  try {
    // Check admin authentication
    const currentUser = await stackServerApp.getUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if current user is admin or super_admin
    const hasAdminRole = await RoleManagementService.userHasRole(currentUser.id, 'admin') ||
                         await RoleManagementService.userHasRole(currentUser.id, 'super_admin');
    
    if (!hasAdminRole) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get all unique roles from user_roles table
    const roleStats = await prisma.userRole.groupBy({
      by: ['role'],
      where: { isActive: true },
      _count: { role: true }
    });

    // Get role distribution from users table (legacy)
    const legacyRoleStats = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true }
    });

    // Combine and format role data
    const roles = [
      {
        id: 'super_admin',
        name: 'Super Admin',
        description: 'Full system access and control',
        permissions: ['all'],
        userCount: roleStats.find(r => r.role === 'super_admin')?._count.role || 0,
        isActive: true
      },
      {
        id: 'admin',
        name: 'Admin',
        description: 'Administrative access to platform features',
        permissions: ['user_management', 'content_moderation', 'analytics'],
        userCount: roleStats.find(r => r.role === 'admin')?._count.role || 0,
        isActive: true
      },
      {
        id: 'verified_tester',
        name: 'Verified Tester',
        description: 'Can test and review SaaS tools',
        permissions: ['testing', 'reviewing', 'reporting'],
        userCount: roleStats.find(r => r.role === 'verified_tester')?._count.role || 0,
        isActive: true
      },
      {
        id: 'vendor',
        name: 'Vendor',
        description: 'Can submit and manage their tools',
        permissions: ['tool_submission', 'analytics', 'support'],
        userCount: roleStats.find(r => r.role === 'vendor')?._count.role || 0,
        isActive: true
      },
      {
        id: 'user',
        name: 'User',
        description: 'Basic platform access',
        permissions: ['browsing', 'bookmarking'],
        userCount: legacyRoleStats.find(r => r.role === 'user')?._count.role || 0,
        isActive: true
      }
    ];

    // Get detailed role assignments
    const roleAssignments = await prisma.userRole.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { grantedAt: 'desc' }
    });

    // Get permission categories
    const permissionCategories = {
      'System': ['all', 'system_settings', 'database_management', 'api_management'],
      'User Management': ['user_management', 'role_management', 'permissions'],
      'Content': ['content_moderation', 'tool_submission', 'reviewing'],
      'Analytics': ['analytics', 'reporting', 'monitoring'],
      'Testing': ['testing', 'verification', 'quality_assurance']
    };

    return NextResponse.json({
      roles,
      roleAssignments,
      permissionCategories,
      statistics: {
        totalRoles: roles.length,
        totalAssignments: roleAssignments.length,
        activeRoles: roles.filter(r => r.isActive).length
      }
    });

  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
