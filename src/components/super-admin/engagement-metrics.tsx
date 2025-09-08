'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  MessageSquare, 
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3
} from 'lucide-react';

interface EngagementMetrics {
  overallEngagement: {
    score: number;
    trend: 'up' | 'down' | 'stable';
    change: number;
  };
  userEngagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    sessionDuration: number;
    pagesPerSession: number;
    bounceRate: number;
  };
  contentEngagement: {
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    averageRating: number;
  };
  engagementByContent: {
    tools: { views: number; likes: number; comments: number; shares: number };
    reviews: { views: number; likes: number; comments: number; shares: number };
    discussions: { views: number; likes: number; comments: number; shares: number };
  };
  engagementTrends: Array<{
    date: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
  }>;
  topEngagingContent: Array<{
    title: string;
    type: 'tool' | 'review' | 'discussion';
    views: number;
    likes: number;
    comments: number;
    engagementRate: number;
  }>;
}

export function EngagementMetrics() {
  const [metrics, setMetrics] = useState<EngagementMetrics>({
    overallEngagement: { score: 0, trend: 'stable', change: 0 },
    userEngagement: { dailyActiveUsers: 0, weeklyActiveUsers: 0, monthlyActiveUsers: 0, sessionDuration: 0, pagesPerSession: 0, bounceRate: 0 },
    contentEngagement: { totalViews: 0, totalLikes: 0, totalComments: 0, totalShares: 0, averageRating: 0 },
    engagementByContent: { tools: { views: 0, likes: 0, comments: 0, shares: 0 }, reviews: { views: 0, likes: 0, comments: 0, shares: 0 }, discussions: { views: 0, likes: 0, comments: 0, shares: 0 } },
    engagementTrends: [],
    topEngagingContent: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEngagementMetrics();
  }, []);

  const fetchEngagementMetrics = async () => {
    try {
      const response = await fetch('/api/admin/analytics/engagement');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching engagement metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getEngagementScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Engagement Metrics</h2>
            <p className="text-muted-foreground">Track user engagement and content interaction</p>
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
          <h2 className="text-2xl font-bold">Engagement Metrics</h2>
          <p className="text-muted-foreground">Track user engagement and content interaction</p>
        </div>
      </div>

      {/* Overall Engagement Score */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Engagement Score</CardTitle>
          <CardDescription>Comprehensive engagement measurement across all metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold">
                <span className={getEngagementScoreColor(metrics.overallEngagement.score)}>
                  {metrics.overallEngagement.score}
                </span>
                <span className="text-2xl text-muted-foreground">/100</span>
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(metrics.overallEngagement.trend)}
                <span className={`text-sm ${getTrendColor(metrics.overallEngagement.trend)}`}>
                  {metrics.overallEngagement.change > 0 ? '+' : ''}{metrics.overallEngagement.change}%
                </span>
                <span className="text-sm text-muted-foreground">vs last month</span>
              </div>
            </div>
            <Progress value={metrics.overallEngagement.score} className="w-32" />
          </div>
        </CardContent>
      </Card>

      {/* Key Engagement Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.userEngagement.dailyActiveUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((metrics.userEngagement.dailyActiveUsers / metrics.userEngagement.monthlyActiveUsers) * 100).toFixed(1)}% of monthly users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.userEngagement.sessionDuration}m</div>
            <p className="text-xs text-muted-foreground">
              {metrics.userEngagement.pagesPerSession} pages per session
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bounce Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.userEngagement.bounceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.userEngagement.bounceRate < 50 ? 'Good' : metrics.userEngagement.bounceRate < 70 ? 'Average' : 'Needs improvement'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Content Interactions</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.contentEngagement.totalLikes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.contentEngagement.totalComments.toLocaleString()} comments, {metrics.contentEngagement.totalShares.toLocaleString()} shares
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Content Engagement Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Content Engagement Breakdown</CardTitle>
          <CardDescription>Engagement metrics by content type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Tools</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Views</span>
                  <span className="font-medium">{metrics.engagementByContent.tools.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Likes</span>
                  <span className="font-medium">{metrics.engagementByContent.tools.likes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Comments</span>
                  <span className="font-medium">{metrics.engagementByContent.tools.comments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shares</span>
                  <span className="font-medium">{metrics.engagementByContent.tools.shares.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-green-500" />
                <span className="font-medium">Reviews</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Views</span>
                  <span className="font-medium">{metrics.engagementByContent.reviews.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Likes</span>
                  <span className="font-medium">{metrics.engagementByContent.reviews.likes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Comments</span>
                  <span className="font-medium">{metrics.engagementByContent.reviews.comments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shares</span>
                  <span className="font-medium">{metrics.engagementByContent.reviews.shares.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span className="font-medium">Discussions</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Views</span>
                  <span className="font-medium">{metrics.engagementByContent.discussions.views.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Likes</span>
                  <span className="font-medium">{metrics.engagementByContent.discussions.likes.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Comments</span>
                  <span className="font-medium">{metrics.engagementByContent.discussions.comments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shares</span>
                  <span className="font-medium">{metrics.engagementByContent.discussions.shares.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Engaging Content */}
      <Card>
        <CardHeader>
          <CardTitle>Top Engaging Content</CardTitle>
          <CardDescription>Most engaging content based on interaction rates</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topEngagingContent.map((content, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{content.title}</p>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Badge variant="secondary" className="text-xs">
                        {content.type}
                      </Badge>
                      <span>{content.views.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-sm font-medium">{content.likes}</div>
                    <div className="text-xs text-muted-foreground">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{content.comments}</div>
                    <div className="text-xs text-muted-foreground">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-medium">{content.engagementRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Engagement</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Trends</CardTitle>
          <CardDescription>7-day engagement trend analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.engagementTrends.slice(-7).map((trend, index) => (
              <div key={index} className="grid grid-cols-5 gap-4 p-3 border rounded-lg">
                <div className="text-sm font-medium">{trend.date}</div>
                <div className="text-center">
                  <div className="text-sm font-bold text-blue-600">{trend.views.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Views</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-green-600">{trend.likes.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Likes</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-purple-600">{trend.comments.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Comments</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-bold text-orange-600">{trend.shares.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Shares</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
