import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        primaryRole: true,
        activeRole: true,
        isVerifiedTester: true,
        verificationStatus: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Use activeRole as the primary role, fallback to role if activeRole is null
    const currentRole = user.activeRole || user.role || 'user';

    // Transform to match frontend expectations
    const transformedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: currentRole,
      primaryRole: user.primaryRole,
      activeRole: user.activeRole,
      is_verified_tester: user.isVerifiedTester,
      verification_status: user.verificationStatus,
      created_at: user.createdAt,
      updated_at: user.updatedAt
    };

    return NextResponse.json(transformedUser);

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
