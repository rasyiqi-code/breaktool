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
  Eye
} from "lucide-react";
import { useRouter } from 'next/navigation';
import { RequireRole } from '@/components/auth/require-role';
import Image from 'next/image';

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

interface RecentActivity {
  id: string;
  type: 'tool_submitted' | 'review_created' | 'user_verified' | 'tool_approved';
  title: string;
  description: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

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
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
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
    fetchRecentActivity();
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

  const fetchRecentActivity = async () => {
    try {
      const response = await fetch('/api/admin/recent-activity');
      if (response.ok) {
        const data = await response.json();
        setRecentActivity(data);
      }
    } catch (error) {
      console.error('Error fetching recent activity:', error);
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
          verification_status: 'approved',
          review_notes: 'Approved via admin dashboard'
        }),
      });

      if (response.ok) {
        // Remove from pending applications
        setPendingApplications(prev => prev.filter(app => app.userId !== userId));
        // Refresh stats
        fetchAdminStats();
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
        // Remove from vendor applications
        setVendorApplications(prev => prev.filter(app => app.userId !== userId));
        // Refresh stats
        fetchAdminStats();
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
          verification_status: 'rejected',
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
        
        <div className="container mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
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
      <div className="min-h-screen bg-background">
      
      <div className="container mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <Badge variant="destructive" className="text-sm">
                <Shield className="w-3 h-3 mr-1" />
                Admin
              </Badge>
            </div>
            <NotificationBell />
          </div>
          <p className="text-muted-foreground">
            Manage platform content, moderate reviews, and conduct testing. Full admin access with testing capabilities.
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.verifiedTesters} verified testers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                          <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTools}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeTools} active, {stats.pendingToolSubmissions} pending
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReviews}</div>
              <p className="text-xs text-muted-foreground">
                Community feedback
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Testers</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.verifiedTesters}</div>
              <p className="text-xs text-muted-foreground">
                Expert reviewers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Verifications</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingVerifications}</div>
              <p className="text-xs text-muted-foreground">
                Tester applications
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Testing Tasks</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTestingTasks}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedTestingTasks} completed
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Tools</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingToolSubmissions}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Tools</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTools}</div>
              <p className="text-xs text-muted-foreground">
                Live on platform
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Button 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => router.push('/admin/create-task')}
          >
            <TestTube className="h-5 w-5" />
            <span>Create Testing Task</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => router.push('/admin/tasks')}
          >
            <Eye className="h-5 w-5" />
            <span>Manage Tasks</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => router.push('/admin/approve-reports')}
          >
            <FileCheck className="h-5 w-5" />
            <span>Approve Reports</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => router.push('/admin/tools')}
          >
            <Plus className="h-5 w-5" />
            <span>Add Tool</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-auto p-4 flex flex-col items-center gap-2"
            onClick={() => router.push('/admin/users')}
          >
            <Shield className="h-5 w-5" />
            <span>Manage Users</span>
          </Button>
        </div>

        {/* Recent Activity and Trust Leaderboard */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pending-applications">Pending Applications</TabsTrigger>
            <TabsTrigger value="vendor-applications">Vendor Applications</TabsTrigger>
            <TabsTrigger value="content">Content Management</TabsTrigger>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest platform activities</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg border">
                          <div className="flex-shrink-0 mt-1">
                            {getActivityIcon(activity.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium">{activity.title}</p>
                              {getStatusBadge(activity.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(activity.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No recent activity</p>
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
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push('/admin/tools')}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Review Pending Tools
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push('/admin/users')}
                    >
                      <Award className="w-4 h-4 mr-2" />
                      Verify Tester Applications
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
            <div className="space-y-6">
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
                <div className="grid gap-4">
                  {pendingApplications.map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{application.userName}</CardTitle>
                            <CardDescription>{application.userEmail}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{application.company}</Badge>
                            <Badge variant="secondary">{application.jobTitle}</Badge>
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
                          
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveApplication(application.userId)}
                              className="flex-1"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRejectApplication(application.userId)}
                              className="flex-1"
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
            <div className="space-y-6">
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
                <div className="grid gap-4">
                  {vendorApplications.map((application) => (
                    <Card key={application.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg">{application.userName}</CardTitle>
                            <CardDescription>{application.userEmail}</CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{application.companyName}</Badge>
                            <Badge variant="secondary">{application.industry}</Badge>
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
                          
                          <div className="flex gap-2 pt-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleApproveVendorApplication(application.userId)}
                              className="flex-1"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRejectVendorApplication(application.userId)}
                              className="flex-1"
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
            <div className="space-y-6">
              {/* Testing Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
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
                  <CardContent className="p-4">
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
                  <CardContent className="p-4">
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
                  <CardContent className="p-4">
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
                    <div className="space-y-4">
                      {recentTasks.slice(0, 5).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                          <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                              {task.tool.logoUrl && (
                                <Image 
                                  src={task.tool.logoUrl} 
                                  alt={task.tool.name}
                                  width={32}
                                  height={32}
                                  className="rounded"
                                />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{task.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {task.tool.name} • {task.tester.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
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

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.push('/admin/create-task')}
                >
                  <TestTube className="h-5 w-5" />
                  <span>Create New Task</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.push('/admin/tasks')}
                >
                  <Eye className="h-5 w-5" />
                  <span>Manage Tasks</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => router.push('/admin/approve-reports')}
                >
                  <FileCheck className="h-5 w-5" />
                  <span>Review Reports</span>
                </Button>
              </div>
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
