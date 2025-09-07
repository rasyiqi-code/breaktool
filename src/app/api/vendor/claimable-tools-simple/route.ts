import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build search conditions
    const searchConditions = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { description: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    // Get tools that can be claimed (active tools) - simplified without ownership claims
    const tools = await prisma.tool.findMany({
      where: {
        status: 'active',
        ...searchConditions
      },
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    return NextResponse.json({
      success: true,
      tools: tools.map(tool => ({
        id: tool.id,
        name: tool.name,
        description: tool.description,
        website: tool.website,
        logoUrl: tool.logoUrl,
        category: tool.category,
        submittedBy: tool.submittedBy,
        createdAt: tool.createdAt,
        hasPendingClaim: false, // Simplified - no ownership claims check
        existingClaim: null
      })),
      pagination: {
        page,
        limit,
        total: tools.length,
        totalPages: Math.ceil(tools.length / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching claimable tools:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch claimable tools',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
