'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReviewAnalytics } from '@/lib/services/reviews/analytics.service';
import Image from 'next/image';

interface ReviewAnalyticsDisplayProps {
  reviewId: string;
  showDetails?: boolean;
}

export default function ReviewAnalyticsDisplay({ reviewId, showDetails = false }: ReviewAnalyticsDisplayProps) {
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/community/review-analytics/${reviewId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  }, [reviewId]);

  const updateAnalytics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/community/review-analytics/${reviewId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to update analytics');
      }
      
      // Refetch analytics after update
      await fetchAnalytics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [reviewId, fetchAnalytics]);


  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getTrendIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (score >= 60) return <Minus className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  if (loading && !analytics) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p className="mb-2">Error loading analytics</p>
            <Button onClick={fetchAnalytics} variant="outline" size="sm">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Review Analytics</CardTitle>
          <Button
            onClick={updateAnalytics}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Update
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Analytics Scores */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Helpfulness</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(analytics.helpfulnessScore)}
                <Badge className={getScoreBadge(analytics.helpfulnessScore)}>
                  {Math.round(analytics.helpfulnessScore)}%
                </Badge>
              </div>
            </div>
            <Progress value={analytics.helpfulnessScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Quality</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(analytics.qualityScore)}
                <Badge className={getScoreBadge(analytics.qualityScore)}>
                  {Math.round(analytics.qualityScore)}%
                </Badge>
              </div>
            </div>
            <Progress value={analytics.qualityScore} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Engagement</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(analytics.engagementRate)}
                <Badge className={getScoreBadge(analytics.engagementRate)}>
                  {Math.round(analytics.engagementRate)}%
                </Badge>
              </div>
            </div>
            <Progress value={analytics.engagementRate} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Sentiment</span>
              <div className="flex items-center gap-1">
                {getTrendIcon(analytics.sentimentScore)}
                <Badge className={getScoreBadge(analytics.sentimentScore)}>
                  {Math.round(analytics.sentimentScore)}%
                </Badge>
              </div>
            </div>
            <Progress value={analytics.sentimentScore} className="h-2" />
          </div>
        </div>

        {/* Detailed Metrics */}
        {showDetails && (
          <div className="space-y-4 pt-4 border-t">
            <div>
              <h4 className="font-medium mb-2">Overall Metrics</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Reviews:</span>
                  <span className="ml-2 font-medium">{analytics.metrics.totalReviews}</span>
                </div>
                <div>
                  <span className="text-gray-600">Avg Helpfulness:</span>
                  <span className="ml-2 font-medium">{Math.round(analytics.metrics.averageHelpfulness)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Avg Quality:</span>
                  <span className="ml-2 font-medium">{Math.round(analytics.metrics.averageQuality)}%</span>
                </div>
                <div>
                  <span className="text-gray-600">Avg Engagement:</span>
                  <span className="ml-2 font-medium">{Math.round(analytics.metrics.averageEngagement)}%</span>
                </div>
              </div>
            </div>

            {/* Top Reviewers */}
            {analytics.metrics.topReviewers.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Top Reviewers</h4>
                <div className="space-y-2">
                  {analytics.metrics.topReviewers.slice(0, 3).map((reviewer) => (
                    <div key={reviewer.userId} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                          {reviewer.avatarUrl ? (
                            <Image src={reviewer.avatarUrl} alt="" width={24} height={24} className="w-6 h-6 rounded-full" />
                          ) : (
                            <span className="text-xs">{reviewer.userName.charAt(0)}</span>
                          )}
                        </div>
                        <span>{reviewer.userName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{reviewer.reviewCount} reviews</Badge>
                        <span className="text-gray-600">{Math.round(reviewer.averageHelpfulness)}% helpful</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Trends */}
            {analytics.metrics.reviewTrends.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recent Trends</h4>
                <div className="space-y-2">
                  {analytics.metrics.reviewTrends.map((trend) => (
                    <div key={trend.period} className="flex items-center justify-between text-sm">
                      <span>{trend.period}</span>
                      <div className="flex items-center gap-4">
                        <span>{trend.reviewCount} reviews</span>
                        <span className="text-gray-600">{Math.round(trend.averageHelpfulness)}% helpful</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
