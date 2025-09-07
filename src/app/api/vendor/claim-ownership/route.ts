import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack-server';
import { prisma } from '@/lib/prisma';

interface DatabaseClaim {
  id: string;
  tool_id: string;
  tool_name: string;
  tool_website: string;
  tool_logo_url: string;
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

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has vendor role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        id: true, 
        role: true, 
        primaryRole: true, 
        activeRole: true,
        vendorStatus: true
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isVendor = ['vendor', 'admin', 'super_admin'].includes(
      dbUser.activeRole || dbUser.primaryRole || dbUser.role
    ) || dbUser.vendorStatus === 'approved';

    if (!isVendor) {
      return NextResponse.json({ 
        error: 'Vendor access required. Please apply for vendor status first.' 
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      toolId,
      claimType,
      companyName,
      contactEmail,
      contactPhone,
      website,
      businessRegistration,
      proofOfOwnership,
      additionalInfo
    } = body;

    // Validate required fields
    if (!toolId || !claimType || !contactEmail) {
      return NextResponse.json({ 
        error: 'Missing required fields: toolId, claimType, contactEmail' 
      }, { status: 400 });
    }

    // Validate claim type
    const validClaimTypes = ['owner', 'representative', 'affiliate'];
    if (!validClaimTypes.includes(claimType)) {
      return NextResponse.json({ 
        error: 'Invalid claim type. Must be: owner, representative, or affiliate' 
      }, { status: 400 });
    }

    // Check if tool exists
    const tool = await prisma.tool.findUnique({
      where: { id: toolId },
      select: { id: true, name: true, website: true }
    });

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    // Check if user already has a claim for this tool
    const existingClaim = await prisma.$queryRaw`
      SELECT * FROM tool_ownership_claims 
      WHERE tool_id = ${toolId} AND vendor_id = ${user.id}
      LIMIT 1
    `;

    if (existingClaim && Array.isArray(existingClaim) && existingClaim.length > 0) {
      const claim = existingClaim[0] as DatabaseClaim;
      return NextResponse.json({ 
        error: 'You already have a claim for this tool',
        existingClaim: {
          id: claim.id,
          status: claim.status,
          createdAt: claim.created_at
        }
      }, { status: 409 });
    }

    // Create ownership claim using raw query
    const claimId = `claim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await prisma.$executeRaw`
      INSERT INTO tool_ownership_claims (
        id, tool_id, vendor_id, claim_type, company_name, 
        contact_email, contact_phone, website, business_registration, 
        proof_of_ownership, additional_info, status, created_at, updated_at
      ) VALUES (
        ${claimId}, ${toolId}, ${user.id}, ${claimType}, ${companyName || null},
        ${contactEmail}, ${contactPhone || null}, ${website || null}, ${businessRegistration || null},
        ${proofOfOwnership || null}, ${additionalInfo || null}, 'pending', NOW(), NOW()
      )
    `;

    // Get the created claim with tool info
    const claim = await prisma.$queryRaw`
      SELECT 
        toc.*,
        t.id as tool_id,
        t.name as tool_name,
        t.website as tool_website
      FROM tool_ownership_claims toc
      JOIN tools t ON toc.tool_id = t.id
      WHERE toc.id = ${claimId}
    `;

    const claimData = (claim as DatabaseClaim[])[0];
    return NextResponse.json({
      success: true,
      message: 'Ownership claim submitted successfully',
      claim: {
        id: claimData.id,
        tool: {
          id: claimData.tool_id,
          name: claimData.tool_name,
          website: claimData.tool_website
        },
        claimType: claimData.claim_type,
        companyName: claimData.company_name,
        status: claimData.status,
        createdAt: claimData.created_at
      }
    });

  } catch (error) {
    console.error('Error creating ownership claim:', error);
    return NextResponse.json({ 
      error: 'Failed to create ownership claim' 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Get authenticated user
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has vendor role
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { 
        id: true, 
        role: true, 
        primaryRole: true, 
        activeRole: true,
        vendorStatus: true
      }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isVendor = ['vendor', 'admin', 'super_admin'].includes(
      dbUser.activeRole || dbUser.primaryRole || dbUser.role
    ) || dbUser.vendorStatus === 'approved';

    if (!isVendor) {
      return NextResponse.json({ 
        error: 'Vendor access required' 
      }, { status: 403 });
    }

    // Get user's ownership claims using raw query
    const claims = await prisma.$queryRaw`
      SELECT 
        toc.*,
        t.id as tool_id,
        t.name as tool_name,
        t.website as tool_website,
        t.logo_url as tool_logo_url
      FROM tool_ownership_claims toc
      JOIN tools t ON toc.tool_id = t.id
      WHERE toc.vendor_id = ${user.id}
      ORDER BY toc.created_at DESC
    `;

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
        claimType: claim.claim_type,
        companyName: claim.company_name,
        status: claim.status,
        createdAt: claim.created_at,
        reviewedAt: claim.reviewed_at,
        reviewNotes: claim.review_notes
      }))
    });

  } catch (error) {
    console.error('Error fetching ownership claims:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch ownership claims' 
    }, { status: 500 });
  }
}
