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

    // Define permission categories and their permissions
    const permissionCategories = {
      'System': {
        description: 'System-level permissions for super admin access',
        permissions: [
          { id: 'system:all', name: 'All System Access', description: 'Full system control and configuration' },
          { id: 'system:settings', name: 'System Settings', description: 'Configure system-wide settings' },
          { id: 'system:database', name: 'Database Management', description: 'Manage database operations and backups' },
          { id: 'system:api', name: 'API Management', description: 'Manage API endpoints and configurations' },
          { id: 'system:monitoring', name: 'System Monitoring', description: 'Access system monitoring and logs' },
          { id: 'system:security', name: 'Security Settings', description: 'Configure security policies and access controls' },
          { id: 'system:performance', name: 'Performance Management', description: 'Monitor and optimize system performance' }
        ]
      },
      'User Management': {
        description: 'Permissions for managing users and their roles',
        permissions: [
          { id: 'users:all', name: 'All User Management', description: 'Full user management capabilities' },
          { id: 'users:view', name: 'View Users', description: 'View user profiles and information' },
          { id: 'users:create', name: 'Create Users', description: 'Create new user accounts' },
          { id: 'users:edit', name: 'Edit Users', description: 'Edit user profiles and settings' },
          { id: 'users:delete', name: 'Delete Users', description: 'Delete user accounts' },
          { id: 'users:roles', name: 'Manage Roles', description: 'Assign and revoke user roles' },
          { id: 'users:permissions', name: 'Manage Permissions', description: 'Manage user permissions and access' }
        ]
      },
      'Content Management': {
        description: 'Permissions for managing platform content',
        permissions: [
          { id: 'content:all', name: 'All Content Management', description: 'Full content management capabilities' },
          { id: 'content:tools', name: 'Manage Tools', description: 'Approve, edit, and manage SaaS tools' },
          { id: 'content:reviews', name: 'Manage Reviews', description: 'Moderate and manage user reviews' },
          { id: 'content:categories', name: 'Manage Categories', description: 'Create and manage tool categories' },
          { id: 'content:moderation', name: 'Content Moderation', description: 'Moderate user-generated content' }
        ]
      },
      'Verification & Testing': {
        description: 'Permissions for managing verifications and testing',
        permissions: [
          { id: 'verification:all', name: 'All Verification Management', description: 'Full verification management capabilities' },
          { id: 'verification:approve', name: 'Approve Verifications', description: 'Approve user verification requests' },
          { id: 'verification:reject', name: 'Reject Verifications', description: 'Reject user verification requests' },
          { id: 'testing:all', name: 'All Testing Management', description: 'Full testing management capabilities' },
          { id: 'testing:assign', name: 'Assign Tests', description: 'Assign testing tasks to testers' },
          { id: 'testing:review', name: 'Review Tests', description: 'Review and approve test reports' }
        ]
      },
      'Analytics & Reporting': {
        description: 'Permissions for accessing analytics and reports',
        permissions: [
          { id: 'analytics:all', name: 'All Analytics Access', description: 'Full analytics and reporting access' },
          { id: 'analytics:view', name: 'View Analytics', description: 'View platform analytics and metrics' },
          { id: 'analytics:export', name: 'Export Data', description: 'Export analytics data and reports' },
          { id: 'reports:all', name: 'All Reports Access', description: 'Full reporting capabilities' },
          { id: 'reports:generate', name: 'Generate Reports', description: 'Generate custom reports' }
        ]
      }
    };

    // Define role-permission mappings
    const rolePermissions = {
      'super_admin': {
        name: 'Super Admin',
        description: 'Full system access and control',
        permissions: Object.values(permissionCategories).flatMap(category => 
          category.permissions.map(permission => permission.id)
        )
      },
      'admin': {
        name: 'Admin',
        description: 'Administrative access to platform features',
        permissions: [
          'users:view', 'users:edit', 'users:roles',
          'content:tools', 'content:reviews', 'content:moderation',
          'verification:approve', 'verification:reject',
          'testing:assign', 'testing:review',
          'analytics:view', 'reports:generate'
        ]
      },
      'verified_tester': {
        name: 'Verified Tester',
        description: 'Can test and review SaaS tools',
        permissions: [
          'content:tools', 'testing:all'
        ]
      },
      'vendor': {
        name: 'Vendor',
        description: 'Can submit and manage their tools',
        permissions: [
          'content:tools', 'analytics:view'
        ]
      },
      'user': {
        name: 'User',
        description: 'Basic platform access',
        permissions: []
      }
    };

    // Get current permission usage statistics
    const permissionStats = await Promise.all([
      prisma.user.count({ where: { role: 'super_admin' } }),
      prisma.user.count({ where: { role: 'admin' } }),
      prisma.user.count({ where: { role: 'verified_tester' } }),
      prisma.user.count({ where: { role: 'vendor' } }),
      prisma.user.count({ where: { role: 'user' } })
    ]);

    const [superAdminCount, adminCount, verifiedTesterCount, vendorCount, userCount] = permissionStats;

    const roleUsageStats = {
      'super_admin': superAdminCount,
      'admin': adminCount,
      'verified_tester': verifiedTesterCount,
      'vendor': vendorCount,
      'user': userCount
    };

    return NextResponse.json({
      permissionCategories,
      rolePermissions,
      roleUsageStats,
      statistics: {
        totalPermissions: Object.values(permissionCategories).reduce((total, category) => total + category.permissions.length, 0),
        totalRoles: Object.keys(rolePermissions).length,
        totalUsers: Object.values(roleUsageStats).reduce((total, count) => total + count, 0)
      }
    });

  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
