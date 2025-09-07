import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get both approved tools and pending tool submissions for admin review
    const [approvedTools, pendingSubmissions] = await Promise.all([
      // Get approved tools from main Tool table
      prisma.tool.findMany({
        where: {
          status: 'active'
        },
        include: {
          category: {
            select: {
              name: true
            }
          },
          submitter: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      }),
      // Get pending tool submissions
      prisma.toolSubmission.findMany({
        where: {
          status: 'pending'
        },
        include: {
          category: {
            select: {
              name: true
            }
          },
          user: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    ]);

    // Format approved tools
    const formattedApprovedTools = approvedTools.map((tool: { id: string; name: string; description: string | null; category: { name: string } | null; website: string | null; logoUrl: string | null; submittedBy: string | null; createdAt: Date; status: string; submitter: { name: string | null; email: string } | null }) => ({
      id: tool.id,
      name: tool.name,
      description: tool.description || '',
      category: tool.category,
      website_url: tool.website || '',
      logo_url: tool.logoUrl || '',
      company: tool.submitter?.name || tool.submitter?.email || 'Unknown',
      submitted_by: tool.submitter?.name || tool.submitter?.email || 'Unknown',
      submitted_at: tool.createdAt.toISOString(),
      status: 'approved' as const,
      review_notes: tool.description,
      isFromMainTable: true
    }));

    // Format pending submissions
    const formattedPendingSubmissions = pendingSubmissions.map((submission: { id: string; name: string; description: string | null; category: { name: string } | null; website: string | null; logoUrl: string | null; submittedBy: string | null; createdAt: Date; status: string; user: { name: string | null; email: string } | null }) => ({
      id: submission.id,
      name: submission.name,
      description: submission.description || '',
      category: submission.category,
      website_url: submission.website || '',
      logo_url: submission.logoUrl || '',
      company: submission.user?.name || submission.user?.email || 'Unknown',
      submitted_by: submission.user?.name || submission.user?.email || 'Unknown',
      submitted_at: submission.createdAt.toISOString(),
      status: 'pending' as const,
      review_notes: submission.description,
      isFromMainTable: false
    }));

    // Combine and sort by creation date
    const allTools = [...formattedApprovedTools, ...formattedPendingSubmissions]
      .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime());

    return NextResponse.json(allTools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}