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
        { companyName: { contains: search, mode: 'insensitive' } },
        { industry: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Get vendor applications with pagination
    const [vendorApplications, totalCount] = await Promise.all([
      prisma.vendorApplication.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              trustScore: true,
              createdAt: true,
              submittedTools: {
                select: {
                  id: true,
                  name: true,
                  status: true,
                  createdAt: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.vendorApplication.count({ where })
    ]);

    // Calculate statistics
    const stats = await Promise.all([
      prisma.vendorApplication.count(),
      prisma.vendorApplication.count({ where: { status: 'pending' } }),
      prisma.vendorApplication.count({ where: { status: 'approved' } }),
      prisma.vendorApplication.count({ where: { status: 'rejected' } })
    ]);

    const [totalVendors, pendingVendors, approvedVendors, rejectedVendors] = stats;

    // Transform vendor data
    const transformedVendors = vendorApplications.map(vendor => ({
      id: vendor.id,
      userId: vendor.userId,
      userName: vendor.user.name || 'Unknown User',
      userEmail: vendor.user.email || 'No email',
      userAvatar: vendor.user.avatarUrl,
      userTrustScore: vendor.user.trustScore,
      userJoinDate: vendor.user.createdAt.toISOString().split('T')[0],
      companyName: vendor.companyName,
      companySize: vendor.companySize,
      industry: vendor.industry,
      websiteUrl: vendor.websiteUrl,
      linkedinUrl: vendor.linkedinUrl,
      companyDescription: vendor.companyDescription,
      productsServices: vendor.productsServices,
      targetAudience: vendor.targetAudience,
      businessModel: vendor.businessModel,
      motivation: vendor.motivation,
      status: vendor.status,
      reviewedBy: vendor.reviewedBy,
      reviewedAt: vendor.reviewedAt?.toISOString().split('T')[0],
      reviewNotes: vendor.reviewNotes,
      submittedAt: vendor.createdAt.toISOString().split('T')[0],
      updatedAt: vendor.updatedAt.toISOString().split('T')[0],
      toolsCount: vendor.user.submittedTools.length,
      tools: vendor.user.submittedTools,
      // Add missing properties for compatibility
      name: vendor.companyName,
      contact: vendor.user.name || 'Unknown User',
      email: vendor.user.email || 'No email',
      totalReviews: 0, // Placeholder
      averageRating: 0, // Placeholder
      revenue: '$0', // Placeholder
      joinDate: vendor.user.createdAt.toISOString().split('T')[0],
      lastActive: vendor.updatedAt.toISOString().split('T')[0]
    }));

    return NextResponse.json({
      vendors: transformedVendors,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      statistics: {
        totalVendors,
        pendingVendors,
        approvedVendors,
        rejectedVendors
      }
    });

  } catch (error) {
    console.error('Error fetching vendors:', error);
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
    const { vendorId, action, reviewNotes } = body;

    if (!vendorId || !action) {
      return NextResponse.json(
        { error: 'Vendor ID and action are required' },
        { status: 400 }
      );
    }

    // Update vendor application
    const updatedVendor = await prisma.vendorApplication.update({
      where: { id: vendorId },
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

    // If approved, update user's vendor status and grant vendor role
    if (action === 'approved') {
      await prisma.user.update({
        where: { id: updatedVendor.userId },
        data: {
          vendorStatus: 'approved',
          vendorApprovedAt: new Date(),
          vendorApprovedBy: currentUser.id
        }
      });

      // Grant vendor role
      await RoleManagementService.grantRoleToUser(
        updatedVendor.userId, 
        'vendor', 
        currentUser.id
      );
    } else if (action === 'rejected') {
      await prisma.user.update({
        where: { id: updatedVendor.userId },
        data: {
          vendorStatus: 'rejected',
          vendorApprovedBy: currentUser.id
        }
      });
    }

    return NextResponse.json({
      success: true,
      vendor: updatedVendor
    });

  } catch (error) {
    console.error('Error updating vendor:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
