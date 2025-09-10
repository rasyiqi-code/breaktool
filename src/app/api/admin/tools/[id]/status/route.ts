import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { status, review_notes, isFromMainTable } = await request.json();
    const { id: toolId } = await params;

    if (isFromMainTable) {
      // Handle tools from main Tool table (already approved)
      if (status === 'rejected') {
        // Delete from main table if rejected
        await prisma.tool.delete({
          where: { id: toolId }
        });
        
        return NextResponse.json({ 
          message: 'Tool deleted successfully',
          deleted: true 
        });
      } else {
        // Update status in main table
        const updatedTool = await prisma.tool.update({
          where: { id: toolId },
          data: {
            status: status,
            updatedAt: new Date()
          }
        });

        return NextResponse.json(updatedTool);
      }
    } else {
      // Handle tool submissions
      if (status === 'approved') {
        // Get the submission
        const submission = await prisma.toolSubmission.findUnique({
          where: { id: toolId },
          include: { category: true }
        });

        if (!submission) {
          return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
        }

        // Validate required fields
        if (!submission.name || !submission.website) {
          return NextResponse.json({ 
            error: 'Missing required fields: name and website are required' 
          }, { status: 400 });
        }

        // Create tool in main table
        let slug = submission.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        // Ensure slug is unique
        let counter = 1;
        const originalSlug = slug;
        while (await prisma.tool.findUnique({ where: { slug } })) {
          slug = `${originalSlug}-${counter}`;
          counter++;
        }
        
        const newTool = await prisma.tool.create({
          data: {
            name: submission.name,
            slug,
            description: submission.description,
            longDescription: submission.longDescription,
            website: submission.website,
            logoUrl: submission.logoUrl,
            categoryId: submission.categoryId,
            submittedBy: submission.submittedBy,
            status: 'active'
          },
          include: {
            category: true
          }
        });

        // Update submission status
        await prisma.toolSubmission.update({
          where: { id: toolId },
          data: {
            status: 'approved',
            reviewNotes: review_notes,
            reviewedAt: new Date()
          }
        });

        return NextResponse.json({
          message: 'Tool approved and created successfully',
          tool: newTool
        });
      } else {
        // Reject submission
        const updatedSubmission = await prisma.toolSubmission.update({
          where: { id: toolId },
          data: {
            status: 'rejected',
            reviewNotes: review_notes,
            reviewedAt: new Date()
          }
        });

        return NextResponse.json(updatedSubmission);
      }
    }
  } catch (error) {
    console.error('Error updating tool status:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      toolId: await params.then(p => p.id).catch(() => 'unknown')
    });
    return NextResponse.json({ 
      error: 'Failed to update tool status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
