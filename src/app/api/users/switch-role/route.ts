import { NextRequest, NextResponse } from 'next/server';
import { RoleManagementService } from '@/lib/services/users/role-management.service';
import { stackServerApp } from '@/lib/stack-server';

export async function POST(request: NextRequest) {
  try {
    // Get current user from Stack Auth
    const currentUser = await stackServerApp.getUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json(
        { error: 'Role is required' },
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

    // Check if user has this role
    const hasRole = await RoleManagementService.userHasRole(currentUser.id, role);
    if (!hasRole) {
      return NextResponse.json(
        { error: `You don't have access to role: ${role}` },
        { status: 403 }
      );
    }

    // Switch role
    await RoleManagementService.switchUserRole(currentUser.id, role);

    // Get updated user info
    const userWithRoles = await RoleManagementService.getUserWithRoles(currentUser.id);

    return NextResponse.json({
      success: true,
      message: `Successfully switched to ${role} role`,
      user: userWithRoles
    });

  } catch (error) {
    console.error('Error switching role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get current user from Stack Auth
    const currentUser = await stackServerApp.getUser();
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user with all roles
    const userWithRoles = await RoleManagementService.getUserWithRoles(currentUser.id);

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
