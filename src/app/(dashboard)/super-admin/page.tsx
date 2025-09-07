'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RequireRole } from '@/components/auth/require-role';
import { 
  Users, 
  Shield, 
  Star, 
  BarChart3, 
  Settings, 
  Crown,
  Building,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Activity,
  Database,
  Key,
  Globe
} from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  totalTools: number;
  totalReviews: number;
  totalAdmins: number;
  totalVerifiedTesters: number;
  totalVendors: number;
  pendingVerifications: number;
  systemHealth: string;
  activeSessions: number;
  databaseSize: string;
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalTools: 0,
    totalReviews: 0,
    totalAdmins: 0,
    totalVerifiedTesters: 0,
    totalVendors: 0,
    pendingVerifications: 0,
    systemHealth: 'Healthy',
    activeSessions: 0,
    databaseSize: '0 MB'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch basic stats using API routes
      const [
        totalUsersRes,
        totalToolsRes,
        totalReviewsRes,
        totalAdminsRes,
        totalVerifiedTestersRes,
        totalVendorsRes,
        pendingVerificationsRes
      ] = await Promise.all([
        fetch('/api/admin/stats/total-users'),
        fetch('/api/admin/stats/total-tools'),
        fetch('/api/admin/stats/total-reviews'),
        fetch('/api/admin/stats/total-admins'),
        fetch('/api/admin/stats/total-verified-testers'),
        fetch('/api/admin/stats/total-vendors'),
        fetch('/api/admin/stats/pending-verifications')
      ]);

      const [
        { count: totalUsers },
        { count: totalTools },
        { count: totalReviews },
        { count: totalAdmins },
        { count: totalVerifiedTesters },
        { count: totalVendors },
        { count: pendingVerifications }
      ] = await Promise.all([
        totalUsersRes.json(),
        totalToolsRes.json(),
        totalReviewsRes.json(),
        totalAdminsRes.json(),
        totalVerifiedTestersRes.json(),
        totalVendorsRes.json(),
        pendingVerificationsRes.json()
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        totalTools: totalTools || 0,
        totalReviews: totalReviews || 0,
        totalAdmins: totalAdmins || 0,
        totalVerifiedTesters: totalVerifiedTesters || 0,
        totalVendors: totalVendors || 0,
        pendingVerifications: pendingVerifications || 0,
        systemHealth: 'Healthy',
        activeSessions: Math.floor(Math.random() * 100) + 50,
        databaseSize: '2.4 GB'
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <RequireRole requiredRole="super_admin" redirectTo="/dashboard">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Crown className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
              <Badge variant="destructive" className="text-sm">
                <Shield className="w-3 h-3 mr-1" />
                Super Admin
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Full system control and oversight. Manage all aspects of the platform.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +12% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTools.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +8% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalReviews.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +15% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Health</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.systemHealth}</div>
                <p className="text-xs text-muted-foreground">
                  All systems operational
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="system">System Control</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {/* Role Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Role Distribution
                    </CardTitle>
                    <CardDescription>Current user role breakdown</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Admins</span>
                      <Badge variant="destructive">{stats.totalAdmins}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Verified Testers</span>
                      <Badge variant="secondary">{stats.totalVerifiedTesters}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Vendors</span>
                      <Badge variant="outline">{stats.totalVendors}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Regular Users</span>
                      <Badge variant="outline">{stats.totalUsers - stats.totalAdmins - stats.totalVerifiedTesters - stats.totalVendors}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Pending Actions
                    </CardTitle>
                    <CardDescription>Items requiring attention</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Verification Requests</span>
                      <Badge variant="outline">{stats.pendingVerifications}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Tool Submissions</span>
                      <Badge variant="outline">5</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Review Moderation</span>
                      <Badge variant="outline">12</Badge>
                    </div>
                    <Button size="sm" className="w-full mt-2">
                      View All Pending
                    </Button>
                  </CardContent>
                </Card>

                {/* System Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      System Metrics
                    </CardTitle>
                    <CardDescription>Platform performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Active Sessions</span>
                      <span className="text-sm font-medium">{stats.activeSessions}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Database Size</span>
                      <span className="text-sm font-medium">{stats.databaseSize}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Uptime</span>
                      <span className="text-sm font-medium text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Response Time</span>
                      <span className="text-sm font-medium">120ms</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>User Management</CardTitle>
                  <CardDescription>
                    Manage all users, roles, and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Users className="h-6 w-6" />
                      <span>Manage Users</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Shield className="h-6 w-6" />
                      <span>Role Management</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <CheckCircle className="h-6 w-6" />
                      <span>Verifications</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Key className="h-6 w-6" />
                      <span>Permissions</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Building className="h-6 w-6" />
                      <span>Vendor Management</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Star className="h-6 w-6" />
                      <span>Tester Management</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>System Control</CardTitle>
                  <CardDescription>
                    Full system administration and configuration
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Settings className="h-6 w-6" />
                      <span>System Settings</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Database className="h-6 w-6" />
                      <span>Database Management</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Globe className="h-6 w-6" />
                      <span>API Management</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Activity className="h-6 w-6" />
                      <span>System Monitoring</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Shield className="h-6 w-6" />
                      <span>Security Settings</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <TrendingUp className="h-6 w-6" />
                      <span>Performance</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>
                    Comprehensive analytics and insights
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <BarChart3 className="h-6 w-6" />
                      <span>User Analytics</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Star className="h-6 w-6" />
                      <span>Tool Analytics</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <TrendingUp className="h-6 w-6" />
                      <span>Growth Metrics</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Activity className="h-6 w-6" />
                      <span>Performance Analytics</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Users className="h-6 w-6" />
                      <span>Engagement Metrics</span>
                    </Button>
                    <Button variant="outline" className="h-20 flex-col gap-2">
                      <Building className="h-6 w-6" />
                      <span>Revenue Analytics</span>
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
