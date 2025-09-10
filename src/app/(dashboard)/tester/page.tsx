'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RequireRole } from '@/components/auth/require-role';
import { 
  Star, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Award,
  TestTube,
  FileText,
  Users,
  BarChart3,
  Zap,
  Target,
  Calendar,
  Activity
} from 'lucide-react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { TestingTaskCard } from '@/components/testing/testing-task-card';
import { TestingReportCard } from '@/components/testing/testing-report-card';
import { NotificationBell } from '@/components/ui/notification-bell';

interface TesterStats {
  totalTests: number;
  totalReviews: number;
  averageRating: number;
  trustScore: number;
  pendingTests: number;
  completedTests: number;
  toolsTested: number;
  badgesEarned: number;
}

interface TestTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  reward: number;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  tool: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    category?: {
      name: string;
    };
  };
}

interface TestReport {
  id: string;
  title: string;
  summary: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  overallScore?: number;
  valueScore?: number;
  usageScore?: number;
  integrationScore?: number;
  verdict?: string;
  createdAt: string;
  approvedAt?: string;
  task: {
    id: string;
    title: string;
    status: string;
    deadline: string;
  };
  tool: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    category?: {
      name: string;
    };
  };
  approver?: {
    id: string;
    name: string;
    email: string;
  };
}

export default function TesterDashboard() {
  const user = useUser();
  const router = useRouter();
  
  const [stats, setStats] = useState<TesterStats>({
    totalTests: 0,
    totalReviews: 0,
    averageRating: 0,
    trustScore: 0,
    pendingTests: 0,
    completedTests: 0,
    toolsTested: 0,
    badgesEarned: 0
  });
  const [testTasks, setTestTasks] = useState<TestTask[]>([]);
  const [testReports, setTestReports] = useState<TestReport[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTesterStats = useCallback(async () => {
    try {
      if (!user) return;
      
      // Fetch tester-specific stats using API routes
      const [
        totalTestsRes,
        totalReviewsRes,
        pendingTestsRes,
        completedTestsRes,
        toolsTestedRes,
        userDataRes
      ] = await Promise.all([
        fetch('/api/testing/tester-stats/stats/total-tests'),
      fetch('/api/testing/tester-stats/stats/total-reviews'),
      fetch('/api/testing/tester-stats/stats/pending-tests'),
      fetch('/api/testing/tester-stats/stats/completed-tests'),
      fetch('/api/testing/tester-stats/stats/tools-tested'),
      fetch(`/api/testing/tester-stats/stats/user-data?userId=${user.id}`)
      ]);

      const [
        { count: totalTests },
        { count: totalReviews },
        { count: pendingTests },
        { count: completedTests },
        { count: toolsTested },
        { trustScore }
      ] = await Promise.all([
        totalTestsRes.json(),
        totalReviewsRes.json(),
        pendingTestsRes.json(),
        completedTestsRes.json(),
        toolsTestedRes.json(),
        userDataRes.json()
      ]);

      setStats({
        totalTests: totalTests || 0,
        totalReviews: totalReviews || 0,
        averageRating: 0, // Will be calculated from actual data
        trustScore: trustScore || 0,
        pendingTests: pendingTests || 0,
        completedTests: completedTests || 0,
        toolsTested: toolsTested || 0,
        badgesEarned: 0 // Will be calculated from actual data
      });
    } catch (error) {
      console.error('Error fetching tester stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchTestTasks = useCallback(async () => {
    try {
      if (!user) return;

      const response = await fetch(`/api/testing/tester-stats/tasks?testerId=${user.id}`);
      const data = await response.json();
      
      if (data.tasks) {
        setTestTasks(data.tasks);
      } else {
        setTestTasks([]);
      }
    } catch (error) {
      console.error('Error fetching test tasks:', error);
    }
  }, [user]);

  const fetchTestReports = useCallback(async () => {
    try {
      if (!user) return;

      const response = await fetch(`/api/testing/reports-management?testerId=${user.id}`);
      const data = await response.json();
      
      if (data.reports) {
        setTestReports(data.reports);
      } else {
        setTestReports([]);
      }
    } catch (error) {
      console.error('Error fetching test reports:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchTesterStats();
      fetchTestTasks();
      fetchTestReports();
    }
  }, [user, fetchTesterStats, fetchTestTasks, fetchTestReports]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (

    <RequireRole requiredRoles={['verified_tester', 'admin', 'super_admin']} redirectTo="/dashboard">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-8 w-8 text-primary" />
                <h1 className="text-3xl font-bold">Tester Dashboard</h1>
                <Badge variant="secondary" className="text-sm">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified Tester
                </Badge>
              </div>
              <NotificationBell />
            </div>
            <p className="text-muted-foreground">
              Manage your testing tasks, reviews, and track your progress as a verified tester.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
                <TestTube className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTests}</div>
                <p className="text-xs text-muted-foreground">
                  +3 this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.trustScore}</div>
                <p className="text-xs text-muted-foreground">
                  +5 this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Tests</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingTests}</div>
                <p className="text-xs text-muted-foreground">
                  Due this week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating}/5.0</div>
                <p className="text-xs text-muted-foreground">
                  Your review quality
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="testing">Testing Tasks</TabsTrigger>
              <TabsTrigger value="reviews">My Reviews</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Testing Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Testing Progress
                    </CardTitle>
                    <CardDescription>Your testing activity overview</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completed Tests</span>
                      <Badge variant="secondary">{stats.completedTests}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pending Tests</span>
                      <Badge variant="outline">{stats.pendingTests}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tools Tested</span>
                      <Badge variant="outline">{stats.toolsTested}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Badges Earned</span>
                      <Badge variant="outline">{stats.badgesEarned}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      Recent Activity
                    </CardTitle>
                    <CardDescription>Your latest testing activities</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Completed Notion testing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-orange-500" />
                      <span>Started Figma testing</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span>Earned &quot;Design Expert&quot; badge</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-blue-500" />
                      <span>Trust score increased by 5</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>Common tasks and shortcuts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button size="sm" className="w-full">
                      <TestTube className="w-4 h-4 mr-2" />
                      Start New Test
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Write Review
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <Calendar className="w-4 h-4 mr-2" />
                      View Schedule
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <Award className="w-4 h-4 mr-2" />
                      View Badges
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="testing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Testing Tasks</CardTitle>
                  <CardDescription>
                    Manage your assigned testing tasks and track progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {testTasks.map((task) => (
                      <TestingTaskCard
                        key={task.id}
                        task={task}
                        onStart={async (taskId) => {
                          // Handle start test - update task status to in_progress
                          try {
                            const response = await fetch(`/api/testing/tester-stats/tasks/${taskId}`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                status: 'in_progress',
                                startedAt: new Date().toISOString()
                              }),
                            });

                            if (response.ok) {
                              // Refresh the tasks list
                              await fetchTestTasks();
                              console.log('Task started successfully');
                            } else {
                              console.error('Failed to start task');
                            }
                          } catch (error) {
                            console.error('Error starting task:', error);
                          }
                        }}
                        onComplete={async (taskId) => {
                          // Handle complete test - update task status to completed and redirect to submit report
                          try {
                            const response = await fetch(`/api/testing/tester-stats/tasks/${taskId}`, {
                              method: 'PATCH',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({
                                status: 'completed',
                                completedAt: new Date().toISOString()
                              }),
                            });

                            if (response.ok) {
                              // Refresh the tasks list
                              await fetchTestTasks();
                              console.log('Task completed successfully');
                              // Redirect to submit report page
                              router.push(`/tester/submit-report/${taskId}`);
                            } else {
                              console.error('Failed to complete task');
                            }
                          } catch (error) {
                            console.error('Error completing task:', error);
                          }
                        }}
                        onView={(taskId) => {
                          // Handle view report
                          console.log('View report:', taskId);
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Testing Reports</CardTitle>
                  <CardDescription>
                    View and manage your testing reports
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {testReports.map((report) => (
                      <TestingReportCard
                        key={report.id}
                        report={report}
                        onView={(reportId) => {
                          // Handle view report
                          console.log('View report:', reportId);
                        }}
                        onEdit={(reportId) => {
                          // Handle edit report
                          console.log('Edit report:', reportId);
                        }}
                        onApprove={(reportId) => {
                          // Handle approve report
                          console.log('Approve report:', reportId);
                        }}
                        onReject={(reportId) => {
                          // Handle reject report
                          console.log('Reject report:', reportId);
                        }}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Tester Analytics</CardTitle>
                  <CardDescription>
                    Track your performance and growth as a tester
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <BarChart3 className="h-6 w-6" />
                      <span>Testing Analytics</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Star className="h-6 w-6" />
                      <span>Review Performance</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <TrendingUp className="h-6 w-6" />
                      <span>Growth Metrics</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Award className="h-6 w-6" />
                      <span>Badge Progress</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Target className="h-6 w-6" />
                      <span>Goals & Targets</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Users className="h-6 w-6" />
                      <span>Community Impact</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RequireRole>
  );
}
