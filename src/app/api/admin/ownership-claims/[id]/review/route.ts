import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack-server';
import { prisma } from '@/lib/prisma';

interface DatabaseClaim {
  id: string;
  tool_id: string;
  tool_name: string;
  tool_website: string;
  tool_submitted_by: string | null;
  vendor_id: string;
  vendor_name: string;
  vendor_email: string;
  reviewer_id: string | null;
  reviewer_name: string | null;
  reviewer_email: string | null;
  claim_type: string;
  company_name: string | null;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  business_registration: string | null;
  proof_of_ownership: string | null;
  additional_info: string | null;
  status: string;
  createdAt: Date;
  reviewed_at: Date | null;
  review_notes: string | null;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get authenticated user
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        id: true, 
        role: true, 
        primaryRole: true, 
        activeRole: true
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = ['admin', 'super_admin'].includes(
      dbUser.activeRole || dbUser.primaryRole || dbUser.role
    );

    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { status, reviewNotes } = body;

    // Validate status
    const validStatuses = ['approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ 
        error: 'Invalid status. Must be: approved or rejected' 
      }, { status: 400 });
    }

    // Check if claim exists using raw query
    const existingClaimResult = await prisma.$queryRaw`
      SELECT 
        toc.*,
        t.id as tool_id,
        t.name as tool_name,
        t.submitted_by as tool_submitted_by,
        v.id as vendor_id,
        v.name as vendor_name,
        v.email as vendor_email
      FROM tool_ownership_claims toc
      JOIN tools t ON toc.tool_id = t.id
      JOIN users v ON toc.vendor_id = v.id
      WHERE toc.id = ${id}
    `;
    
    const existingClaim = (existingClaimResult as DatabaseClaim[])[0];

    if (!existingClaim) {
      return NextResponse.json({ error: 'Ownership claim not found' }, { status: 404 });
    }

    if (existingClaim.status !== 'pending') {
      return NextResponse.json({ 
        error: 'Claim has already been reviewed' 
      }, { status: 409 });
    }

    // Update claim status using raw query
    await prisma.$executeRaw`
      UPDATE tool_ownership_claims 
      SET 
        status = ${status},
        reviewed_by = ${user.id},
        reviewed_at = NOW(),
        review_notes = ${reviewNotes || null},
        updatedAt = NOW()
      WHERE id = ${id}
    `;

    // Get updated claim with all related data
    const updatedClaimResult = await prisma.$queryRaw`
      SELECT 
        toc.*,
        t.id as tool_id,
        t.name as tool_name,
        t.website as tool_website,
        v.id as vendor_id,
        v.name as vendor_name,
        v.email as vendor_email,
        r.id as reviewer_id,
        r.name as reviewer_name,
        r.email as reviewer_email
      FROM tool_ownership_claims toc
      JOIN tools t ON toc.tool_id = t.id
      JOIN users v ON toc.vendor_id = v.id
      LEFT JOIN users r ON toc.reviewed_by = r.id
      WHERE toc.id = ${id}
    `;
    
    const updatedClaim = (updatedClaimResult as DatabaseClaim[])[0];

    // If approved, update tool's submittedBy field to the vendor
    if (status === 'approved') {
      await prisma.$executeRaw`
        UPDATE tools 
        SET submitted_by = ${existingClaim.vendor_id}
        WHERE id = ${existingClaim.tool_id}
      `;
    }

    return NextResponse.json({
      success: true,
      message: `Ownership claim ${status} successfully`,
      claim: {
        id: updatedClaim.id,
        tool: {
          id: updatedClaim.tool_id,
          name: updatedClaim.tool_name,
          website: updatedClaim.tool_website
        },
        vendor: {
          id: updatedClaim.vendor_id,
          name: updatedClaim.vendor_name,
          email: updatedClaim.vendor_email
        },
        claimType: updatedClaim.claim_type,
        companyName: updatedClaim.company_name,
        status: updatedClaim.status,
        reviewedAt: updatedClaim.reviewed_at,
        reviewNotes: updatedClaim.review_notes,
        reviewer: updatedClaim.reviewer_id ? {
          id: updatedClaim.reviewer_id,
          name: updatedClaim.reviewer_name,
          email: updatedClaim.reviewer_email
        } : null
      }
    });

  } catch (error) {
    console.error('Error reviewing ownership claim:', error);
    return NextResponse.json({ 
      error: 'Failed to review ownership claim' 
    }, { status: 500 });
  }
}
