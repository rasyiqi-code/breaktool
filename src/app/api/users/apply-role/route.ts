import { NextRequest, NextResponse } from 'next/server';
import { RoleManagementService } from '@/lib/services/users/role-management.service';
import { stackServerApp } from '@/lib/stack-server';
import { prisma } from '@/lib/prisma';

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
    const { targetRole, applicationData } = body;

    if (!targetRole) {
      return NextResponse.json(
        { error: 'Target role is required' },
        { status: 400 }
      );
    }

    // Validate target role
    const validTargetRoles = ['verified_tester', 'vendor'];
    if (!validTargetRoles.includes(targetRole)) {
      return NextResponse.json(
        { error: 'Invalid target role. Only verified_tester and vendor are allowed' },
        { status: 400 }
      );
    }

    // Check if user already has this role
    const hasRole = await RoleManagementService.userHasRole(currentUser.id, targetRole);
    if (hasRole) {
      return NextResponse.json(
        { error: `You already have the ${targetRole} role` },
        { status: 400 }
      );
    }

    // Handle different role applications
    if (targetRole === 'verified_tester') {
      // Create verification request
      const verificationRequest = await prisma.verificationRequest.create({
        data: {
          userId: currentUser.id,
          expertiseAreas: applicationData?.expertiseAreas || [],
          company: applicationData?.company || null,
          jobTitle: applicationData?.jobTitle || null,
          linkedinUrl: applicationData?.linkedinUrl || null,
          websiteUrl: applicationData?.websiteUrl || null,
          portfolioUrl: applicationData?.portfolioUrl || null,
          motivation: applicationData?.motivation || null,
          experienceYears: applicationData?.experienceYears || null,
          previousReviews: applicationData?.previousReviews || null,
          status: 'pending'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Tester verification request submitted successfully',
        requestId: verificationRequest.id,
        status: 'pending'
      });

    } else if (targetRole === 'vendor') {
      // Create vendor application
      const vendorApplication = await prisma.vendorApplication.create({
        data: {
          userId: currentUser.id,
          companyName: applicationData.company_name || 'N/A',
          companySize: applicationData.company_size || 'N/A',
          industry: applicationData.industry || 'N/A',
          websiteUrl: applicationData.website_url || 'N/A',
          linkedinUrl: applicationData.linkedin_url || null,
          companyDescription: applicationData.company_description || 'N/A',
          productsServices: applicationData.products_services || 'N/A',
          targetAudience: applicationData.target_audience || 'N/A',
          businessModel: applicationData.business_model || 'N/A',
          motivation: applicationData.motivation || 'N/A',
          status: 'pending'
        }
      });

      // Update user's vendor status
      await prisma.user.update({
        where: { id: currentUser.id },
        data: {
          vendorStatus: 'pending'
        }
      });

      return NextResponse.json({
        success: true,
        message: 'Vendor application submitted successfully',
        applicationId: vendorApplication.id,
        status: 'pending'
      });
    }

  } catch (error) {
    console.error('Error applying for role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
