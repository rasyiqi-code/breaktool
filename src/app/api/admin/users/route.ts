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

    // Build where clause - exclude admin and super_admin users and avoid duplicates
    const where: any = {
      AND: [
        {
          OR: [
            { role: { notIn: ['admin', 'super_admin'] } },
            { activeRole: { notIn: ['admin', 'super_admin'] } },
            { primaryRole: { notIn: ['admin', 'super_admin'] } }
          ]
        }
      ]
    };

    // Add search conditions
    if (search) {
      where.AND.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      });
    }

    // Add role filter
    if (role) {
      where.AND.push({
        OR: [
          { role: role },
          { activeRole: role },
          { primaryRole: role }
        ]
      });
    }

    // Add status filter
    if (status) {
      if (status === 'active') {
        where.AND.push({ verificationStatus: { in: ['approved', 'verified'] } });
      } else if (status === 'pending') {
        where.AND.push({ verificationStatus: 'pending' });
      } else if (status === 'suspended') {
        where.AND.push({ verificationStatus: 'suspended' });
      }
    }


    // Get users with pagination
    const [users] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          reviews: {
            select: {
              id: true,
              overallScore: true
            }
          },
          submittedTools: {
            select: {
              id: true
            }
          },
          testingReports: {
            select: {
              id: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        distinct: ['id'] // Ensure no duplicate users
      }),
      prisma.user.count({ where })
    ]);

    // Calculate statistics (excluding admin and super_admin users)
    const stats = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.count({ where: { ...where, verificationStatus: { in: ['approved', 'verified'] } } }),
      prisma.user.count({ where: { ...where, verificationStatus: 'pending' } }),
      prisma.user.count({ where: { ...where, verificationStatus: 'suspended' } }),
      prisma.user.count({ where: { ...where, vendorStatus: 'approved' } })
    ]);

    const [totalUsers, activeUsers, pendingUsers, suspendedUsers, vendorApproved] = stats;


    // Transform users data to match frontend expectations
    const transformedUsers = users.map(user => {
      const currentRole = user.activeRole || user.role || 'user';
      const reviews = user.reviews || [];
      const tools = user.submittedTools || [];
      const tests = user.testingReports || [];
      
      // Calculate average rating
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + Number(review.overallScore || 0), 0) / reviews.length
        : 0;

      // Format dates
      const joinDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
      const lastActive = user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A';

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: currentRole,
        roles: [currentRole], // Array of roles
        status: user.verificationStatus || 'pending',
        joinDate,
        lastActive,
        trustScore: user.trustScore || 0,
        averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
        totalReviews: reviews.length,
        toolsCount: tools.length,
        testsCompleted: tests.length,
        isVerifiedTester: user.isVerifiedTester || false,
        vendorStatus: user.vendorStatus || null,
        badges: user.badges || [],
        company: user.company || '',
        location: user.location || '',
        // Keep original fields for compatibility
        is_verified_tester: user.isVerifiedTester,
        verification_status: user.verificationStatus,
        vendor_status: user.vendorStatus,
        trust_score: user.trustScore,
        total_reviews: reviews.length,
        helpful_votes_received: user.helpfulVotesReceived,
        expertise_areas: user.expertise || [],
        bio: user.bio,
        created_at: user.createdAt.toISOString(),
        verification_date: user.verifiedAt?.toISOString() || null,
        verification_proof: null,
        vendor_application: null,
        verification_request: null
      };
    });

    return NextResponse.json({
      users: transformedUsers,
      statistics: {
        totalUsers,
        activeUsers,
        pendingUsers,
        suspendedUsers,
        vendorApproved
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, email, role, company, location, bio } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    // Generate a unique ID for the new user
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        id: userId,
        name,
        email,
        role: role || 'user',
        primaryRole: role || 'user',
        activeRole: role || 'user',
        company: company || null,
        location: location || null,
        bio: bio || null,
        verificationStatus: role === 'verified_tester' ? 'approved' : 'pending',
        isVerifiedTester: role === 'verified_tester',
        vendorStatus: role === 'vendor' ? 'approved' : null,
        trustScore: 0,
        badges: role === 'vendor' ? ['vendor'] : [],
        expertise: [],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Create UserRole entry if needed
    if (role && role !== 'user') {
      await prisma.userRole.create({
        data: {
          userId: userId,
          role: role,
          isActive: true,
          grantedAt: new Date(),
          grantedBy: currentUser.id
        }
      });
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser
    });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create user',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
