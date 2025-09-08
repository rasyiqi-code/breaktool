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

    // Build where clause
    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { company: { contains: search, mode: 'insensitive' } },
        { jobTitle: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get verification requests with pagination
    const [verifications, totalCount] = await Promise.all([
      prisma.verificationRequest.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              trustScore: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.verificationRequest.count({ where })
    ]);

    // Calculate statistics
    const stats = await Promise.all([
      prisma.verificationRequest.count(),
      prisma.verificationRequest.count({ where: { status: 'pending' } }),
      prisma.verificationRequest.count({ where: { status: 'approved' } }),
      prisma.verificationRequest.count({ where: { status: 'rejected' } })
    ]);

    const [totalVerifications, pendingVerifications, approvedVerifications, rejectedVerifications] = stats;

    // Transform verification data
    const transformedVerifications = verifications.map(verification => ({
      id: verification.id,
      userId: verification.userId,
      userName: verification.user.name || 'Unknown User',
      userEmail: verification.user.email || 'No email',
      userAvatar: verification.user.avatarUrl,
      userTrustScore: verification.user.trustScore,
      userJoinDate: verification.user.createdAt.toISOString().split('T')[0],
      expertiseAreas: verification.expertiseAreas,
      company: verification.company,
      jobTitle: verification.jobTitle,
      linkedinUrl: verification.linkedinUrl,
      websiteUrl: verification.websiteUrl,
      portfolioUrl: verification.portfolioUrl,
      motivation: verification.motivation,
      experienceYears: verification.experienceYears,
      previousReviews: verification.previousReviews,
      status: verification.status,
      reviewedBy: verification.reviewedBy,
      reviewedAt: verification.reviewedAt?.toISOString().split('T')[0],
      reviewNotes: verification.reviewNotes,
      submittedAt: verification.createdAt.toISOString().split('T')[0],
      updatedAt: verification.updatedAt.toISOString().split('T')[0],
      // Add missing properties for compatibility
      type: 'tester_verification', // Default type
      user: {
        name: verification.user.name || 'Unknown User',
        email: verification.user.email || 'No email',
        joinDate: verification.user.createdAt.toISOString().split('T')[0]
      },
      experience: `${verification.experienceYears || 0} years`,
      reason: verification.motivation || 'No reason provided',
      documents: [] // Placeholder - no documents in current schema
    }));

    return NextResponse.json({
      verifications: transformedVerifications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      statistics: {
        totalVerifications,
        pendingVerifications,
        approvedVerifications,
        rejectedVerifications
      }
    });

  } catch (error) {
    console.error('Error fetching verifications:', error);
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
    const { verificationId, action, reviewNotes } = body;

    if (!verificationId || !action) {
      return NextResponse.json(
        { error: 'Verification ID and action are required' },
        { status: 400 }
      );
    }

    // Update verification request
    const updatedVerification = await prisma.verificationRequest.update({
      where: { id: verificationId },
      data: {
        status: action,
        reviewedBy: currentUser.id,
        reviewedAt: new Date(),
        reviewNotes: reviewNotes || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // If approved, update user's verification status
    if (action === 'approved') {
      await prisma.user.update({
        where: { id: updatedVerification.userId },
        data: {
          isVerifiedTester: true,
          verificationStatus: 'approved',
          verifiedAt: new Date(),
          verifiedBy: currentUser.id
        }
      });

      // Grant verified_tester role
      await RoleManagementService.grantRoleToUser(
        updatedVerification.userId, 
        'verified_tester', 
        currentUser.id
      );
    } else if (action === 'rejected') {
      await prisma.user.update({
        where: { id: updatedVerification.userId },
        data: {
          verificationStatus: 'rejected',
          verifiedBy: currentUser.id
        }
      });
    }

    return NextResponse.json({
      success: true,
      verification: updatedVerification
    });

  } catch (error) {
    console.error('Error updating verification:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
