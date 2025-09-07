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
    const { name, description, website_url, company, category } = body;

    // Validate required fields
    if (!name || !description || !company) {
      return NextResponse.json({ 
        error: 'Name, description, and company are required' 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: { name: string; description: string; website: string | null; submittedBy: string; categoryId?: string } = {
      name: name.trim(),
      description: description.trim(),
      website: website_url?.trim() || null,
      submittedBy: company.trim(),
    };

    // Handle category update if provided
    if (category) {
      if (typeof category === 'string') {
        // Find or create category
        let categoryRecord = await prisma.category.findFirst({
          where: { name: category.trim() }
        });
        
        if (!categoryRecord) {
          categoryRecord = await prisma.category.create({
            data: { 
              name: category.trim(),
              slug: category.trim().toLowerCase().replace(/\s+/g, '-')
            }
          });
        }
        
        updateData.categoryId = categoryRecord.id;
      }
    }

    // Update the tool
    const updatedTool = await prisma.tool.update({
      where: { id },
      data: {
        name: updateData.name,
        description: updateData.description,
        website: updateData.website || undefined,
        submittedBy: updateData.submittedBy,
        ...(updateData.categoryId && { categoryId: updateData.categoryId })
      },
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
    console.error('Error updating tool:', error);
    return NextResponse.json({ error: 'Failed to update tool' }, { status: 500 });
  }
}
