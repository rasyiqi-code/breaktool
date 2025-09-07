import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status, review_notes } = await request.json();
    const { id: toolId } = await params;

    const updatedTool = await prisma.toolSubmission.update({
      where: { id: toolId },
      data: {
        status: status,
        reviewNotes: review_notes,
        reviewedAt: new Date()
      }
    });

    return NextResponse.json(updatedTool);
  } catch (error) {
    console.error('Error updating tool status:', error);
    return NextResponse.json({ error: 'Failed to update tool status' }, { status: 500 });
  }
}
