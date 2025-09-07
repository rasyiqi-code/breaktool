import { NextRequest, NextResponse } from 'next/server';
import { RoleManagementService } from '@/lib/services/users/role-management.service';
import { stackServerApp } from '@/lib/stack-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const currentUser = await stackServerApp.getUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if current user is admin
    const hasAdminRole = await RoleManagementService.userHasRole(currentUser.id, 'admin') ||
                         await RoleManagementService.userHasRole(currentUser.id, 'super_admin');
    
    if (!hasAdminRole) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id: userId } = await params;

    // Get user with all roles
    const userWithRoles = await RoleManagementService.getUserWithRoles(userId);

    if (!userWithRoles) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userWithRoles
    });

  } catch (error) {
    console.error('Error getting user roles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const currentUser = await stackServerApp.getUser();
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if current user is admin
    const hasAdminRole = await RoleManagementService.userHasRole(currentUser.id, 'admin') ||
                         await RoleManagementService.userHasRole(currentUser.id, 'super_admin');
    
    if (!hasAdminRole) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { id: userId } = await params;
    const body = await request.json();
    const { role, action } = body;

    if (!role || !action) {
      return NextResponse.json(
        { error: 'Role and action are required' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['user', 'verified_tester', 'vendor', 'admin', 'super_admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Validate action
    if (!['grant', 'revoke'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "grant" or "revoke"' },
        { status: 400 }
      );
    }

    if (action === 'grant') {
      await RoleManagementService.grantRoleToUser(userId, role, currentUser.id);
    } else {
      await RoleManagementService.revokeRoleFromUser(userId, role);
    }

    // Get updated user info
    const userWithRoles = await RoleManagementService.getUserWithRoles(userId);

    return NextResponse.json({
      success: true,
      message: `Successfully ${action}ed ${role} role`,
      user: userWithRoles
    });

  } catch (error) {
    console.error('Error managing user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
