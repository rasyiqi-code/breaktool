import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, toolIds } = body;

    if (!action || !toolIds || !Array.isArray(toolIds) || toolIds.length === 0) {
      return NextResponse.json(
        { error: 'Action and toolIds are required' },
        { status: 400 }
      );
    }

    if (!['approve', 'reject', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be approve, reject, or remove' },
        { status: 400 }
      );
    }

    let result = {};

    switch (action) {
      case 'approve':
        result = await handleBulkApprove(toolIds);
        break;
      case 'reject':
        result = await handleBulkReject(toolIds);
        break;
      case 'remove':
        result = await handleBulkRemove(toolIds);
        break;
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error('Error in bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}

async function handleBulkApprove(toolIds: string[]) {
  let approved = 0;
  let errors = 0;

  for (const toolId of toolIds) {
    try {
      // Check if it's a submission or already approved tool
      const submission = await prisma.toolSubmission.findUnique({
        where: { id: toolId },
        include: { category: true }
      });

      if (submission) {
        // Create tool in main table
        const slug = submission.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        await prisma.tool.create({
          data: {
            name: submission.name,
            slug,
            description: submission.description,
            longDescription: submission.longDescription,
            website: submission.website,
            logoUrl: submission.logoUrl,
            categoryId: submission.categoryId,
            submittedBy: submission.submittedBy,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });

        // Update submission status
        await prisma.toolSubmission.update({
          where: { id: toolId },
          data: {
            status: 'approved',
            reviewedAt: new Date()
          }
        });

        approved++;
      } else {
        // Check if it's already an approved tool
        const existingTool = await prisma.tool.findUnique({
          where: { id: toolId }
        });

        if (existingTool && existingTool.status !== 'active') {
          await prisma.tool.update({
            where: { id: toolId },
            data: {
              status: 'active',
              updatedAt: new Date()
            }
          });
          approved++;
        }
      }
    } catch (error) {
      console.error(`Error approving tool ${toolId}:`, error);
      errors++;
    }
  }

  return { approved, errors, total: toolIds.length };
}

async function handleBulkReject(toolIds: string[]) {
  let rejected = 0;
  let errors = 0;

  for (const toolId of toolIds) {
    try {
      // Check if it's a submission
      const submission = await prisma.toolSubmission.findUnique({
        where: { id: toolId }
      });

      if (submission) {
        await prisma.toolSubmission.update({
          where: { id: toolId },
          data: {
            status: 'rejected',
            reviewedAt: new Date()
          }
        });
        rejected++;
      } else {
        // Check if it's an approved tool
        const existingTool = await prisma.tool.findUnique({
          where: { id: toolId }
        });

        if (existingTool) {
          await prisma.tool.update({
            where: { id: toolId },
            data: {
              status: 'rejected',
              updatedAt: new Date()
            }
          });
          rejected++;
        }
      }
    } catch (error) {
      console.error(`Error rejecting tool ${toolId}:`, error);
      errors++;
    }
  }

  return { rejected, errors, total: toolIds.length };
}

async function handleBulkRemove(toolIds: string[]) {
  let removed = 0;
  let errors = 0;

  for (const toolId of toolIds) {
    try {
      // Try to delete from main tools table first
      const deletedTool = await prisma.tool.delete({
        where: { id: toolId }
      }).catch(() => null);

      if (deletedTool) {
        removed++;
        continue;
      }

      // If not found in main table, try to delete from submissions
      const deletedSubmission = await prisma.toolSubmission.delete({
        where: { id: toolId }
      }).catch(() => null);

      if (deletedSubmission) {
        removed++;
      }
    } catch (error) {
      console.error(`Error removing tool ${toolId}:`, error);
      errors++;
    }
  }

  return { removed, errors, total: toolIds.length };
}
