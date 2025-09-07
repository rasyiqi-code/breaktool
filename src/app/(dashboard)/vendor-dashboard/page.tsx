'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@stackframe/stack';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RequireRole } from '@/components/auth/require-role';
import { Star, DollarSign, Eye, TrendingUp, Building, FileText, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function VendorDashboardPage() {
  const user = useUser();
  const [loading, setLoading] = useState(true);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading vendor dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RequireRole requiredRoles={['vendor', 'admin', 'super_admin']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground dark:text-white">Vendor Dashboard</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-2">
            Welcome back, {user?.displayName || user?.primaryEmail}
          </p>
        </div>

        {error && (
          <Alert className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submit New Tool</CardTitle>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mb-3">
                Add your tool to our platform
              </p>
              <Button asChild className="w-full">
                <a href="/submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Tool
                </a>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">View My Tools</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mb-3">
                Manage your submitted tools
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/tools">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Browse Tools
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Analytics</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground dark:text-gray-400 mb-3">
                Track your tool performance
              </p>
              <Button asChild variant="outline" className="w-full">
                <a href="/admin/analytics">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tools</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                Tools submitted
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                Profile views
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                Out of 5 stars
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground dark:text-gray-400">
                This month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No recent activity</h3>
              <p className="text-muted-foreground dark:text-gray-400 mb-4">
                Your recent submissions and updates will appear here
              </p>
              <Button asChild>
                <a href="/submit">
                  <Plus className="h-4 w-4 mr-2" />
                  Submit Your First Tool
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-foreground dark:text-white">About Vendor Dashboard</h4>
                <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                  This dashboard provides you with tools and insights to manage your presence on our platform. 
                  Submit new tools, track performance, and engage with the community.
                </p>
              </div>
              
              <div>
                <h4 className="font-medium text-foreground dark:text-white">Getting Started</h4>
                <ul className="text-sm text-muted-foreground dark:text-gray-400 mt-1 space-y-1">
                  <li>• Submit your first tool using the &quot;Submit Tool&quot; button</li>
                  <li>• Monitor your tool&apos;s performance in the analytics section</li>
                  <li>• Engage with users through reviews and discussions</li>
                  <li>• Keep your tool information up to date</li>
                </ul>
              </div>

              <div>
                <h4 className="font-medium text-foreground dark:text-white">Need Help?</h4>
                <p className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                  If you have any questions about using the vendor dashboard or need assistance, 
                  please contact our support team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RequireRole>
  );
}