import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      company_name,
      company_size,
      industry,
      website_url,
      linkedin_url,
      company_description,
      products_services,
      target_audience,
      business_model,
      motivation
    } = body;

    // Validate required fields
    if (!userId || !company_name || !company_size || !industry || !website_url || 
        !company_description || !products_services || !target_audience || !business_model || !motivation) {
      return NextResponse.json(
        { error: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a pending or approved vendor application
    // For now, we'll check if user already has vendor role or pending verification
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (existingUser?.role === 'vendor') {
      return NextResponse.json(
        { error: 'User is already a vendor' },
        { status: 400 }
      );
    }

    // Create vendor application in the new table
    const vendorApplication = await prisma.vendorApplication.create({
      data: {
        userId: userId,
        companyName: company_name,
        companySize: company_size,
        industry: industry,
        websiteUrl: website_url,
        linkedinUrl: linkedin_url || null,
        companyDescription: company_description,
        productsServices: products_services,
        targetAudience: target_audience,
        businessModel: business_model,
        motivation: motivation,
        status: 'pending'
      }
    });

    // Update user's vendor status
    // Note: This will work after running the migration
    await prisma.user.update({
      where: { id: userId },
      data: {
        vendorStatus: 'pending'
      }
    });

    return NextResponse.json({
      message: 'Vendor application submitted successfully',
      application: vendorApplication,
      status: 'pending'
    });

  } catch (error) {
    console.error('Error submitting vendor application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user is already a vendor
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
        vendorStatus: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json(null);
    }

    // If user is vendor, return vendor status
    if (user.role === 'vendor') {
      const transformedApplication = {
        id: 'vendor-' + userId,
        userId: userId,
        companyName: 'Vendor Account',
        companySize: 'N/A',
        industry: 'N/A',
        websiteUrl: 'N/A',
        linkedinUrl: null,
        companyDescription: 'Vendor account',
        productsServices: 'N/A',
        targetAudience: 'N/A',
        businessModel: 'N/A',
        motivation: 'N/A',
        status: 'approved',
        reviewNotes: null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: new Date().toISOString()
      };

      return NextResponse.json(transformedApplication);
    }

    // Check if user has any vendor application (pending, approved, or rejected)
    if (user.vendorStatus) {
      const vendorApplication = await prisma.vendorApplication.findFirst({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' }
      });

      if (vendorApplication) {
        return NextResponse.json(vendorApplication);
      }
    }

    // No vendor application found
    return NextResponse.json(null);

  } catch (error) {
    console.error('Error fetching vendor application:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
