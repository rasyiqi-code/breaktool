import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { BadgeService } from '@/lib/services/users/badge.service';
import { stackServerApp } from '@/lib/stack-server';



export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { verification_status, review_notes } = await request.json();
    
    // Get current admin user for verifiedBy field
    const adminUser = await stackServerApp.getUser();
    const adminId = adminUser?.id || 'admin';

    if (!verification_status || !['pending', 'approved', 'rejected'].includes(verification_status)) {
      return NextResponse.json(
        { error: 'Invalid verification status value' },
        { status: 400 }
      );
    }

    // Update user table
    const updateUserData: {
      verificationStatus: string;
      updatedAt: Date;
      verifiedAt?: Date | null;
      verifiedBy?: string | null;
      isVerifiedTester?: boolean;
      role?: string;
      primaryRole?: string;
      activeRole?: string;
      roleSwitchedAt?: Date | null;
    } = {
      verificationStatus: verification_status,
      updatedAt: new Date()
    };

    // If status is approved, set verification date, verifiedBy, is_verified_tester, and role
    if (verification_status === 'approved') {
      updateUserData.verifiedAt = new Date();
      updateUserData.verifiedBy = adminId;
      updateUserData.isVerifiedTester = true;
      updateUserData.role = 'verified_tester'; // Change role to verified_tester
      
      // Update multi-role system
      updateUserData.primaryRole = 'verified_tester';
      updateUserData.activeRole = 'verified_tester';
      updateUserData.roleSwitchedAt = new Date();
    } else if (verification_status === 'rejected') {
      updateUserData.verifiedAt = null;
      updateUserData.verifiedBy = null;
      updateUserData.isVerifiedTester = false;
      updateUserData.role = 'user'; // Reset role back to user
      
      // Reset multi-role system
      updateUserData.primaryRole = 'user';
      updateUserData.activeRole = 'user';
      updateUserData.roleSwitchedAt = null;
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateUserData
    });

    // Handle multi-role system updates
    if (verification_status === 'approved') {
      // Create UserRole entry for verified_tester
      await prisma.userRole.upsert({
        where: {
          userId_role: {
            userId: id,
            role: 'verified_tester'
          }
        },
        update: {
          isActive: true,
          grantedAt: new Date(),
          grantedBy: adminId
        },
        create: {
          userId: id,
          role: 'verified_tester',
          isActive: true,
          grantedAt: new Date(),
          grantedBy: adminId
        }
      });
    } else if (verification_status === 'rejected') {
      // Deactivate verified_tester role
      await prisma.userRole.updateMany({
        where: {
          userId: id,
          role: 'verified_tester'
        },
        data: {
          isActive: false
        }
      });
    }

    // Update verification_requests table
    const updateVerificationData: {
      status: string;
      updatedAt: Date;
      reviewedBy?: string;
      reviewedAt?: Date;
      reviewNotes?: string | null;
    } = {
      status: verification_status,
      updatedAt: new Date()
    };

    if (verification_status === 'approved' || verification_status === 'rejected') {
      updateVerificationData.reviewedBy = adminId;
      updateVerificationData.reviewedAt = new Date();
      updateVerificationData.reviewNotes = review_notes || null;
    }

    // Update the latest verification request for this user
    const updatedVerification = await prisma.verificationRequest.updateMany({
      where: { 
        userId: id,
        status: 'pending' // Only update pending requests
      },
      data: updateVerificationData
    });

    // Auto-assign badges based on new status
    await BadgeService.assignVerificationBadges(id, verification_status);

    return NextResponse.json({
      user: updatedUser,
      verificationUpdated: updatedVerification.count > 0,
      badgesUpdated: true
    });

  } catch (error) {
    console.error('Error in user verification update API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
