import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack-server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, allow all authenticated users to access admin functions
    // TODO: Implement proper role checking when user roles are available

    const { id } = await params;
    const body = await request.json();
    const { review_notes } = body;

    if (!review_notes || typeof review_notes !== 'string') {
      return NextResponse.json({ error: 'Review notes are required' }, { status: 400 });
    }

    // Update the tool with review notes
    const updatedTool = await prisma.tool.update({
      where: { id },
      data: { description: review_notes }, // Using description field for review notes
      include: {
        category: {
          select: {
            name: true
          }
        }
      }
    });

    // Format the response to match the expected interface
    const formattedTool = {
      id: updatedTool.id,
      name: updatedTool.name,
      description: updatedTool.description || '',
      category: updatedTool.category,
      website_url: updatedTool.website || '',
      company: updatedTool.submittedBy || 'Unknown',
      submitted_by: updatedTool.submittedBy || 'Unknown',
      submitted_at: updatedTool.createdAt.toISOString(),
      status: updatedTool.status as 'pending' | 'approved' | 'rejected',
      review_notes: updatedTool.description
    };

    return NextResponse.json(formattedTool);
  } catch (error) {
    console.error('Error updating tool notes:', error);
    return NextResponse.json({ error: 'Failed to update notes' }, { status: 500 });
  }
}
