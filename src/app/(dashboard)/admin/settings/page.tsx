'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RequireRole } from '@/components/auth/require-role';
import { Settings, Shield, Users, Bell } from "lucide-react";

export default function AdminSettingsPage() {
  return (
    <RequireRole requiredRoles={['admin', 'super_admin']}>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Platform Settings</h1>
          <p className="text-muted-foreground">Configure platform behavior and policies</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                General Settings
              </CardTitle>
              <CardDescription>Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name">Platform Name</Label>
                <Input id="platform-name" defaultValue="BreakTool" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email">Contact Email</Label>
                <Input id="contact-email" type="email" defaultValue="admin@breaktool.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-file-size">Max File Size (MB)</Label>
                <Input id="max-file-size" type="number" defaultValue="10" />
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </CardTitle>
              <CardDescription>User registration and verification policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Users must verify their email before accessing the platform
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-approve Verified Testers</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically approve users with certain criteria
                  </p>
                </div>
                <Switch />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-trust-score">Minimum Trust Score for Verification</Label>
                <Input id="min-trust-score" type="number" defaultValue="50" />
              </div>
            </CardContent>
          </Card>

          {/* Content Moderation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Content Moderation
              </CardTitle>
              <CardDescription>Content approval and moderation settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-moderate Reviews</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically flag potentially inappropriate content
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Admin Approval for Tools</Label>
                  <p className="text-sm text-muted-foreground">
                    All tool submissions must be reviewed by admins
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moderation-delay">Moderation Delay (hours)</Label>
                <Input id="moderation-delay" type="number" defaultValue="24" />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
              <CardDescription>Admin notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>New User Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when new users join
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Pending Verifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified of pending verification requests
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Tool Submissions</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified of new tool submissions
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button>Save Settings</Button>
        </div>
      </div>
    </RequireRole>
  );
}
