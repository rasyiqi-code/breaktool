'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Star, 
  MessageSquare, 
  Target,
  BarChart3,
  Activity
} from 'lucide-react';

interface GrowthMetrics {
  userGrowth: {
    current: number;
    previous: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  toolGrowth: {
    current: number;
    previous: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  reviewGrowth: {
    current: number;
    previous: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  engagementGrowth: {
    current: number;
    previous: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
  monthlyTrends: Array<{
    month: string;
    users: number;
    tools: number;
    reviews: number;
    engagement: number;
  }>;
  growthTargets: {
    userTarget: number;
    toolTarget: number;
    reviewTarget: number;
    userProgress: number;
    toolProgress: number;
    reviewProgress: number;
  };
}

export function GrowthMetrics() {
  const [metrics, setMetrics] = useState<GrowthMetrics>({
    userGrowth: { current: 0, previous: 0, percentage: 0, trend: 'stable' },
    toolGrowth: { current: 0, previous: 0, percentage: 0, trend: 'stable' },
    reviewGrowth: { current: 0, previous: 0, percentage: 0, trend: 'stable' },
    engagementGrowth: { current: 0, previous: 0, percentage: 0, trend: 'stable' },
    monthlyTrends: [],
    growthTargets: { userTarget: 0, toolTarget: 0, reviewTarget: 0, userProgress: 0, toolProgress: 0, reviewProgress: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGrowthMetrics();
  }, []);

  const fetchGrowthMetrics = async () => {
    try {
      const response = await fetch('/api/admin/analytics/growth');
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Error fetching growth metrics:', error);
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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Growth Metrics</h2>
            <p className="text-muted-foreground">Track platform growth and performance trends</p>
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
          <h2 className="text-2xl font-bold">Growth Metrics</h2>
          <p className="text-muted-foreground">Track platform growth and performance trends</p>
        </div>
      </div>

      {/* Growth Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Growth</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.userGrowth.current.toLocaleString()}</div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(metrics.userGrowth.trend)}
              <span className={`text-xs ${getTrendColor(metrics.userGrowth.trend)}`}>
                {metrics.userGrowth.percentage > 0 ? '+' : ''}{metrics.userGrowth.percentage.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tool Growth</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.toolGrowth.current.toLocaleString()}</div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(metrics.toolGrowth.trend)}
              <span className={`text-xs ${getTrendColor(metrics.toolGrowth.trend)}`}>
                {metrics.toolGrowth.percentage > 0 ? '+' : ''}{metrics.toolGrowth.percentage.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Review Growth</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.reviewGrowth.current.toLocaleString()}</div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(metrics.reviewGrowth.trend)}
              <span className={`text-xs ${getTrendColor(metrics.reviewGrowth.trend)}`}>
                {metrics.reviewGrowth.percentage > 0 ? '+' : ''}{metrics.reviewGrowth.percentage.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Engagement Growth</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.engagementGrowth.current.toLocaleString()}</div>
            <div className="flex items-center space-x-1">
              {getTrendIcon(metrics.engagementGrowth.trend)}
              <span className={`text-xs ${getTrendColor(metrics.engagementGrowth.trend)}`}>
                {metrics.engagementGrowth.percentage > 0 ? '+' : ''}{metrics.engagementGrowth.percentage.toFixed(1)}%
              </span>
              <span className="text-xs text-muted-foreground">vs last month</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Targets */}
      <Card>
        <CardHeader>
          <CardTitle>Growth Targets Progress</CardTitle>
          <CardDescription>Track progress towards monthly growth targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User Growth Target</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.growthTargets.userProgress.toFixed(0)}% of {metrics.growthTargets.userTarget.toLocaleString()}
                </span>
              </div>
              <Progress value={metrics.growthTargets.userProgress} className="w-full" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tool Growth Target</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.growthTargets.toolProgress.toFixed(0)}% of {metrics.growthTargets.toolTarget.toLocaleString()}
                </span>
              </div>
              <Progress value={metrics.growthTargets.toolProgress} className="w-full" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Review Growth Target</span>
                <span className="text-sm text-muted-foreground">
                  {metrics.growthTargets.reviewProgress.toFixed(0)}% of {metrics.growthTargets.reviewTarget.toLocaleString()}
                </span>
              </div>
              <Progress value={metrics.growthTargets.reviewProgress} className="w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Growth Trends</CardTitle>
          <CardDescription>6-month growth comparison across key metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.monthlyTrends.slice(-6).map((trend, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-medium">{trend.month}</div>
                  <div className="text-xs text-muted-foreground">Month</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{trend.users}</div>
                  <div className="text-xs text-muted-foreground">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{trend.tools}</div>
                  <div className="text-xs text-muted-foreground">Tools</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{trend.reviews}</div>
                  <div className="text-xs text-muted-foreground">Reviews</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Growth Insights */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Growth Insights</CardTitle>
            <CardDescription>Key insights from growth data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Target className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">User Acquisition</p>
                  <p className="text-xs text-muted-foreground">
                    {metrics.userGrowth.trend === 'up' ? 'Growing' : metrics.userGrowth.trend === 'down' ? 'Declining' : 'Stable'} user base with {metrics.userGrowth.percentage > 0 ? '+' : ''}{metrics.userGrowth.percentage.toFixed(1)}% monthly growth
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <BarChart3 className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Content Growth</p>
                  <p className="text-xs text-muted-foreground">
                    {metrics.toolGrowth.trend === 'up' ? 'Increasing' : metrics.toolGrowth.trend === 'down' ? 'Decreasing' : 'Stable'} tool submissions with {metrics.toolGrowth.percentage > 0 ? '+' : ''}{metrics.toolGrowth.percentage.toFixed(1)}% monthly growth
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MessageSquare className="h-5 w-5 text-purple-500 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Engagement Quality</p>
                  <p className="text-xs text-muted-foreground">
                    {metrics.reviewGrowth.trend === 'up' ? 'Rising' : metrics.reviewGrowth.trend === 'down' ? 'Falling' : 'Stable'} review activity with {metrics.reviewGrowth.percentage > 0 ? '+' : ''}{metrics.reviewGrowth.percentage.toFixed(1)}% monthly growth
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Recommendations</CardTitle>
            <CardDescription>Actionable insights for continued growth</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.userGrowth.percentage < 10 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">User Growth Opportunity</p>
                  <p className="text-xs text-yellow-700">Consider implementing user acquisition campaigns to boost growth</p>
                </div>
              )}
              
              {metrics.toolGrowth.percentage < 5 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Content Strategy</p>
                  <p className="text-xs text-blue-700">Focus on tool discovery and submission incentives</p>
                </div>
              )}
              
              {metrics.reviewGrowth.percentage < 15 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Engagement Boost</p>
                  <p className="text-xs text-green-700">Implement review incentives and user engagement programs</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
