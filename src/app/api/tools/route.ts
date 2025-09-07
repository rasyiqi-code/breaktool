import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
