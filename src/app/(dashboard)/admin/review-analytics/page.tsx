'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Image from 'next/image';
import { RefreshCw, TrendingUp, TrendingDown, Minus, BarChart3, Users, Star, Activity } from 'lucide-react';
import { ReviewMetrics } from '@/lib/services/reviews/analytics.service';

export default function ReviewAnalyticsPage() {
  const [metrics, setMetrics] = useState<ReviewMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/community/review-analytics/metrics');
      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }
      
      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);



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

  if (loading && !metrics) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p className="mb-4">Error loading review analytics</p>
          <Button onClick={fetchMetrics} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Review Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Comprehensive insights into review performance and quality</p>
        </div>
        <Button onClick={fetchMetrics} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalReviews}</div>
            <p className="text-xs text-muted-foreground">
              All time reviews
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Helpfulness</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.averageHelpfulness)}%</div>
            <div className="flex items-center gap-1 mt-1">
              {getTrendIcon(metrics.averageHelpfulness)}
              <p className="text-xs text-muted-foreground">
                Community rated
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.averageQuality)}%</div>
            <div className="flex items-center gap-1 mt-1">
              {getTrendIcon(metrics.averageQuality)}
              <p className="text-xs text-muted-foreground">
                Content quality
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(metrics.averageEngagement)}%</div>
            <div className="flex items-center gap-1 mt-1">
              {getTrendIcon(metrics.averageEngagement)}
              <p className="text-xs text-muted-foreground">
                User interaction
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="reviewers">Top Reviewers</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quality Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Helpfulness Score</span>
                    <Badge className={getScoreBadge(metrics.averageHelpfulness)}>
                      {Math.round(metrics.averageHelpfulness)}%
                    </Badge>
                  </div>
                  <Progress value={metrics.averageHelpfulness} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quality Score</span>
                    <Badge className={getScoreBadge(metrics.averageQuality)}>
                      {Math.round(metrics.averageQuality)}%
                    </Badge>
                  </div>
                  <Progress value={metrics.averageQuality} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Engagement Rate</span>
                    <Badge className={getScoreBadge(metrics.averageEngagement)}>
                      {Math.round(metrics.averageEngagement)}%
                    </Badge>
                  </div>
                  <Progress value={metrics.averageEngagement} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Review Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Review Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Reviews</span>
                    <span className="font-medium">{metrics.totalReviews}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Reviewers</span>
                    <span className="font-medium">{metrics.topReviewers.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Avg Reviews per User</span>
                    <span className="font-medium">
                      {metrics.topReviewers.length > 0 
                        ? Math.round(metrics.totalReviews / metrics.topReviewers.length)
                        : 0
                      }
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reviewers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Reviewers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.topReviewers.map((reviewer, index) => (
                  <div key={reviewer.userId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {reviewer.avatarUrl ? (
                            <Image src={reviewer.avatarUrl} alt="" width={40} height={40} className="w-10 h-10 rounded-full" />
                          ) : (
                            <span className="text-sm">{reviewer.userName.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{reviewer.userName}</p>
                          <p className="text-sm text-gray-600">Trust Score: {reviewer.trustScore}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <p className="font-medium">{reviewer.reviewCount}</p>
                        <p className="text-xs text-gray-600">Reviews</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{Math.round(reviewer.averageHelpfulness)}%</p>
                        <p className="text-xs text-gray-600">Helpful</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{Math.round(reviewer.averageQuality)}%</p>
                        <p className="text-xs text-gray-600">Quality</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Review Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.reviewTrends.map((trend) => (
                  <div key={trend.period} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{trend.period}</h4>
                      <p className="text-sm text-gray-600">Review activity</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="font-medium">{trend.reviewCount}</p>
                        <p className="text-xs text-gray-600">Reviews</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{Math.round(trend.averageHelpfulness)}%</p>
                        <p className="text-xs text-gray-600">Helpful</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{Math.round(trend.averageQuality)}%</p>
                        <p className="text-xs text-gray-600">Quality</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{Math.round(trend.averageEngagement)}%</p>
                        <p className="text-xs text-gray-600">Engagement</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
