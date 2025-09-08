import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      website,
      description,
      long_description,
      category_id,
      logo_url,
      submitter_relationship,
      additional_info,
      submitted_by,
      status = 'pending'
    } = body;

    // Validate required fields
    if (!name || !website || !submitted_by) {
      return NextResponse.json(
        { error: 'Name, website, and submitted_by are required' },
        { status: 400 }
      );
    }

    // Check if user exists and get their role
    const user = await prisma.user.findUnique({
      where: { id: submitted_by }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is admin (auto-approve for admins)
    const isAdmin = user.role === 'admin' || user.activeRole === 'admin' || user.primaryRole === 'admin';
    
    if (isAdmin) {
      // For admins, create tool directly in the main Tool table
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      
      const tool = await prisma.tool.create({
        data: {
          name,
          slug,
          description: description || null,
          longDescription: long_description || null,
          website,
          logoUrl: logo_url || null,
          categoryId: category_id || null,
          submittedBy: submitted_by,
          status: 'active', // Auto-approve for admins
          createdAt: new Date(),
          updatedAt: new Date()
        },
        include: {
          category: true
        }
      });

      return NextResponse.json({
        message: 'Tool created successfully (admin auto-approved)',
        tool: tool,
        isAdmin: true
      });
    } else {
      // For regular users, create tool submission
      const toolSubmission = await prisma.toolSubmission.create({
        data: {
          name,
          website,
          description: description || null,
          longDescription: long_description || null,
          categoryId: category_id || null,
          logoUrl: logo_url || null,
          submittedBy: submitted_by,
          submitterRelationship: submitter_relationship || null,
          additionalInfo: additional_info || null,
          status
        },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      });

      return NextResponse.json({
        message: 'Tool submission created successfully',
        submission: toolSubmission,
        isAdmin: false
      });
    }

  } catch (error) {
    console.error('Error creating tool submission:', error);
    return NextResponse.json(
      { error: 'Failed to create tool submission' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Record<string, unknown> = {};
    
    if (category && category !== 'all') {
      where.category_id = category;
    }
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [tools, totalCount] = await Promise.all([
      prisma.tool.findMany({
        where,
        include: {
          category: true,
          reviews: {
            include: {
              user: true
            }
          }
        },
        orderBy: { name: 'asc' },
        take: limit,
        skip
      }),
      prisma.tool.count({ where })
    ]);

    return NextResponse.json({
      tools,
      totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit)
    });
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}
