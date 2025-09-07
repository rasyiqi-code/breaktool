import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/utils/supabase-client';

interface ComparisonMetrics {
  rating: Record<string, number>;
  reviews: Record<string, number>;
  votes: Record<string, number>;
  age: Record<string, number>;
}

export async function POST(request: NextRequest) {
  try {
    const { toolIds } = await request.json();

    if (!toolIds || !Array.isArray(toolIds) || toolIds.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 tool IDs are required for comparison' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // Fetch tools with their reviews
    const { data: tools, error } = await supabase
      .from('tools')
      .select(`
        *,
        reviews (
          id,
          rating,
          helpful_votes,
          total_votes,
          pros,
          cons,
          review_type
        )
      `)
      .in('id', toolIds);

    if (error) {
      console.error('Error fetching tools for comparison:', error);
      return NextResponse.json(
        { error: 'Failed to fetch tools for comparison' },
        { status: 500 }
      );
    }

    // Process tools to calculate metrics
    const processedTools = tools?.map(tool => {
      const reviews = tool.reviews || [];
      const totalReviews = reviews.length;
      const averageRating = totalReviews > 0 
        ? reviews.reduce((sum: number, review: { rating?: number; total_votes?: number }) => sum + (review.rating || 0), 0) / totalReviews
        : 0;
      const totalVotes = reviews.reduce((sum: number, review: { rating?: number; total_votes?: number }) => sum + (review.total_votes || 0), 0);
      
      // Aggregate pros and cons from all reviews
      const allPros = reviews.flatMap((review: { pros?: string[] }) => review.pros || []).filter(Boolean);
      const allCons = reviews.flatMap((review: { cons?: string[] }) => review.cons || []).filter(Boolean);
      
      // Get unique pros and cons (top 5 most common)
      const prosCount = allPros.reduce((acc: Record<string, number>, pro: string) => {
        acc[pro] = (acc[pro] || 0) + 1;
        return acc;
      }, {});
      const consCount = allCons.reduce((acc: Record<string, number>, con: string) => {
        acc[con] = (acc[con] || 0) + 1;
        return acc;
      }, {});

      const topPros = Object.entries(prosCount)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([pro]) => pro);

      const topCons = Object.entries(consCount)
        .sort(([,a], [,b]) => (b as number) - (a as number))
        .slice(0, 5)
        .map(([con]) => con);

      return {
        ...tool,
        average_rating: averageRating,
        total_reviews: totalReviews,
        total_votes: totalVotes,
        pros: topPros,
        cons: topCons,
        reviews: undefined // Remove reviews array from response
      };
    }) || [];

    // Calculate comparison metrics
    const comparisonMetrics: ComparisonMetrics = {
      rating: processedTools.reduce((acc, tool) => {
        acc[tool.id] = tool.average_rating;
        return acc;
      }, {} as Record<string, number>),
      reviews: processedTools.reduce((acc, tool) => {
        acc[tool.id] = tool.total_reviews;
        return acc;
      }, {} as Record<string, number>),
      votes: processedTools.reduce((acc, tool) => {
        acc[tool.id] = tool.total_votes;
        return acc;
      }, {} as Record<string, number>),
      age: processedTools.reduce((acc, tool) => {
        const ageInDays = Math.floor((Date.now() - new Date(tool.created_at).getTime()) / (1000 * 60 * 60 * 24));
        acc[tool.id] = ageInDays;
        return acc;
      }, {} as Record<string, number>)
    };

    const comparisonData = {
      tools: processedTools,
      comparisonMetrics
    };

    return NextResponse.json(comparisonData);

  } catch (error) {
    console.error('Error in tool comparison API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
