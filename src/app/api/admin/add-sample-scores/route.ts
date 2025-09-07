import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Add sample scores to existing reviews
    const updatedReviews = await prisma.review.updateMany({
      where: {
        overallScore: null
      },
      data: {
        overallScore: 8.5,
        valueScore: 8.0,
        usageScore: 9.0,
        integrationScore: 7.5
      }
    });

    // Update tool scores based on review averages
    const toolsWithReviews = await prisma.tool.findMany({
      where: {
        reviews: {
          some: {
            overallScore: {
              not: null
            }
          }
        }
      },
      include: {
        reviews: {
          select: {
            overallScore: true,
            valueScore: true,
            usageScore: true,
            integrationScore: true
          }
        }
      }
    });

    for (const tool of toolsWithReviews) {
      const reviews = tool.reviews.filter(r => r.overallScore !== null);
      if (reviews.length > 0) {
        const avgOverall = reviews.reduce((sum, r) => sum + Number(r.overallScore), 0) / reviews.length;
        const avgValue = reviews.reduce((sum, r) => sum + Number(r.valueScore || 0), 0) / reviews.length;
        const avgUsage = reviews.reduce((sum, r) => sum + Number(r.usageScore || 0), 0) / reviews.length;
        const avgIntegration = reviews.reduce((sum, r) => sum + Number(r.integrationScore || 0), 0) / reviews.length;

        await prisma.tool.update({
          where: { id: tool.id },
          data: {
            overallScore: avgOverall,
            valueScore: avgValue,
            usageScore: avgUsage,
            integrationScore: avgIntegration
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sample scores added successfully',
      updatedReviews: updatedReviews.count
    });
  } catch (error) {
    console.error('Error adding sample scores:', error);
    return NextResponse.json(
      { error: 'Failed to add sample scores' },
      { status: 500 }
    );
  }
}
