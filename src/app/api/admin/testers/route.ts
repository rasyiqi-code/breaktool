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
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    // Build where clause for verified testers
    const where: Record<string, unknown> = {
      isVerifiedTester: true
    };

    if (status) {
      if (status === 'active') {
        where.verificationStatus = { in: ['approved', 'verified'] };
      } else if (status === 'pending') {
        where.verificationStatus = 'pending';
      } else if (status === 'suspended') {
        where.verificationStatus = 'suspended';
      }
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get verified testers with pagination
    const [testers, totalCount] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          userRoles: {
            where: { role: 'verified_tester', isActive: true }
          },
          reviews: {
            select: {
              id: true,
              overallScore: true,
              createdAt: true,
              tool: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          testingReports: {
            select: {
              id: true,
              status: true,
              createdAt: true,
              tool: {
                select: {
                  id: true,
                  name: true
                }
              }
            }
          },
          verificationRequests: {
            where: { status: 'approved' },
            select: {
              id: true,
              expertiseAreas: true,
              experienceYears: true,
              company: true,
              jobTitle: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    // Calculate statistics
    const stats = await Promise.all([
      prisma.user.count({ where: { isVerifiedTester: true } }),
      prisma.user.count({ 
        where: { 
          isVerifiedTester: true,
          verificationStatus: { in: ['approved', 'verified'] }
        } 
      }),
      prisma.user.count({ 
        where: { 
          isVerifiedTester: true,
          verificationStatus: 'pending'
        } 
      }),
      prisma.user.count({ 
        where: { 
          isVerifiedTester: true,
          verificationStatus: 'suspended'
        } 
      })
    ]);

    const [totalTesters, activeTesters, pendingTesters, suspendedTesters] = stats;

    // Transform tester data
    const transformedTesters = testers.map(tester => {
      const reviews = tester.reviews || [];
      const averageRating = reviews.length > 0 
        ? reviews.reduce((sum, review) => sum + Number(review.overallScore || 0), 0) / reviews.length
        : 0;

      const verificationRequest = tester.verificationRequests[0];
      
      return {
        id: tester.id,
        name: tester.name,
        email: tester.email,
        avatarUrl: tester.avatarUrl,
        trustScore: tester.trustScore,
        joinDate: tester.createdAt.toISOString().split('T')[0],
        lastActive: tester.updatedAt.toISOString().split('T')[0],
        status: tester.verificationStatus,
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        totalTests: tester.testingReports.length,
        testsCompleted: tester.testingReports.length, // Add this
        totalEarnings: '$0', // Add this - placeholder
        specializations: verificationRequest?.expertiseAreas || [], // Add this
        expertiseAreas: verificationRequest?.expertiseAreas || [],
        experienceYears: verificationRequest?.experienceYears || 0,
        company: verificationRequest?.company || tester.company,
        jobTitle: verificationRequest?.jobTitle,
        badges: tester.badges,
        location: tester.location,
        verifiedAt: tester.verifiedAt?.toISOString().split('T')[0],
        recentReviews: reviews.slice(0, 3).map(review => ({
          id: review.id,
          toolName: review.tool.name,
          score: review.overallScore,
          date: review.createdAt.toISOString().split('T')[0]
        })),
        recentTests: tester.testingReports.slice(0, 3).map(test => ({
          id: test.id,
          toolName: test.tool.name,
          status: test.status,
          date: test.createdAt.toISOString().split('T')[0]
        }))
      };
    });

    return NextResponse.json({
      testers: transformedTesters,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      statistics: {
        totalTesters,
        activeTesters,
        pendingTesters,
        suspendedTesters
      }
    });

  } catch (error) {
    console.error('Error fetching testers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
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
    const { testerId, action } = body;

    if (!testerId || !action) {
      return NextResponse.json(
        { error: 'Tester ID and action are required' },
        { status: 400 }
      );
    }

    // Update tester status
    const updatedTester = await prisma.user.update({
      where: { id: testerId },
      data: {
        verificationStatus: action,
        updatedAt: new Date()
      },
      include: {
        userRoles: {
          where: { role: 'verified_tester' }
        }
      }
    });

    // If suspended, deactivate the verified_tester role
    if (action === 'suspended') {
      await prisma.userRole.updateMany({
        where: { 
          userId: testerId,
          role: 'verified_tester'
        },
        data: { isActive: false }
      });
    } else if (action === 'approved' && updatedTester.userRoles.length === 0) {
      // If approved and no verified_tester role exists, grant it
      await RoleManagementService.grantRoleToUser(
        testerId, 
        'verified_tester', 
        currentUser.id
      );
    }

    return NextResponse.json({
      success: true,
      tester: updatedTester
    });

  } catch (error) {
    console.error('Error updating tester:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
