import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all tool submissions for admin review
    const tools = await prisma.tool.findMany({
      include: {
        category: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedTools = tools.map((tool: { id: string; name: string; description: string | null; category: { name: string } | null; website: string | null; submittedBy: string | null; createdAt: Date; status: string }) => ({
      id: tool.id,
      name: tool.name,
      description: tool.description || '',
      category: tool.category,
      website_url: tool.website || '',
      company: tool.submittedBy || 'Unknown',
      submitted_by: tool.submittedBy || 'Unknown',
      submitted_at: tool.createdAt.toISOString(),
      status: tool.status as 'pending' | 'approved' | 'rejected',
      review_notes: tool.description // Using description as review_notes for now
    }));

    return NextResponse.json(formattedTools);
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json({ error: 'Failed to fetch tools' }, { status: 500 });
  }
}