'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequireRole } from '@/components/auth/require-role';
import { 
  TrendingUp, 
  TrendingDown,
  Users, 
  Wrench, 
  MessageSquare, 
  Award,
  Clock,
  TestTube,
  Eye,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity
} from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalTools: number;
  totalReviews: number;
  verifiedTesters: number;
  pendingVerifications: number;
  pendingToolSubmissions: number;
  activeTools: number;
  totalTestingTasks: number;
  completedTestingTasks: number;
}

interface UserGrowthData {
  month: string;
  users: number;
  growth: number;
}

interface ToolCategoryData {
  category: string;
  count: number;
  percentage: number;
}

interface ReviewTrendData {
  period: string;
  reviews: number;
  averageRating: number;
}

interface AnalyticsResponse {
  userGrowthData: UserGrowthData[];
  toolCategoryData: ToolCategoryData[];
  reviewTrendData: ReviewTrendData[];
  monthlyReviews: ReviewTrendData[];
  testingStats: {
    total: number;
    completed: number;
    pending: number;
    inProgress: number;
  };
  verificationStats: {
    total: number;
    verified: number;
    verificationRate: number;
  };
  toolApprovalStats: {
    total: number;
    active: number;
    pending: number;
    approvalRate: number;
  };
}

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalTools: 0,
    totalReviews: 0,
    verifiedTesters: 0,
    pendingVerifications: 0,
    pendingToolSubmissions: 0,
    activeTools: 0,
    totalTestingTasks: 0,
    completedTestingTasks: 0
  });
  const [analyticsResponse, setAnalyticsResponse] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch basic stats
      const statsResponse = await fetch('/api/admin/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setAnalyticsData(statsData);
      }

      // Fetch detailed analytics data
      const analyticsResponse = await fetch('/api/admin/analytics');
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalyticsResponse(analyticsData);
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? (
      <TrendingUp className="w-4 h-4 text-green-600" />
    ) : (
      <TrendingDown className="w-4 h-4 text-red-600" />
    );
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <RequireRole requiredRoles={['admin', 'super_admin']}>
        <div className="w-full max-w-full px-2 sm:px-4 lg:px-6 pt-16 overflow-x-hidden">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading analytics...</p>
            </div>
          </div>
        </div>
      </RequireRole>
    );
  }

  return (
    <RequireRole requiredRoles={['admin', 'super_admin']}>
      <div className="w-full max-w-full px-2 sm:px-4 lg:px-6 pt-16 overflow-x-hidden">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
              <h1 className="text-2xl sm:text-3xl font-bold">Analytics Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm" onClick={fetchAnalyticsData}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Comprehensive platform analytics and performance insights
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-2xl font-bold">{analyticsData.totalUsers.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-1">
                {getGrowthIcon(12.5)}
                <span className={`text-xs ${getGrowthColor(12.5)}`}>+12.5%</span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-sm font-medium">Active Tools</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-2xl font-bold">{analyticsData.activeTools.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-1">
                {getGrowthIcon(8.2)}
                <span className={`text-xs ${getGrowthColor(8.2)}`}>+8.2%</span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-2xl font-bold">{analyticsData.totalReviews.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-1">
                {getGrowthIcon(15.2)}
                <span className={`text-xs ${getGrowthColor(15.2)}`}>+15.2%</span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-6">
              <CardTitle className="text-sm font-medium">Verified Testers</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0">
              <div className="text-2xl font-bold">{analyticsData.verifiedTesters.toLocaleString()}</div>
              <div className="flex items-center gap-1 mt-1">
                {getGrowthIcon(9.8)}
                <span className={`text-xs ${getGrowthColor(9.8)}`}>+9.8%</span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="users" className="text-xs sm:text-sm">Users</TabsTrigger>
              <TabsTrigger value="tools" className="text-xs sm:text-sm">Tools</TabsTrigger>
              <TabsTrigger value="reviews" className="text-xs sm:text-sm">Reviews</TabsTrigger>
              <TabsTrigger value="testing" className="text-xs sm:text-sm">Testing</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
              {/* User Growth Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    User Growth Trend
                  </CardTitle>
                  <CardDescription>Monthly user registration growth</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="overflow-x-auto">
                      <div className="flex items-end gap-2 h-32 min-w-[300px]">
                        {analyticsResponse?.userGrowthData.slice(-6).map((data, index) => {
                          const maxUsers = Math.max(...(analyticsResponse?.userGrowthData || []).map(d => d.users));
                          return (
                            <div key={index} className="flex-1 flex flex-col items-center">
                              <div 
                                className="w-full bg-blue-500 rounded-t"
                                style={{ height: `${(data.users / maxUsers) * 100}%` }}
                              ></div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      {analyticsResponse?.userGrowthData.slice(-6).map((data, index) => (
                        <span key={index}>{data.month}</span>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-semibold">Total Growth</div>
                        <div className="text-green-600">
                          {analyticsResponse?.userGrowthData && analyticsResponse.userGrowthData.length > 0 ? 
                            `+${((analyticsResponse.userGrowthData[analyticsResponse.userGrowthData.length - 1].users - analyticsResponse.userGrowthData[0].users) / analyticsResponse.userGrowthData[0].users * 100).toFixed(1)}%` : 
                            '0%'
                          }
                        </div>
                      </div>
                      <div>
                        <div className="font-semibold">Avg Monthly Growth</div>
                        <div className="text-blue-600">
                          {analyticsResponse?.userGrowthData && analyticsResponse.userGrowthData.length > 0 ? 
                            `+${(analyticsResponse.userGrowthData.slice(-6).reduce((acc, curr) => acc + curr.growth, 0) / 6).toFixed(1)}%` : 
                            '0%'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tool Categories */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Tool Categories
                  </CardTitle>
                  <CardDescription>Distribution of tools by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsResponse?.toolCategoryData.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ 
                              backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
                            }}
                          ></div>
                          <span className="text-sm font-medium">{category.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{category.count}</span>
                          <span className="text-xs text-muted-foreground">({category.percentage}%)</span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t">
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total Tools</span>
                        <span>{analyticsResponse?.toolCategoryData.reduce((acc, curr) => acc + curr.count, 0) || 0}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Statistics</CardTitle>
                  <CardDescription>Detailed user metrics and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{analyticsData.totalUsers}</div>
                        <div className="text-sm text-blue-600">Total Users</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{analyticsData.verifiedTesters}</div>
                        <div className="text-sm text-green-600">Verified Testers</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Verification Rate</span>
                        <span>{analyticsResponse?.verificationStats.verificationRate.toFixed(1) || '0.0'}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${analyticsResponse?.verificationStats.verificationRate || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pending Verifications</CardTitle>
                  <CardDescription>Users awaiting verification approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                    <div className="text-3xl font-bold text-orange-600">{analyticsData.pendingVerifications}</div>
                    <div className="text-sm text-muted-foreground mt-2">Pending Applications</div>
                    <Button className="mt-4" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      Review Applications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tools">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Tool Statistics</CardTitle>
                  <CardDescription>Tool submission and approval metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{analyticsData.activeTools}</div>
                        <div className="text-sm text-green-600">Active Tools</div>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                        <div className="text-2xl font-bold text-yellow-600">{analyticsData.pendingToolSubmissions}</div>
                        <div className="text-sm text-yellow-600">Pending Approval</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Approval Rate</span>
                        <span>{analyticsResponse?.toolApprovalStats.approvalRate.toFixed(1) || '0.0'}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${analyticsResponse?.toolApprovalStats.approvalRate || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Tool Categories</CardTitle>
                  <CardDescription>Distribution of tools by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analyticsResponse?.toolCategoryData.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ 
                              backgroundColor: `hsl(${index * 60}, 70%, 50%)` 
                            }}
                          ></div>
                          <span className="text-sm">{category.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{category.count}</span>
                          <Badge variant="outline" className="text-xs">{category.percentage}%</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Review Statistics</CardTitle>
                  <CardDescription>Review trends and quality metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-6 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600">{analyticsData.totalReviews}</div>
                      <div className="text-sm text-purple-600">Total Reviews</div>
                    </div>
                    <div className="space-y-3">
                      {analyticsResponse?.reviewTrendData.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <div className="font-medium">{trend.period}</div>
                            <div className="text-sm text-muted-foreground">{trend.reviews} reviews</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{trend.averageRating}/5</div>
                            <div className="text-sm text-muted-foreground">avg rating</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Review Quality</CardTitle>
                  <CardDescription>Average ratings and quality trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-600">4.8</div>
                      <div className="text-sm text-muted-foreground">Average Rating</div>
                    </div>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map((rating) => (
                        <div key={rating} className="flex items-center gap-2">
                          <span className="text-sm w-4">{rating}</span>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-yellow-500 h-2 rounded-full"
                              style={{ width: `${rating === 5 ? 65 : rating === 4 ? 25 : rating === 3 ? 7 : rating === 2 ? 2 : 1}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground w-8">
                            {rating === 5 ? '65%' : rating === 4 ? '25%' : rating === 3 ? '7%' : rating === 2 ? '2%' : '1%'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="testing">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Testing Statistics</CardTitle>
                  <CardDescription>Testing task completion and progress</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{analyticsData.totalTestingTasks}</div>
                        <div className="text-sm text-blue-600">Total Tasks</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{analyticsData.completedTestingTasks}</div>
                        <div className="text-sm text-green-600">Completed</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion Rate</span>
                        <span>{analyticsResponse?.testingStats?.total && analyticsResponse?.testingStats?.total > 0 ? ((analyticsResponse.testingStats.completed / analyticsResponse.testingStats.total) * 100).toFixed(1) : '0.0'}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${analyticsResponse?.testingStats?.total && analyticsResponse?.testingStats?.total > 0 ? (analyticsResponse.testingStats.completed / analyticsResponse.testingStats.total) * 100 : 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Testing Progress</CardTitle>
                  <CardDescription>Current testing activities and status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center py-6">
                      <TestTube className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <div className="text-2xl font-bold">{(analyticsResponse?.testingStats?.pending || 0) + (analyticsResponse?.testingStats?.inProgress || 0)}</div>
                      <div className="text-sm text-muted-foreground">Active Testing Tasks</div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Pending Tasks</span>
                        <Badge variant="secondary">{analyticsResponse?.testingStats?.pending || 0}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>In Progress</span>
                        <Badge variant="outline">{analyticsResponse?.testingStats?.inProgress || 0}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Completed Tasks</span>
                        <Badge variant="default">{analyticsResponse?.testingStats?.completed || 0}</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RequireRole>
  );
}
