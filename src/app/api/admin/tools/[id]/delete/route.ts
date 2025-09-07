import { NextRequest, NextResponse } from 'next/server';
import { stackServerApp } from '@/lib/stack-server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
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

    // Check if tool exists
    const tool = await prisma.tool.findUnique({
      where: { id }
    });

    if (!tool) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }

    // Delete the tool
    await prisma.tool.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Tool deleted successfully' });
  } catch (error) {
    console.error('Error deleting tool:', error);
    return NextResponse.json({ error: 'Failed to delete tool' }, { status: 500 });
  }
}
