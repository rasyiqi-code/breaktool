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

// Import super admin components
import { SystemSettings } from '@/components/super-admin/system-settings';
import { DatabaseManagement } from '@/components/super-admin/database-management';
import { ApiManagement } from '@/components/super-admin/api-management';
import { SystemMonitoring } from '@/components/super-admin/system-monitoring';
import { SecuritySettings } from '@/components/super-admin/security-settings';
import { Performance } from '@/components/super-admin/performance';
import ManageUsers from '@/components/super-admin/manage-users';
import RoleManagement from '@/components/super-admin/role-management';
import Verifications from '@/components/super-admin/verifications';
import Permissions from '@/components/super-admin/permissions';
import VendorManagement from '@/components/super-admin/vendor-management';
import TesterManagement from '@/components/super-admin/tester-management';

// Import analytics components
import { UserAnalytics } from '@/components/super-admin/user-analytics';
import { ToolAnalytics } from '@/components/super-admin/tool-analytics';
import { GrowthMetrics } from '@/components/super-admin/growth-metrics';
import { PerformanceAnalytics } from '@/components/super-admin/performance-analytics';
import { EngagementMetrics } from '@/components/super-admin/engagement-metrics';
import { RevenueAnalytics } from '@/components/super-admin/revenue-analytics';

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
  const [activeSystemTab, setActiveSystemTab] = useState<string>('overview');
  const [activeUserTab, setActiveUserTab] = useState<string>('overview');
  const [activeAnalyticsTab, setActiveAnalyticsTab] = useState<string>('overview');

  const handleSystemTabClick = (tab: string) => {
    setActiveSystemTab(tab);
  };

  const handleUserTabClick = (tab: string) => {
    setActiveUserTab(tab);
  };

  const handleAnalyticsTabClick = (tab: string) => {
    setActiveAnalyticsTab(tab);
  };

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
              {activeUserTab === 'overview' ? (
                <Card>
                  <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>
                      Manage all users, roles, and permissions
                    </CardDescription>
                    <div className="text-xs text-muted-foreground">
                      Click any button below to access user management features
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <button 
                        className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-all duration-200 bg-card text-card-foreground"
                        onClick={() => handleUserTabClick('manage-users')}
                      >
                        <Users className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium text-foreground">Manage Users</span>
                      </button>
                      <button 
                        className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-all duration-200 bg-card text-card-foreground"
                        onClick={() => handleUserTabClick('role-management')}
                      >
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium text-foreground">Role Management</span>
                      </button>
                      <button 
                        className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-all duration-200 bg-card text-card-foreground"
                        onClick={() => handleUserTabClick('verifications')}
                      >
                        <CheckCircle className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium text-foreground">Verifications</span>
                      </button>
                      <button 
                        className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-all duration-200 bg-card text-card-foreground"
                        onClick={() => handleUserTabClick('permissions')}
                      >
                        <Key className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium text-foreground">Permissions</span>
                      </button>
                      <button 
                        className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-all duration-200 bg-card text-card-foreground"
                        onClick={() => handleUserTabClick('vendor-management')}
                      >
                        <Building className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium text-foreground">Vendor Management</span>
                      </button>
                      <button 
                        className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-all duration-200 bg-card text-card-foreground"
                        onClick={() => handleUserTabClick('tester-management')}
                      >
                        <Star className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium text-foreground">Tester Management</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button onClick={() => handleUserTabClick('overview')}>
                      ← Back to User Management
                    </Button>
                    <h2 className="text-xl font-semibold">
                      {activeUserTab === 'manage-users' && 'Manage Users'}
                      {activeUserTab === 'role-management' && 'Role Management'}
                      {activeUserTab === 'verifications' && 'Verifications'}
                      {activeUserTab === 'permissions' && 'Permissions'}
                      {activeUserTab === 'vendor-management' && 'Vendor Management'}
                      {activeUserTab === 'tester-management' && 'Tester Management'}
                    </h2>
                  </div>
                  {activeUserTab === 'manage-users' && <ManageUsers />}
                  {activeUserTab === 'role-management' && <RoleManagement />}
                  {activeUserTab === 'verifications' && <Verifications />}
                  {activeUserTab === 'permissions' && <Permissions />}
                  {activeUserTab === 'vendor-management' && <VendorManagement />}
                  {activeUserTab === 'tester-management' && <TesterManagement />}
                </div>
              )}
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              {activeSystemTab === 'overview' ? (
                <Card>
                  <CardHeader>
                    <CardTitle>System Control</CardTitle>
                    <CardDescription>
                      Full system administration and configuration
                    </CardDescription>
                    <div className="text-xs text-muted-foreground">
                      Click any button below to access system features
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <button 
                        className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-all duration-200 bg-card text-card-foreground"
                        onClick={() => handleSystemTabClick('settings')}
                      >
                        <Settings className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium text-foreground">System Settings</span>
                      </button>
                      <button 
                        className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-all duration-200 bg-card text-card-foreground"
                        onClick={() => handleSystemTabClick('database')}
                      >
                        <Database className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium text-foreground">Database Management</span>
                      </button>
                      <button 
                        className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-all duration-200 bg-card text-card-foreground"
                        onClick={() => handleSystemTabClick('api')}
                      >
                        <Globe className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium text-foreground">API Management</span>
                      </button>
                      <button 
                        className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-all duration-200 bg-card text-card-foreground"
                        onClick={() => handleSystemTabClick('monitoring')}
                      >
                        <Activity className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium text-foreground">System Monitoring</span>
                      </button>
                      <button 
                        className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-all duration-200 bg-card text-card-foreground"
                        onClick={() => handleSystemTabClick('security')}
                      >
                        <Shield className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium text-foreground">Security Settings</span>
                      </button>
                      <button 
                        className="h-20 flex flex-col items-center justify-center gap-2 border-2 border-border rounded-lg cursor-pointer hover:bg-accent hover:border-primary transition-all duration-200 bg-card text-card-foreground"
                        onClick={() => handleSystemTabClick('performance')}
                      >
                        <TrendingUp className="h-6 w-6 text-primary" />
                        <span className="text-sm font-medium text-foreground">Performance</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setActiveSystemTab('overview')}
                    >
                      ← Back to System Control
                    </Button>
                    <h2 className="text-xl font-semibold">
                      {activeSystemTab === 'settings' && 'System Settings'}
                      {activeSystemTab === 'database' && 'Database Management'}
                      {activeSystemTab === 'api' && 'API Management'}
                      {activeSystemTab === 'monitoring' && 'System Monitoring'}
                      {activeSystemTab === 'security' && 'Security Settings'}
                      {activeSystemTab === 'performance' && 'Performance Monitoring'}
                    </h2>
                  </div>
                  
                  {activeSystemTab === 'settings' && <SystemSettings />}
                  {activeSystemTab === 'database' && <DatabaseManagement />}
                  {activeSystemTab === 'api' && <ApiManagement />}
                  {activeSystemTab === 'monitoring' && <SystemMonitoring />}
                  {activeSystemTab === 'security' && <SecuritySettings />}
                  {activeSystemTab === 'performance' && <Performance />}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              {activeAnalyticsTab === 'overview' ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Platform Analytics</CardTitle>
                    <CardDescription>
                      Comprehensive analytics and insights
                    </CardDescription>
                    <div className="text-xs text-muted-foreground">
                      Click any button below to access analytics features
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <button
                        onClick={() => handleAnalyticsTabClick('user-analytics')}
                        className="h-20 flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <BarChart3 className="h-6 w-6" />
                        <span className="text-sm font-medium">User Analytics</span>
                      </button>
                      <button
                        onClick={() => handleAnalyticsTabClick('tool-analytics')}
                        className="h-20 flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <Star className="h-6 w-6" />
                        <span className="text-sm font-medium">Tool Analytics</span>
                      </button>
                      <button
                        onClick={() => handleAnalyticsTabClick('growth-metrics')}
                        className="h-20 flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <TrendingUp className="h-6 w-6" />
                        <span className="text-sm font-medium">Growth Metrics</span>
                      </button>
                      <button
                        onClick={() => handleAnalyticsTabClick('performance-analytics')}
                        className="h-20 flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <Activity className="h-6 w-6" />
                        <span className="text-sm font-medium">Performance Analytics</span>
                      </button>
                      <button
                        onClick={() => handleAnalyticsTabClick('engagement-metrics')}
                        className="h-20 flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <Users className="h-6 w-6" />
                        <span className="text-sm font-medium">Engagement Metrics</span>
                      </button>
                      <button
                        onClick={() => handleAnalyticsTabClick('revenue-analytics')}
                        className="h-20 flex flex-col items-center justify-center gap-2 p-4 border rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <Building className="h-6 w-6" />
                        <span className="text-sm font-medium">Revenue Analytics</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAnalyticsTabClick('overview')}
                    >
                      ← Back to Analytics
                    </Button>
                    <div>
                      <h2 className="text-lg font-semibold">
                        {activeAnalyticsTab === 'user-analytics' && 'User Analytics'}
                        {activeAnalyticsTab === 'tool-analytics' && 'Tool Analytics'}
                        {activeAnalyticsTab === 'growth-metrics' && 'Growth Metrics'}
                        {activeAnalyticsTab === 'performance-analytics' && 'Performance Analytics'}
                        {activeAnalyticsTab === 'engagement-metrics' && 'Engagement Metrics'}
                        {activeAnalyticsTab === 'revenue-analytics' && 'Revenue Analytics'}
                      </h2>
                    </div>
                  </div>
                  
                  {activeAnalyticsTab === 'user-analytics' && <UserAnalytics />}
                  {activeAnalyticsTab === 'tool-analytics' && <ToolAnalytics />}
                  {activeAnalyticsTab === 'growth-metrics' && <GrowthMetrics />}
                  {activeAnalyticsTab === 'performance-analytics' && <PerformanceAnalytics />}
                  {activeAnalyticsTab === 'engagement-metrics' && <EngagementMetrics />}
                  {activeAnalyticsTab === 'revenue-analytics' && <RevenueAnalytics />}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </RequireRole>
  );
}
