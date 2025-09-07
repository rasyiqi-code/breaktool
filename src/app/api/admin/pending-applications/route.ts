import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all pending verification requests with user data
    const pendingApplications = await prisma.verificationRequest.findMany({
      where: {
        status: 'pending'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Transform data to match frontend interface
    const transformedApplications = pendingApplications.map(app => ({
      id: app.id,
      userId: app.userId,
      userName: app.user.name || 'Unknown User',
      userEmail: app.user.email,
      company: app.company || 'Not specified',
      jobTitle: app.jobTitle || 'Not specified',
      expertiseAreas: app.expertiseAreas || [],
      motivation: app.motivation || 'No motivation provided',
      experienceYears: app.experienceYears || 0,
      createdAt: app.createdAt,
      status: app.status
    }));

    return NextResponse.json(transformedApplications);

  } catch (error) {
    console.error('Error fetching pending applications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
