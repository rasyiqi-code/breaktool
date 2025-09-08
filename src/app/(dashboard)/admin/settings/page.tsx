'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RequireRole } from '@/components/auth/require-role';
import { Settings, Shield, Users, Bell, Save, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PlatformSettings {
  platformName: string;
  contactEmail: string;
  maxFileSize: number;
  requireEmailVerification: boolean;
  autoApproveVerifiedTesters: boolean;
  minTrustScore: number;
  autoModerateReviews: boolean;
  requireAdminApprovalForTools: boolean;
  moderationDelay: number;
  notifyNewUsers: boolean;
  notifyPendingVerifications: boolean;
  notifyToolSubmissions: boolean;
}

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<PlatformSettings>({
    platformName: 'BreakTool',
    contactEmail: 'admin@breaktool.com',
    maxFileSize: 10,
    requireEmailVerification: true,
    autoApproveVerifiedTesters: false,
    minTrustScore: 50,
    autoModerateReviews: true,
    requireAdminApprovalForTools: true,
    moderationDelay: 24,
    notifyNewUsers: true,
    notifyPendingVerifications: true,
    notifyToolSubmissions: true
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Settings saved successfully",
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof PlatformSettings, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <RequireRole requiredRoles={['admin', 'super_admin']}>
      <div className="w-full max-w-full px-2 sm:px-4 lg:px-6 pt-16 overflow-x-hidden">
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Platform Settings</h1>
              <p className="text-muted-foreground text-sm sm:text-base">Configure platform behavior and policies</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={loadSettings}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button 
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Settings className="h-4 w-4 sm:h-5 sm:w-5" />
                General Settings
              </CardTitle>
              <CardDescription className="text-sm">Basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platform-name" className="text-sm font-medium">Platform Name</Label>
                <Input 
                  id="platform-name" 
                  value={settings.platformName}
                  onChange={(e) => handleInputChange('platformName', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact-email" className="text-sm font-medium">Contact Email</Label>
                <Input 
                  id="contact-email" 
                  type="email" 
                  value={settings.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-file-size" className="text-sm font-medium">Max File Size (MB)</Label>
                <Input 
                  id="max-file-size" 
                  type="number" 
                  value={settings.maxFileSize}
                  onChange={(e) => handleInputChange('maxFileSize', parseInt(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                User Management
              </CardTitle>
              <CardDescription className="text-sm">User registration and verification policies</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-sm font-medium">Require Email Verification</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Users must verify their email before accessing the platform
                  </p>
                </div>
                <Switch 
                  checked={settings.requireEmailVerification}
                  onCheckedChange={(checked) => handleInputChange('requireEmailVerification', checked)}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-sm font-medium">Auto-approve Verified Testers</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Automatically approve users with certain criteria
                  </p>
                </div>
                <Switch 
                  checked={settings.autoApproveVerifiedTesters}
                  onCheckedChange={(checked) => handleInputChange('autoApproveVerifiedTesters', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="min-trust-score" className="text-sm font-medium">Minimum Trust Score for Verification</Label>
                <Input 
                  id="min-trust-score" 
                  type="number" 
                  value={settings.minTrustScore}
                  onChange={(e) => handleInputChange('minTrustScore', parseInt(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Content Moderation */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Shield className="h-4 w-4 sm:h-5 sm:w-5" />
                Content Moderation
              </CardTitle>
              <CardDescription className="text-sm">Content approval and moderation settings</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-sm font-medium">Auto-moderate Reviews</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Automatically flag potentially inappropriate content
                  </p>
                </div>
                <Switch 
                  checked={settings.autoModerateReviews}
                  onCheckedChange={(checked) => handleInputChange('autoModerateReviews', checked)}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-sm font-medium">Require Admin Approval for Tools</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    All tool submissions must be reviewed by admins
                  </p>
                </div>
                <Switch 
                  checked={settings.requireAdminApprovalForTools}
                  onCheckedChange={(checked) => handleInputChange('requireAdminApprovalForTools', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="moderation-delay" className="text-sm font-medium">Moderation Delay (hours)</Label>
                <Input 
                  id="moderation-delay" 
                  type="number" 
                  value={settings.moderationDelay}
                  onChange={(e) => handleInputChange('moderationDelay', parseInt(e.target.value) || 0)}
                  className="w-full"
                />
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="p-3 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
                Notifications
              </CardTitle>
              <CardDescription className="text-sm">Admin notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="p-3 sm:p-6 pt-0 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-sm font-medium">New User Registrations</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Get notified when new users join
                  </p>
                </div>
                <Switch 
                  checked={settings.notifyNewUsers}
                  onCheckedChange={(checked) => handleInputChange('notifyNewUsers', checked)}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-sm font-medium">Pending Verifications</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Get notified of pending verification requests
                  </p>
                </div>
                <Switch 
                  checked={settings.notifyPendingVerifications}
                  onCheckedChange={(checked) => handleInputChange('notifyPendingVerifications', checked)}
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-sm font-medium">Tool Submissions</Label>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Get notified of new tool submissions
                  </p>
                </div>
                <Switch 
                  checked={settings.notifyToolSubmissions}
                  onCheckedChange={(checked) => handleInputChange('notifyToolSubmissions', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </RequireRole>
  );
}
