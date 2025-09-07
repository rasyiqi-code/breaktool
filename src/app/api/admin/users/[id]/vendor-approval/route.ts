import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BadgeService } from '@/lib/services/users/badge.service';
import { stackServerApp } from '@/lib/stack-server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await request.json();
    const { status, review_notes } = body;
    
    // Get current admin user for vendorApprovedBy field
    const adminUser = await stackServerApp.getUser();
    const adminId = adminUser?.id || 'admin';

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    // Update user role and vendor status
    const updateData: {
      updatedAt: Date;
      role?: string;
      vendorStatus?: string;
      vendorApprovedAt?: Date;
      vendorApprovedBy?: string;
      primaryRole?: string;
      activeRole?: string;
      roleSwitchedAt?: Date | null;
    } = {
      updatedAt: new Date()
    };

    if (status === 'approved') {
      updateData.role = 'vendor';
      updateData.vendorStatus = 'approved';
      updateData.vendorApprovedAt = new Date();
      updateData.vendorApprovedBy = adminId;
      
      // Update multi-role system
      updateData.primaryRole = 'vendor';
      updateData.activeRole = 'vendor';
      updateData.roleSwitchedAt = new Date();
    } else {
      updateData.vendorStatus = 'rejected';
      
      // Reset multi-role system if rejected
      updateData.primaryRole = 'user';
      updateData.activeRole = 'user';
      updateData.roleSwitchedAt = null;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Handle multi-role system updates
    if (status === 'approved') {
      // Create UserRole entry for vendor
      await prisma.userRole.upsert({
        where: {
          userId_role: {
            userId: userId,
            role: 'vendor'
          }
        },
        update: {
          isActive: true,
          grantedAt: new Date(),
          grantedBy: adminId
        },
        create: {
          userId: userId,
          role: 'vendor',
          isActive: true,
          grantedAt: new Date(),
          grantedBy: adminId
        }
      });
    } else if (status === 'rejected') {
      // Deactivate vendor role
      await prisma.userRole.updateMany({
        where: {
          userId: userId,
          role: 'vendor'
        },
        data: {
          isActive: false
        }
      });
    }

    // Update vendor application status
    await prisma.vendorApplication.updateMany({
      where: { userId: userId, status: 'pending' },
      data: {
        status: status,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        reviewNotes: review_notes
      }
    });

    // Auto-assign badges based on new vendor status
    await BadgeService.assignVendorBadges(userId, status);

    return NextResponse.json({
      message: `Vendor application ${status} successfully`,
      user: updatedUser,
      badgesUpdated: true
    });

  } catch (error) {
    console.error('Error updating vendor application:', error);
    return NextResponse.json(
      { error: 'Failed to update vendor application' },
      { status: 500 }
    );
  }
}
