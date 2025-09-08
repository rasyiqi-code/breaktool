'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  TrendingUp, 
  TrendingDown,
  Clock,
  Activity
} from 'lucide-react';

interface UserAnalytics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  userGrowth: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  userDistribution: {
    byRole: Array<{ role: string; count: number; percentage: number }>;
    byLocation: Array<{ location: string; count: number; percentage: number }>;
    byRegistrationDate: Array<{ date: string; count: number }>;
  };
  userActivity: {
    averageSessionTime: string;
    pagesPerSession: number;
    bounceRate: number;
    retentionRate: number;
  };
}

export function UserAnalytics() {
  const [analytics, setAnalytics] = useState<UserAnalytics>({
    totalUsers: 0,
    newUsers: 0,
    activeUsers: 0,
    verifiedUsers: 0,
    userGrowth: { daily: 0, weekly: 0, monthly: 0 },
    userDistribution: { byRole: [], byLocation: [], byRegistrationDate: [] },
    userActivity: { averageSessionTime: '0m', pagesPerSession: 0, bounceRate: 0, retentionRate: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserAnalytics();
  }, []);

  const fetchUserAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics/users');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching user analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">User Analytics</h2>
            <p className="text-muted-foreground">Comprehensive user behavior and growth insights</p>
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
          <h2 className="text-2xl font-bold">User Analytics</h2>
          <p className="text-muted-foreground">Comprehensive user behavior and growth insights</p>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{analytics.userGrowth.monthly}%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Users</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.newUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{analytics.userGrowth.daily}</span> today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600">+{analytics.userGrowth.weekly}%</span> this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.verifiedUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {((analytics.verifiedUsers / analytics.totalUsers) * 100).toFixed(1)}% of total users
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Distribution by Role */}
        <Card>
          <CardHeader>
            <CardTitle>User Distribution by Role</CardTitle>
            <CardDescription>Breakdown of users by their assigned roles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.userDistribution.byRole.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{item.role}</Badge>
                    <span className="text-sm text-muted-foreground">{item.count} users</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Progress value={item.percentage} className="w-20" />
                    <span className="text-sm font-medium w-12 text-right">{item.percentage.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* User Activity Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>User Activity Metrics</CardTitle>
            <CardDescription>Key performance indicators for user engagement</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Average Session Time</span>
                </div>
                <span className="font-medium">{analytics.userActivity.averageSessionTime}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Pages per Session</span>
                </div>
                <span className="font-medium">{analytics.userActivity.pagesPerSession}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Bounce Rate</span>
                </div>
                <span className="font-medium">{analytics.userActivity.bounceRate.toFixed(1)}%</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Retention Rate</span>
                </div>
                <span className="font-medium">{analytics.userActivity.retentionRate.toFixed(1)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Growth Chart */}
      <Card>
        <CardHeader>
          <CardTitle>User Registration Trends</CardTitle>
          <CardDescription>Daily user registration over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.userDistribution.byRegistrationDate.slice(-7).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.date}</span>
                <div className="flex items-center space-x-2">
                  <Progress value={(item.count / Math.max(...analytics.userDistribution.byRegistrationDate.map(d => d.count))) * 100} className="w-32" />
                  <span className="text-sm font-medium w-12 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
