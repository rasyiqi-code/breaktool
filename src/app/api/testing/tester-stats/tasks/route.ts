import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';
import { sendTaskAssigned } from '@/lib/websocket';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const testerId = searchParams.get('testerId');
    const taskId = searchParams.get('taskId');

    const where: Prisma.TestingTaskWhereInput = {};
    
    if (status) {
      where.status = status;
    }
    
    if (testerId) {
      where.testerId = testerId;
    }
    
    if (taskId) {
      where.id = taskId;
    }

    const tasks = await prisma.testingTask.findMany({
      where,
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
      },
      orderBy: {
        deadline: 'asc'
      }
    });

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error fetching testing tasks:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { toolId, testerId, title, description, priority, deadline, reward } = body;

    const task = await prisma.testingTask.create({
      data: {
        toolId,
        testerId,
        title,
        description,
        priority: priority || 'medium',
        deadline: new Date(deadline),
        reward: reward || 0,
        status: 'pending'
      },
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

    // Send real-time notification to the assigned tester
    try {
      sendTaskAssigned(task, testerId);
    } catch (error) {
      console.error('Error sending real-time notification:', error);
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error creating testing task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
