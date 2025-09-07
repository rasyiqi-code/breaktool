'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RequireRole } from '@/components/auth/require-role';
import { TrendingUp, Wrench, MessageSquare } from "lucide-react";

export default function AdminAnalyticsPage() {
  return (
    <RequireRole requiredRoles={['admin', 'super_admin']}>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Platform performance and insights</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">User Growth</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+12.5%</div>
              <p className="text-xs text-muted-foreground">
                vs last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tool Submissions</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+8.2%</div>
              <p className="text-xs text-muted-foreground">
                vs last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Review Quality</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4.8/5</div>
              <p className="text-xs text-muted-foreground">
                Average rating
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Coming Soon</CardTitle>
              <CardDescription>Advanced analytics features will be available here</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This page will include detailed charts, user behavior analysis, 
                and performance metrics for the platform.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireRole>
  );
}
