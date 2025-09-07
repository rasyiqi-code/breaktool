import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stackServerApp } from '@/lib/stack-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const task = await prisma.testingTask.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        deadline: true,
        reward: true,
        assignedAt: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
        tool: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            category: {
              select: {
                name: true
              }
            }
          }
        },
        tester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to update this task
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, activeRole: true }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { id } = await params;
    const userRole = userData.role || userData.activeRole || '';
    const isAdmin = ['admin', 'super_admin'].includes(userRole);
    
    // If not admin, check if user is the assigned tester for this task
    if (!isAdmin) {
      const task = await prisma.testingTask.findUnique({
        where: { id },
        select: { testerId: true }
      });

      if (!task || task.testerId !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    }
    const body = await request.json();
    const { status, title, description, priority, deadline, reward, startedAt, completedAt } = body;

    const updateData: {
      status?: string;
      title?: string;
      description?: string;
      priority?: string;
      deadline?: Date;
      reward?: number;
      startedAt?: Date;
      completedAt?: Date;
    } = {};
    if (status !== undefined) updateData.status = status;
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (deadline !== undefined) updateData.deadline = new Date(deadline);
    if (reward !== undefined) updateData.reward = reward;
    if (startedAt !== undefined) updateData.startedAt = new Date(startedAt);
    if (completedAt !== undefined) updateData.completedAt = new Date(completedAt);

    const task = await prisma.testingTask.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        deadline: true,
        reward: true,
        assignedAt: true,
        startedAt: true,
        completedAt: true,
        createdAt: true,
        tool: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            category: {
              select: {
                name: true
              }
            }
          }
        },
        tester: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await stackServerApp.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has admin role
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { role: true, activeRole: true }
    });

    if (!userData || !['admin', 'super_admin'].includes(userData.role || userData.activeRole || '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    // Check if task exists
    const existingTask = await prisma.testingTask.findUnique({
      where: { id }
    });

    if (!existingTask) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    await prisma.testingTask.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
