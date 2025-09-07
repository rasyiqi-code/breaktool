import { NextRequest, NextResponse } from 'next/server'
import { ReviewsService } from '@/lib/services/reviews/reviews.service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const toolId = searchParams.get('toolId')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!toolId) {
      return NextResponse.json({ error: 'Tool ID is required' }, { status: 400 })
    }

    const reviews = await ReviewsService.getToolReviews(toolId, { limit })
    // Add caching headers for better performance
    const response = NextResponse.json(reviews)
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')
    
    return response
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      toolId,
      title,
      content,
      value_score,
      usage_score,
      integration_score,
      pain_points,
      setup_time,
      roi_story,
      usage_recommendations,
      weaknesses,
      pros,
      cons,
      recommendation,
      use_case,
      company_size,
      industry,
      usage_duration,
      pricing_model,
      starting_price,
      pricing_details,
      review_type = 'community'
    } = body

    if (!toolId || !title || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const review = await ReviewsService.createReview({
      toolId,
      userId: 'temp-user-id', // TODO: Add proper authentication
      type: review_type,
      title,
      content,
      overallScore: Math.round((value_score + usage_score + integration_score) / 3),
      valueScore: value_score,
      usageScore: usage_score,
      integrationScore: integration_score,
      painPoints: pain_points,
      setupTime: setup_time,
      roiStory: roi_story,
      usageRecommendations: usage_recommendations,
      weaknesses,
      pros,
      cons,
      recommendation,
      useCase: use_case,
      companySize: company_size,
      industry,
      usageDuration: usage_duration,
      pricingModel: pricing_model,
      startingPrice: starting_price,
      pricingDetails: pricing_details
    })

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}
