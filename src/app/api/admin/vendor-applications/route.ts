import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Fetch pending vendor applications from the new table
    const vendorApplications = await prisma.vendorApplication.findMany({
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
        createdAt: 'desc'
      }
    });

    // Transform the data to match the VendorApplication interface
    const transformedApplications = vendorApplications.map(app => ({
      id: app.id,
      userId: app.userId,
      userName: app.user.name || 'Unknown User',
      userEmail: app.user.email || 'No email',
      companyName: app.companyName,
      companySize: app.companySize,
      industry: app.industry,
      websiteUrl: app.websiteUrl,
      linkedinUrl: app.linkedinUrl,
      companyDescription: app.companyDescription,
      productsServices: app.productsServices,
      targetAudience: app.targetAudience,
      businessModel: app.businessModel,
      motivation: app.motivation,
      createdAt: app.createdAt.toISOString(),
      status: app.status
    }));

    return NextResponse.json(transformedApplications);
  } catch (error) {
    console.error('Error fetching vendor applications:', error);
    return NextResponse.json({ error: 'Failed to fetch vendor applications' }, { status: 500 });
  }
}
