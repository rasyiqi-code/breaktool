import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userId,
      expertise_areas,
      company,
      job_title,
      linkedin_url,
      website_url,
      portfolio_url,
      motivation,
      experience_years,
      previous_reviews
    } = body

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    if (!expertise_areas || !Array.isArray(expertise_areas) || expertise_areas.length === 0) {
      return NextResponse.json({ error: 'At least one expertise area is required' }, { status: 400 })
    }

    if (!company?.trim()) {
      return NextResponse.json({ error: 'Company is required' }, { status: 400 })
    }

    if (!job_title?.trim()) {
      return NextResponse.json({ error: 'Job title is required' }, { status: 400 })
    }

    if (!linkedin_url?.trim()) {
      return NextResponse.json({ error: 'LinkedIn URL is required' }, { status: 400 })
    }

    if (!motivation?.trim()) {
      return NextResponse.json({ error: 'Motivation is required' }, { status: 400 })
    }

    if (!experience_years || experience_years < 1) {
      return NextResponse.json({ error: 'Experience years is required' }, { status: 400 })
    }

    // First, verify that the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true }
    })

    if (!user) {
      console.error('User not found:', userId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    console.log('Found user:', { id: user.id, email: user.email, name: user.name })

    // Check if user already has a pending application
    // Users with approved applications should be able to apply again if needed
    const existingApplication = await prisma.verificationRequest.findFirst({
      where: {
        userId: userId,
        status: 'pending'
      },
      select: {
        status: true
      }
    })

    if (existingApplication) {
      return NextResponse.json({ 
        error: `You already have a ${existingApplication.status} application` 
      }, { status: 400 })
    }

    // Create verification request
    const verificationData = {
      userId: userId,
      expertiseAreas: expertise_areas,
      company: company.trim(),
      jobTitle: job_title.trim(),
      linkedinUrl: linkedin_url.trim(),
      websiteUrl: website_url?.trim() || null,
      portfolioUrl: portfolio_url?.trim() || null,
      motivation: motivation.trim(),
      experienceYears: experience_years,
      previousReviews: previous_reviews?.trim() || null,
      status: 'pending'
    };
    
    console.log('Creating verification request with data:', verificationData);
    
    const verificationRequest = await prisma.verificationRequest.create({
      data: verificationData
    })

    // Update user's verification status to pending
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { 
          verificationStatus: 'pending',
          updatedAt: new Date()
        }
      })
    } catch (updateError) {
      console.error('Error updating user verification status:', updateError)
      // Don't fail the request if this update fails, just log it
    }

    return NextResponse.json({
      message: 'Application submitted successfully',
      application: verificationRequest
    })

  } catch (error) {
    console.error('Error in apply verification API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Only return pending or rejected applications
    // Approved applications should not block new applications
    const application = await prisma.verificationRequest.findFirst({
      where: { 
        userId: userId,
        status: {
          in: ['pending', 'rejected']
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ application })

  } catch (error) {
    console.error('Error in get verification API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
