import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack-server';
import { RoleManagementService } from '@/lib/services/users/role-management.service';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      where.OR = [
        { role: role },
        { activeRole: role },
        { primaryRole: role },
        { userRoles: { some: { role: role, isActive: true } } }
      ];
    }

    if (status) {
      if (status === 'active') {
        where.verificationStatus = { in: ['approved', 'verified'] };
      } else if (status === 'pending') {
        where.verificationStatus = 'pending';
      } else if (status === 'suspended') {
        where.verificationStatus = 'suspended';
      }
    }

    // Get users with pagination
    const [users] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          userRoles: {
            where: { isActive: true }
          },
          reviews: {
            select: {
              id: true,
              overallScore: true,
              createdAt: true
            }
          },
          submittedTools: {
            select: {
              id: true,
              name: true,
              status: true
            }
          },
          testingReports: {
            select: {
              id: true,
              status: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    // Calculate statistics (commented out as not used in response)
    // const stats = await Promise.all([
    //   prisma.user.count(),
    //   prisma.user.count({ where: { verificationStatus: { in: ['approved', 'verified'] } } }),
    //   prisma.user.count({ where: { verificationStatus: 'pending' } }),
    //   prisma.user.count({ where: { verificationStatus: 'suspended' } })
    // ]);

    // Stats calculated but not used in response
    // const [_totalUsers, _activeUsers, _pendingUsers, _suspendedUsers] = stats;

    // Transform users data to match frontend expectations
    const transformedUsers = users.map(user => {
      const currentRole = user.activeRole || user.role || 'user';
      const reviews = user.reviews || [];
      // Average rating calculated but not used in response
      // const _averageRating = reviews.length > 0 
      //   ? reviews.reduce((sum, review) => sum + Number(review.overallScore || 0), 0) / reviews.length
      //   : 0;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: currentRole,
        is_verified_tester: user.isVerifiedTester,
        verification_status: user.verificationStatus,
        vendor_status: user.vendorStatus,
        trust_score: user.trustScore,
        total_reviews: reviews.length,
        helpful_votes_received: user.helpfulVotesReceived,
        badges: user.badges || [],
        expertise_areas: user.expertise || [],
        company: user.company,
        location: user.location,
        bio: user.bio,
        created_at: user.createdAt.toISOString(),
        verification_date: user.verifiedAt?.toISOString() || null,
        verification_proof: null // This field doesn't exist in the schema, keeping as null
      };
    });

    return NextResponse.json(transformedUsers);

  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
