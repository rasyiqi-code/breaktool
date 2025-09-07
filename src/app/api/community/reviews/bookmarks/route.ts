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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get bookmarked reviews for the user
    const bookmarks = await prisma.review.findMany({
      where: {
        bookmarkedBy: {
          has: userId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        tool: {
          select: {
            id: true,
            name: true,
            slug: true,
            website: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      bookmarks
    });

  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch bookmarks' 
    }, { status: 500 });
  }
}
