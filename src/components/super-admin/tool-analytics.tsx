'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  MessageSquare, 
  ThumbsUp,
  BarChart3,
  Award,
  Target
} from 'lucide-react';

interface ToolAnalytics {
  totalTools: number;
  newTools: number;
  featuredTools: number;
  averageRating: number;
  toolGrowth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  toolPerformance: {
    topRated: Array<{ name: string; rating: number; reviews: number }>;
    mostReviewed: Array<{ name: string; reviews: number; rating: number }>;
    mostViewed: Array<{ name: string; views: number; rating: number }>;
  };
  categoryDistribution: Array<{ category: string; count: number; percentage: number }>;
  reviewMetrics: {
    totalReviews: number;
    averageReviewLength: number;
    positiveReviews: number;
    negativeReviews: number;
  };
}

export function ToolAnalytics() {
  const [analytics, setAnalytics] = useState<ToolAnalytics>({
    totalTools: 0,
    newTools: 0,
    featuredTools: 0,
    averageRating: 0,
    toolGrowth: { daily: 0, weekly: 0, monthly: 0 },
    toolPerformance: { topRated: [], mostReviewed: [], mostViewed: [] },
    categoryDistribution: [],
    reviewMetrics: { totalReviews: 0, averageReviewLength: 0, positiveReviews: 0, negativeReviews: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchToolAnalytics();
  }, []);

  const fetchToolAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics/tools');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching tool analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Tool Analytics</h2>
            <p className="text-muted-foreground">Comprehensive tool performance and review insights</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Tool Analytics</h2>
          <p className="text-muted-foreground">Comprehensive tool performance and review insights</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalTools.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{analytics.toolGrowth.monthly}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Tools</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.newTools.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{analytics.toolGrowth.daily}</span> today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Featured Tools</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.featuredTools.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.featuredTools / analytics.totalTools) * 100).toFixed(1)}% of total tools
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{analytics.toolGrowth.weekly}%</span> this week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Rated Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Top Rated Tools</CardTitle>
            <CardDescription>Tools with the highest average ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.toolPerformance.topRated.map((tool, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <span className="text-sm font-medium">{tool.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{tool.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">({tool.reviews} reviews)</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Most Reviewed Tools */}
        <Card>
          <CardHeader>
            <CardTitle>Most Reviewed Tools</CardTitle>
            <CardDescription>Tools with the highest number of reviews</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.toolPerformance.mostReviewed.map((tool, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <span className="text-sm font-medium">{tool.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm font-medium">{tool.reviews}</span>
                    <span className="text-xs text-muted-foreground">reviews</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Tool Distribution by Category</CardTitle>
          <CardDescription>Breakdown of tools across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.categoryDistribution.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">{category.category}</Badge>
                  <span className="text-sm text-muted-foreground">{category.count} tools</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Progress value={category.percentage} className="w-20" />
                  <span className="text-sm font-medium w-12 text-right">{category.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Review Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.reviewMetrics.totalReviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Average {analytics.reviewMetrics.averageReviewLength} words per review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Reviews</CardTitle>
            <ThumbsUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.reviewMetrics.positiveReviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.reviewMetrics.positiveReviews / analytics.reviewMetrics.totalReviews) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Negative Reviews</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.reviewMetrics.negativeReviews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.reviewMetrics.negativeReviews / analytics.reviewMetrics.totalReviews) * 100).toFixed(1)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Review Quality</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((analytics.reviewMetrics.positiveReviews / analytics.reviewMetrics.totalReviews) * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Positive review ratio
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
