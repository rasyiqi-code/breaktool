'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TrustLeaderboard } from "@/components/trust-score/trust-leaderboard";
import { NotificationBell } from "@/components/ui/notification-bell";
import { 
  Users, 
  Wrench, 
  MessageSquare, 
  TrendingUp, 
  Shield, 
  Award,
  Settings,
  Plus,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  TestTube,
  FileCheck,
  Building2,
  PlayCircle,
  Eye,
  RefreshCw
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { RequireRole } from '@/components/auth/require-role';
import Image from 'next/image';
import { useActivity } from '@/hooks/use-activity';
import { ActivityLogger } from '@/lib/utils/activity-logger';

interface AdminStats {
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

// interface RecentActivity {
//   id: string;
//   type: 'tool_submitted' | 'review_created' | 'user_verified' | 'tool_approved';
//   title: string;
//   description: string;
//   timestamp: string;
//   status: 'pending' | 'approved' | 'rejected';
// }

interface TestingStats {
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
}

interface RecentTask {
  id: string;
  title: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  deadline: string;
  tool: {
    name: string;
    logoUrl?: string;
  };
  tester: {
    name: string;
  };
}

interface PendingApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  company: string;
  jobTitle: string;
  expertiseAreas: string[];
  motivation: string;
  experienceYears: number;
  createdAt: string;
  status: 'pending';
}

interface VendorApplication {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  companyName: string;
  companySize: string;
  industry: string;
  websiteUrl: string;
  linkedinUrl: string | null;
  companyDescription: string;
  productsServices: string;
  targetAudience: string;
  businessModel: string;
  motivation: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function AdminDashboard() {
  const router = useRouter();
  const { activities, loading: activityLoading, refresh: refreshActivities } = useActivity();
  const [stats, setStats] = useState<AdminStats>({
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
  const [pendingApplications, setPendingApplications] = useState<PendingApplication[]>([]);
  const [vendorApplications, setVendorApplications] = useState<VendorApplication[]>([]);
  const [testingStats, setTestingStats] = useState<TestingStats>({
    totalTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    completedTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState<RecentTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
    fetchPendingApplications();
    fetchVendorApplications();
    fetchTestingStats();
    fetchRecentTasks();
    
  }, []);

  const fetchAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };


  const fetchPendingApplications = async () => {
    try {
      const response = await fetch('/api/admin/pending-applications');
      if (response.ok) {
        const data = await response.json();
        setPendingApplications(data);
      }
    } catch (error) {
      console.error('Error fetching pending applications:', error);
    }
  };

  const fetchVendorApplications = async () => {
    try {
      const response = await fetch('/api/admin/vendor-applications');
      if (response.ok) {
        const data = await response.json();
        setVendorApplications(data);
      }
    } catch (error) {
      console.error('Error fetching vendor applications:', error);
    }
  };

  const handleApproveApplication = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verification`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          verificationStatus: 'approved',
          review_notes: 'Approved via admin dashboard'
        }),
      });

      if (response.ok) {
        // Find the application to get user name
        const application = pendingApplications.find(app => app.userId === userId);
        
        // Log the activity
        if (application) {
          ActivityLogger.logUserVerification(application.userName, 'Admin');
        }
        
        // Remove from pending applications
        setPendingApplications(prev => prev.filter(app => app.userId !== userId));
        // Refresh stats
        fetchAdminStats();
        // Refresh activities
        refreshActivities();
      }
    } catch (error) {
      console.error('Error approving application:', error);
    }
  };

  const handleApproveVendorApplication = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/vendor-approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'approved',
          review_notes: 'Approved via admin dashboard'
        }),
      });

      if (response.ok) {
        // Find the application to get user name
        const application = vendorApplications.find(app => app.userId === userId);
        
        // Log the activity
        if (application) {
          ActivityLogger.logCustomActivity(
            'user_verified',
            'Vendor Approved',
            `Vendor "${application.companyName}" approved for platform access`,
            'approved',
            application.userName,
            undefined,
            { companyName: application.companyName, approvedBy: 'Admin' }
          );
        }
        
        // Remove from vendor applications
        setVendorApplications(prev => prev.filter(app => app.userId !== userId));
        // Refresh stats
        fetchAdminStats();
        // Refresh activities
        refreshActivities();
      }
    } catch (error) {
      console.error('Error approving vendor application:', error);
    }
  };

  const handleRejectVendorApplication = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/vendor-approval`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'rejected',
          review_notes: 'Rejected via admin dashboard'
        }),
      });

      if (response.ok) {
        // Remove from vendor applications
        setVendorApplications(prev => prev.filter(app => app.userId !== userId));
        // Refresh stats
        fetchAdminStats();
      }
    } catch (error) {
      console.error('Error rejecting vendor application:', error);
    }
  };

  const handleRejectApplication = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verification`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          verificationStatus: 'rejected',
          review_notes: 'Rejected via admin dashboard'
        }),
      });

      if (response.ok) {
        // Remove from pending applications
        setPendingApplications(prev => prev.filter(app => app.userId !== userId));
        // Refresh stats
        fetchAdminStats();
      }
    } catch (error) {
      console.error('Error rejecting application:', error);
    }
  };

  const fetchTestingStats = async () => {
    try {
      const response = await fetch('/api/testing/tester-stats/tasks');
      if (response.ok) {
        const data = await response.json();
        const tasks = data.tasks || [];
        
        const newStats = {
          totalTasks: tasks.length,
          pendingTasks: tasks.filter((t: { status: string }) => t.status === 'pending').length,
          inProgressTasks: tasks.filter((t: { status: string }) => t.status === 'in_progress').length,
          completedTasks: tasks.filter((t: { status: string }) => t.status === 'completed').length
        };
        
        setTestingStats(newStats);
      }
    } catch (error) {
      console.error('Error fetching testing stats:', error);
    }
  };

  const fetchRecentTasks = async () => {
    try {
      const response = await fetch('/api/testing/tester-stats/tasks');
      if (response.ok) {
        const data = await response.json();
        const tasks = data.tasks || [];
        
        // Get recent 5 tasks
        const recent = tasks
          .sort((a: { createdAt: string }, b: { createdAt: string }) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
          .map((task: { id: string; title: string; status: string; deadline: string; tool?: { name: string; logoUrl?: string }; tester?: { name: string } }) => ({
            id: task.id,
            title: task.title,
            status: task.status,
            deadline: task.deadline,
            tool: {
              name: task.tool?.name || 'Unknown Tool',
              logoUrl: task.tool?.logoUrl
            },
            tester: {
              name: task.tester?.name || 'Unknown Tester'
            }
          }));
        
        setRecentTasks(recent);
      }
    } catch (error) {
      console.error('Error fetching recent tasks:', error);
    }
  };

  const getTaskStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="text-xs">Pending</Badge>;
      case 'in_progress':
        return <Badge variant="default" className="text-xs">In Progress</Badge>;
      case 'completed':
        return <Badge variant="default" className="text-xs bg-green-100 text-green-800">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive" className="text-xs">Cancelled</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Unknown</Badge>;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tool_submitted':
        return <Plus className="w-4 h-4" />;
      case 'review_created':
        return <MessageSquare className="w-4 h-4" />;
      case 'user_verified':
        return <Award className="w-4 h-4" />;
      case 'tool_approved':
        return <CheckCircle className="w-4 h-4" />;
      case 'user_registered':
        return <Users className="w-4 h-4" />;
      case 'testing_task_created':
        return <TestTube className="w-4 h-4" />;
      case 'report_submitted':
        return <FileCheck className="w-4 h-4" />;
      case 'discussion_created':
        return <MessageSquare className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="text-xs">Pending</Badge>;
      case 'approved':
        return <Badge variant="default" className="text-xs">Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Unknown</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        
        <div className="w-full max-w-full px-2 sm:px-4 lg:px-6 pt-16 overflow-x-hidden">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading admin dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RequireRole requiredRoles={['admin', 'super_admin']} redirectTo="/dashboard">
      <div className="min-h-screen bg-background overflow-x-hidden">
      
      <div className="w-full max-w-full px-2 sm:px-4 lg:px-6 pt-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
                <h1 className="text-2xl sm:text-3xl font-bold">Admin Dashboard</h1>
              </div>
              <Badge variant="destructive" className="text-sm">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
            <div className="flex justify-end">
              <NotificationBell />
            </div>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Manage platform content, moderate reviews, and conduct testing. Full admin access with testing capabilities.
          </p>
        </div>

        {/* Stats Overview - Redesigned with Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {/* Platform Overview Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Platform Overview</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/admin/analytics')}
              >
                View Detail
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Summary Table */}
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full text-sm min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium px-2">Metric</th>
                      <th className="text-right py-2 font-medium px-2">Total</th>
                      <th className="text-right py-2 font-medium px-2">Active</th>
                      <th className="text-right py-2 font-medium px-2">Change</th>
                    </tr>
                  </thead>
                  <tbody className="space-y-2">
                    <tr className="border-b">
                      <td className="py-2 px-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                        <span className="truncate">Users</span>
                      </td>
                      <td className="text-right py-2 px-2 font-semibold">{stats.totalUsers.toLocaleString()}</td>
                      <td className="text-right py-2 px-2">{stats.verifiedTesters.toLocaleString()}</td>
                      <td className="text-right py-2 px-2 text-green-600 flex items-center justify-end gap-1">
                        <TrendingUp className="w-3 h-3 flex-shrink-0" />
                        <span className="text-xs">+12.5%</span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                        <span className="truncate">Tools</span>
                      </td>
                      <td className="text-right py-2 px-2 font-semibold">{stats.totalTools.toLocaleString()}</td>
                      <td className="text-right py-2 px-2">{stats.activeTools.toLocaleString()}</td>
                      <td className="text-right py-2 px-2 text-green-600 flex items-center justify-end gap-1">
                        <TrendingUp className="w-3 h-3 flex-shrink-0" />
                        <span className="text-xs">+8.3%</span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full flex-shrink-0"></div>
                        <span className="truncate">Reviews</span>
                      </td>
                      <td className="text-right py-2 px-2 font-semibold">{stats.totalReviews.toLocaleString()}</td>
                      <td className="text-right py-2 px-2">-</td>
                      <td className="text-right py-2 px-2 text-green-600 flex items-center justify-end gap-1">
                        <TrendingUp className="w-3 h-3 flex-shrink-0" />
                        <span className="text-xs">+15.2%</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 flex items-center gap-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0"></div>
                        <span className="truncate">Tasks</span>
                      </td>
                      <td className="text-right py-2 px-2 font-semibold">{stats.totalTestingTasks.toLocaleString()}</td>
                      <td className="text-right py-2 px-2">{stats.completedTestingTasks.toLocaleString()}</td>
                      <td className="text-right py-2 px-2 text-red-600 flex items-center justify-end gap-1">
                        <TrendingUp className="w-3 h-3 rotate-180 flex-shrink-0" />
                        <span className="text-xs">-3.1%</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              {/* Simple Bar Chart */}
              <div className="space-y-2 overflow-x-auto">
                <div className="flex items-center justify-between text-xs">
                  <span>Platform Growth</span>
                  <span>Last 6 months</span>
                </div>
                <div className="flex items-end gap-1 h-16 min-w-[200px]">
                  {[65, 78, 82, 75, 88, 92].map((height, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center min-w-[30px]">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${height}%` }}
                      ></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground min-w-[200px]">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Items Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">Pending Items</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => router.push('/admin/analytics')}
              >
                View Detail
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pending Summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{stats.pendingVerifications}</div>
                  <div className="text-sm text-red-600">Verifications</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendingToolSubmissions}</div>
                  <div className="text-sm text-yellow-600">Tool Submissions</div>
                </div>
              </div>

              {/* Pending Details Table */}
              <div className="overflow-x-auto -mx-2 sm:mx-0">
                <table className="w-full text-sm min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 font-medium px-2">Type</th>
                      <th className="text-right py-2 font-medium px-2">Count</th>
                      <th className="text-right py-2 font-medium px-2">Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2 px-2 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="truncate">Tester Applications</span>
                      </td>
                      <td className="text-right py-2 px-2 font-semibold">{stats.pendingVerifications}</td>
                      <td className="text-right py-2 px-2">
                        <Badge variant="destructive" className="text-xs">High</Badge>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2 px-2 flex items-center gap-2">
                        <Wrench className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                        <span className="truncate">Tool Submissions</span>
                      </td>
                      <td className="text-right py-2 px-2 font-semibold">{stats.pendingToolSubmissions}</td>
                      <td className="text-right py-2 px-2">
                        <Badge variant="secondary" className="text-xs">Medium</Badge>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 px-2 flex items-center gap-2">
                        <TestTube className="w-4 h-4 text-blue-500 flex-shrink-0" />
                        <span className="truncate">Testing Tasks</span>
                      </td>
                      <td className="text-right py-2 px-2 font-semibold">{stats.totalTestingTasks - stats.completedTestingTasks}</td>
                      <td className="text-right py-2 px-2">
                        <Badge variant="outline" className="text-xs">Low</Badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Verification Progress</span>
                    <span>{Math.round((stats.verifiedTesters / (stats.verifiedTesters + stats.pendingVerifications)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${(stats.verifiedTesters / (stats.verifiedTesters + stats.pendingVerifications)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Tool Approval Progress</span>
                    <span>{Math.round((stats.activeTools / (stats.activeTools + stats.pendingToolSubmissions)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full"
                      style={{ width: `${(stats.activeTools / (stats.activeTools + stats.pendingToolSubmissions)) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 sm:gap-3 mb-6 sm:mb-8">
          <Button 
            className="h-auto p-2 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 text-xs sm:text-base"
            onClick={() => {
              ActivityLogger.logTestingTaskCreation('New Tool', 'Admin');
              refreshActivities();
              router.push('/admin/create-task');
            }}
          >
            <TestTube className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-center">Create Testing Task</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-2 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 text-xs sm:text-base"
            onClick={() => {
              ActivityLogger.logCustomActivity(
                'testing_task_created',
                'Admin Task Management',
                'Admin accessed task management section',
                'pending',
                'Admin'
              );
              refreshActivities();
              router.push('/admin/tasks');
            }}
          >
            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-center">Manage Tasks</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-2 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 text-xs sm:text-base"
            onClick={() => {
              ActivityLogger.logCustomActivity(
                'report_submitted',
                'Admin Report Review',
                'Admin accessed report approval section',
                'pending',
                'Admin'
              );
              refreshActivities();
              router.push('/admin/approve-reports');
            }}
          >
            <FileCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-center">Approve Reports</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-2 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 text-xs sm:text-base"
            onClick={() => {
              ActivityLogger.logToolSubmission('New Tool', 'Admin');
              refreshActivities();
              router.push('/admin/tools');
            }}
          >
            <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-center">Add Tool</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-2 sm:p-4 flex flex-col items-center gap-1 sm:gap-2 text-xs sm:text-base"
            onClick={() => {
              ActivityLogger.logCustomActivity(
                'user_verified',
                'Admin User Management',
                'Admin accessed user management section',
                'pending',
                'Admin'
              );
              refreshActivities();
              router.push('/admin/users');
            }}
          >
            <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-center">Manage Users</span>
          </Button>
        </div>

        {/* Recent Activity and Trust Leaderboard */}
        <Tabs defaultValue="overview" className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="w-full">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="pending-applications" className="text-xs sm:text-sm">Pending Apps</TabsTrigger>
              <TabsTrigger value="vendor-applications" className="text-xs sm:text-sm">Vendor Apps</TabsTrigger>
              <TabsTrigger value="content" className="text-xs sm:text-sm">Content</TabsTrigger>
              <TabsTrigger value="testing" className="text-xs sm:text-sm">Testing</TabsTrigger>
              <TabsTrigger value="moderation" className="text-xs sm:text-sm">Moderation</TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs sm:text-sm">Analytics</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value="overview">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-3 sm:gap-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>Latest platform activities</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={refreshActivities}
                        disabled={activityLoading}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refresh
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 sm:space-y-4">
                    {activityLoading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                        <p className="text-muted-foreground mt-2">Loading activities...</p>
                      </div>
                    ) : activities.length > 0 ? (
                      activities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                          <div className="flex-shrink-0 mt-1">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                              <p className="text-sm font-medium truncate">{activity.title}</p>
                              {getStatusBadge(activity.status)}
                            </div>
                            <p className="text-sm text-muted-foreground break-words">{activity.description}</p>
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mt-1">
                              <p className="text-xs text-muted-foreground">
                                {new Date(activity.timestamp).toLocaleString()}
                              </p>
                              {activity.userName && (
                                <p className="text-xs text-muted-foreground">
                                  by {activity.userName}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Recent Activity</h3>
                        <p className="text-muted-foreground">
                          Activities will appear here as users interact with the platform.
                        </p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Try approving applications, creating tasks, or managing tools to see activities.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common admin tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        ActivityLogger.logCustomActivity(
                          'tool_submitted',
                          'Admin Tool Review',
                          'Admin accessed tool review section',
                          'pending',
                          'Admin'
                        );
                        refreshActivities();
                        router.push('/admin/tools');
                      }}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Review Pending Tools
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => {
                        ActivityLogger.logCustomActivity(
                          'user_verified',
                          'Admin User Management',
                          'Admin accessed user verification section',
                          'pending',
                          'Admin'
                        );
                        refreshActivities();
                        router.push('/admin/users');
                      }}
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Verify Tester Applications
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push('/admin/ownership-claims')}
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Review Ownership Claims
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push('/admin/users')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Manage User Roles
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push('/admin/analytics')}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push('/admin/settings')}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Platform Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Score Leaderboard */}
              <TrustLeaderboard limit={5} />
            </div>
          </TabsContent>
          
          <TabsContent value="pending-applications">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Pending Applications</h2>
                  <p className="text-muted-foreground">
                    Review and approve verified tester applications
                  </p>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {pendingApplications.length} pending
                </Badge>
              </div>

              {pendingApplications.length > 0 ? (
                <div className="grid gap-3 sm:gap-4">
                  {pendingApplications.map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <CardTitle className="text-lg">{application.userName}</CardTitle>
                            <CardDescription className="break-all">{application.userEmail}</CardDescription>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">{application.company}</Badge>
                            <Badge variant="secondary" className="text-xs">{application.jobTitle}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Areas of Expertise</h4>
                            <div className="flex flex-wrap gap-2">
                              {application.expertiseAreas.map((area, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Motivation</h4>
                            <p className="text-sm text-muted-foreground">
                              {application.motivation}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Experience: {application.experienceYears} years</span>
                            <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveApplication(application.userId)}
                              className="w-full sm:flex-1"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRejectApplication(application.userId)}
                              className="w-full sm:flex-1"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Pending Applications</h3>
                    <p className="text-muted-foreground">
                      All verification applications have been processed.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="vendor-applications">
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Vendor Applications</h2>
                  <p className="text-muted-foreground">
                    Review and approve vendor applications
                  </p>
                </div>
                <Badge variant="secondary" className="text-sm">
                  {vendorApplications.length} pending
                </Badge>
              </div>

              {vendorApplications.length > 0 ? (
                <div className="grid gap-3 sm:gap-4">
                  {vendorApplications.map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <CardTitle className="text-lg">{application.userName}</CardTitle>
                            <CardDescription className="break-all">{application.userEmail}</CardDescription>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="text-xs">{application.companyName}</Badge>
                            <Badge variant="secondary" className="text-xs">{application.industry}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Company Details</h4>
                              <div className="space-y-2 text-sm">
                                <p><span className="font-medium">Size:</span> {application.companySize}</p>
                                <p><span className="font-medium">Business Model:</span> {application.businessModel}</p>
                                <p><span className="font-medium">Website:</span> <a href={application.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{application.websiteUrl}</a></p>
                                {application.linkedinUrl && (
                                  <p><span className="font-medium">LinkedIn:</span> <a href={application.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{application.linkedinUrl}</a></p>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Products & Services</h4>
                              <p className="text-sm text-muted-foreground mb-2">
                                {application.productsServices}
                              </p>
                              <h4 className="font-medium mb-2">Target Audience</h4>
                              <p className="text-sm text-muted-foreground">
                                {application.targetAudience}
                              </p>
                            </div>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Company Description</h4>
                            <p className="text-sm text-muted-foreground">
                              {application.companyDescription}
                            </p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Motivation</h4>
                            <p className="text-sm text-muted-foreground">
                              {application.motivation}
                            </p>
                          </div>
                          
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2 pt-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveVendorApplication(application.userId)}
                              className="w-full sm:flex-1"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRejectVendorApplication(application.userId)}
                              className="w-full sm:flex-1"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="text-center py-12">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Pending Vendor Applications</h3>
                    <p className="text-muted-foreground">
                      All vendor applications have been processed.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="content">
            <p>Content Management Content</p>
            {/* Add content management features here */}
          </TabsContent>
          <TabsContent value="testing">
            <div className="space-y-4 sm:space-y-6">
              {/* Testing Overview Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
                        <p className="text-2xl font-bold">{testingStats.totalTasks || 0}</p>
                      </div>
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <TestTube className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Pending Tasks</p>
                        <p className="text-2xl font-bold text-yellow-600">{testingStats.pendingTasks || 0}</p>
                      </div>
                      <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Clock className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                        <p className="text-2xl font-bold text-blue-600">{testingStats.inProgressTasks || 0}</p>
                      </div>
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <PlayCircle className="h-4 w-4 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Completed</p>
                        <p className="text-2xl font-bold text-green-600">{testingStats.completedTasks || 0}</p>
                      </div>
                      <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Tasks */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Testing Tasks</CardTitle>
                      <CardDescription>Latest testing tasks and their status</CardDescription>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => router.push('/admin/tasks')}
                    >
                      View All Tasks
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {recentTasks.length > 0 ? (
                    <div className="space-y-3 sm:space-y-4">
                      {recentTasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {task.tool.logoUrl && (
                                <Image 
                                  src={task.tool.logoUrl} 
                                  alt={task.tool.name}
                                  width={32}
                                  height={32}
                                  className="rounded w-8 h-8 sm:w-10 sm:h-10"
                                />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium truncate">{task.title}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {task.tool.name} • {task.tester.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            {getTaskStatusBadge(task.status)}
                            <span className="text-sm text-muted-foreground">
                              {new Date(task.deadline).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TestTube className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">No testing tasks found</p>
                      <Button onClick={() => router.push('/admin/create-task')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Task
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

            </div>
          </TabsContent>
          <TabsContent value="moderation">
            <p>Moderation Content</p>
            {/* Add moderation features here */}
          </TabsContent>
          <TabsContent value="analytics">
            <p>Analytics Content</p>
            {/* Add analytics features here */}
          </TabsContent>
                 </Tabs>
       </div>
     </div>
     </RequireRole>
   );
}
