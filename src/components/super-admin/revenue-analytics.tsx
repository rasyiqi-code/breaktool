'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard,
  Target,
  BarChart3,
  Activity,
  Calendar
} from 'lucide-react';

interface RevenueAnalytics {
  totalRevenue: {
    current: number;
    previous: number;
    change: number;
    trend: 'up' | 'down' | 'stable';
  };
  revenueBreakdown: {
    subscriptions: number;
    premiumFeatures: number;
    advertising: number;
    partnerships: number;
  };
  revenueMetrics: {
    averageRevenuePerUser: number;
    monthlyRecurringRevenue: number;
    customerLifetimeValue: number;
    churnRate: number;
  };
  revenueByPeriod: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  revenueTrends: Array<{
    period: string;
    revenue: number;
    users: number;
    conversion: number;
  }>;
  topRevenueSources: Array<{
    source: string;
    revenue: number;
    percentage: number;
    growth: number;
  }>;
  revenueTargets: {
    monthlyTarget: number;
    yearlyTarget: number;
    monthlyProgress: number;
    yearlyProgress: number;
  };
}

export function RevenueAnalytics() {
  const [analytics, setAnalytics] = useState<RevenueAnalytics>({
    totalRevenue: { current: 0, previous: 0, change: 0, trend: 'stable' },
    revenueBreakdown: { subscriptions: 0, premiumFeatures: 0, advertising: 0, partnerships: 0 },
    revenueMetrics: { averageRevenuePerUser: 0, monthlyRecurringRevenue: 0, customerLifetimeValue: 0, churnRate: 0 },
    revenueByPeriod: { daily: 0, weekly: 0, monthly: 0, yearly: 0 },
    revenueTrends: [],
    topRevenueSources: [],
    revenueTargets: { monthlyTarget: 0, yearlyTarget: 0, monthlyProgress: 0, yearlyProgress: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRevenueAnalytics();
  }, []);

  const fetchRevenueAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics/revenue');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Revenue Analytics</h2>
            <p className="text-muted-foreground">Track revenue performance and financial insights</p>
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
          <h2 className="text-2xl font-bold">Revenue Analytics</h2>
          <p className="text-muted-foreground">Track revenue performance and financial insights</p>
        </div>
      </div>

      {/* Total Revenue Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Total Revenue Overview</CardTitle>
          <CardDescription>Current revenue performance and growth trends</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="text-4xl font-bold">
                {formatCurrency(analytics.totalRevenue.current)}
              </div>
              <div className="flex items-center space-x-2">
                {getTrendIcon(analytics.totalRevenue.trend)}
                <span className={`text-sm ${getTrendColor(analytics.totalRevenue.trend)}`}>
                  {analytics.totalRevenue.change > 0 ? '+' : ''}{analytics.totalRevenue.change.toFixed(1)}%
                </span>
                <span className="text-sm text-muted-foreground">vs last month</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Previous Month</div>
              <div className="text-lg font-medium">{formatCurrency(analytics.totalRevenue.previous)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue by Period */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.revenueByPeriod.daily)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.revenueByPeriod.daily * 30)} projected monthly
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Revenue</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.revenueByPeriod.weekly)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.revenueByPeriod.weekly * 4.33)} projected monthly
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.revenueByPeriod.monthly)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(analytics.revenueByPeriod.monthly * 12)} projected yearly
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Yearly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(analytics.revenueByPeriod.yearly)}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.revenueByPeriod.yearly / analytics.revenueTargets.yearlyTarget) * 100).toFixed(1)}% of target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Breakdown</CardTitle>
          <CardDescription>Revenue distribution across different sources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Subscriptions</span>
                <span className="text-sm font-medium">{formatCurrency(analytics.revenueBreakdown.subscriptions)}</span>
              </div>
              <Progress value={(analytics.revenueBreakdown.subscriptions / analytics.totalRevenue.current) * 100} className="w-full" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Premium Features</span>
                <span className="text-sm font-medium">{formatCurrency(analytics.revenueBreakdown.premiumFeatures)}</span>
              </div>
              <Progress value={(analytics.revenueBreakdown.premiumFeatures / analytics.totalRevenue.current) * 100} className="w-full" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Advertising</span>
                <span className="text-sm font-medium">{formatCurrency(analytics.revenueBreakdown.advertising)}</span>
              </div>
              <Progress value={(analytics.revenueBreakdown.advertising / analytics.totalRevenue.current) * 100} className="w-full" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Partnerships</span>
                <span className="text-sm font-medium">{formatCurrency(analytics.revenueBreakdown.partnerships)}</span>
              </div>
              <Progress value={(analytics.revenueBreakdown.partnerships / analytics.totalRevenue.current) * 100} className="w-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Revenue Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Key Revenue Metrics</CardTitle>
            <CardDescription>Important financial performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Average Revenue Per User</span>
                </div>
                <span className="font-medium">{formatCurrency(analytics.revenueMetrics.averageRevenuePerUser)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Monthly Recurring Revenue</span>
                </div>
                <span className="font-medium">{formatCurrency(analytics.revenueMetrics.monthlyRecurringRevenue)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Customer Lifetime Value</span>
                </div>
                <span className="font-medium">{formatCurrency(analytics.revenueMetrics.customerLifetimeValue)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Churn Rate</span>
                </div>
                <span className="font-medium">{analytics.revenueMetrics.churnRate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue Targets */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Targets</CardTitle>
            <CardDescription>Progress towards monthly and yearly revenue goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Monthly Target</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.revenueTargets.monthlyProgress.toFixed(0)}% of {formatCurrency(analytics.revenueTargets.monthlyTarget)}
                  </span>
                </div>
                <Progress value={analytics.revenueTargets.monthlyProgress} className="w-full" />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Yearly Target</span>
                  <span className="text-sm text-muted-foreground">
                    {analytics.revenueTargets.yearlyProgress.toFixed(0)}% of {formatCurrency(analytics.revenueTargets.yearlyTarget)}
                  </span>
                </div>
                <Progress value={analytics.revenueTargets.yearlyProgress} className="w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Revenue Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Top Revenue Sources</CardTitle>
          <CardDescription>Highest performing revenue streams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.topRevenueSources.map((source, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <div>
                    <p className="font-medium">{source.source}</p>
                    <p className="text-sm text-muted-foreground">{source.percentage.toFixed(1)}% of total revenue</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-lg font-bold">{formatCurrency(source.revenue)}</div>
                    <div className={`text-sm ${source.growth > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {source.growth > 0 ? '+' : ''}{source.growth.toFixed(1)}% growth
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Revenue Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trends</CardTitle>
          <CardDescription>6-month revenue trend analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.revenueTrends.slice(-6).map((trend, index) => (
              <div key={index} className="grid grid-cols-4 gap-4 p-4 border rounded-lg">
                <div className="text-center">
                  <div className="text-sm font-medium">{trend.period}</div>
                  <div className="text-xs text-muted-foreground">Period</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{formatCurrency(trend.revenue)}</div>
                  <div className="text-xs text-muted-foreground">Revenue</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{trend.users.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Users</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">{trend.conversion.toFixed(1)}%</div>
                  <div className="text-xs text-muted-foreground">Conversion</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
