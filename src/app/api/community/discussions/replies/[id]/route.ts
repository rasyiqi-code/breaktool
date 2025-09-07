import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: replyId } = await params;
    console.log('Delete reply API called with ID:', replyId);
    
    const { stackServerApp } = await import('@/lib/stack-server')
    const user = await stackServerApp.getUser()
    
    console.log('User:', user ? { id: user.id } : 'No user');
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (!replyId) {
      return NextResponse.json(
        { error: 'Reply ID is required' },
        { status: 400 }
      );
    }

    // Get the reply to check ownership
    const reply = await prisma.discussionReply.findUnique({
      where: { id: replyId },
      include: {
        user: true
      }
    });

    console.log('Reply found:', reply ? { id: reply.id, userId: reply.userId } : 'No reply');

    if (!reply) {
      return NextResponse.json(
        { error: 'Reply not found' },
        { status: 404 }
      );
    }

    // Check if the current user is the owner of the reply
    if (reply.userId !== user.id) {
      console.log('Ownership check failed:', { replyUserId: reply.userId, currentUserId: user.id });
      return NextResponse.json(
        { error: 'You can only delete your own replies' },
        { status: 403 }
      );
    }
    
    // Delete the reply and all its child replies
    await prisma.discussionReply.delete({
      where: { id: replyId }
    });

    console.log('Reply deleted successfully');

    return NextResponse.json(
      { message: 'Reply deleted successfully' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Error deleting reply:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
