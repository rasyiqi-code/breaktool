import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || 'pending';

    const skip = (page - 1) * limit;

    // Get pending reports
    const reports = await prisma.testingReport.findMany({
      where: {
        status: status
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            description: true,
            priority: true,
            deadline: true,
            reward: true,
            status: true,
            assignedAt: true,
            startedAt: true
          }
        },
        tool: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            category: {
              select: {
                name: true
              }
            }
          }
        },
        tester: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            trustScore: true,
            isVerifiedTester: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    });

    // Get total count
    const totalCount = await prisma.testingReport.count({
      where: {
        status: status
      }
    });

    return NextResponse.json({
      reports,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching pending reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
