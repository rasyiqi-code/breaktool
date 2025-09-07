import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack-server';
import { prisma } from '@/lib/prisma';

interface DatabaseClaim {
  id: string;
  tool_id: string;
  tool_name: string;
  tool_website: string;
  tool_logo_url: string;
  vendor_id: string;
  vendor_name: string;
  vendor_email: string;
  vendor_company: string;
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
  created_at: Date;
  reviewed_at: Date | null;
  review_notes: string | null;
}

export async function GET(request: NextRequest) {
  try {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build where clause
    const where: Record<string, string> = {};
    if (status !== 'all') {
      where.status = status;
    }

    // Get ownership claims with pagination using raw query
    let claims, totalResult;
    
    if (status === 'all') {
      [claims, totalResult] = await Promise.all([
        prisma.$queryRaw`
          SELECT 
            toc.*,
            t.id as tool_id,
            t.name as tool_name,
            t.website as tool_website,
            t.logo_url as tool_logo_url,
            v.id as vendor_id,
            v.name as vendor_name,
            v.email as vendor_email,
            v.company as vendor_company,
            r.id as reviewer_id,
            r.name as reviewer_name,
            r.email as reviewer_email
          FROM tool_ownership_claims toc
          JOIN tools t ON toc.tool_id = t.id
          JOIN users v ON toc.vendor_id = v.id
          LEFT JOIN users r ON toc.reviewed_by = r.id
          ORDER BY toc.created_at DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `,
        prisma.$queryRaw`
          SELECT COUNT(*) as count
          FROM tool_ownership_claims toc
        `
      ]);
    } else {
      [claims, totalResult] = await Promise.all([
        prisma.$queryRaw`
          SELECT 
            toc.*,
            t.id as tool_id,
            t.name as tool_name,
            t.website as tool_website,
            t.logo_url as tool_logo_url,
            v.id as vendor_id,
            v.name as vendor_name,
            v.email as vendor_email,
            v.company as vendor_company,
            r.id as reviewer_id,
            r.name as reviewer_name,
            r.email as reviewer_email
          FROM tool_ownership_claims toc
          JOIN tools t ON toc.tool_id = t.id
          JOIN users v ON toc.vendor_id = v.id
          LEFT JOIN users r ON toc.reviewed_by = r.id
          WHERE toc.status = ${status}
          ORDER BY toc.created_at DESC
          LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `,
        prisma.$queryRaw`
          SELECT COUNT(*) as count
          FROM tool_ownership_claims toc
          WHERE toc.status = ${status}
        `
      ]);
    }
    
    const total = Number((totalResult as { count: bigint }[])[0].count);

    return NextResponse.json({
      success: true,
      claims: (claims as DatabaseClaim[]).map((claim: DatabaseClaim) => ({
        id: claim.id,
        tool: {
          id: claim.tool_id,
          name: claim.tool_name,
          website: claim.tool_website,
          logoUrl: claim.tool_logo_url
        },
        vendor: {
          id: claim.vendor_id,
          name: claim.vendor_name,
          email: claim.vendor_email,
          company: claim.vendor_company
        },
        claimType: claim.claim_type,
        companyName: claim.company_name,
        contactEmail: claim.contact_email,
        contactPhone: claim.contact_phone,
        website: claim.website,
        businessRegistration: claim.business_registration,
        proofOfOwnership: claim.proof_of_ownership,
        additionalInfo: claim.additional_info,
        status: claim.status,
        createdAt: claim.created_at,
        reviewedAt: claim.reviewed_at,
        reviewNotes: claim.review_notes,
        reviewer: claim.reviewer_id ? {
          id: claim.reviewer_id,
          name: claim.reviewer_name,
          email: claim.reviewer_email
        } : null
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching ownership claims:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch ownership claims' 
    }, { status: 500 });
  }
}
