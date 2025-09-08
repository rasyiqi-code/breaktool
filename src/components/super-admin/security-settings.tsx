'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Lock, 
  AlertTriangle,
  CheckCircle,
  Key,
  User,
  Globe,
  RefreshCw
} from 'lucide-react';

interface SecuritySettings {
  twoFactorAuth: boolean;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSymbols: boolean;
    maxAge: number;
  };
  sessionSecurity: {
    timeout: number;
    maxConcurrent: number;
    requireReauth: boolean;
  };
  ipWhitelist: string[];
  rateLimiting: {
    enabled: boolean;
    maxAttempts: number;
    lockoutDuration: number;
  };
  encryption: {
    dataAtRest: boolean;
    dataInTransit: boolean;
    keyRotation: number;
  };
  auditLogging: boolean;
  securityHeaders: boolean;
  corsEnabled: boolean;
  corsOrigins: string[];
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'login' | 'failed_login' | 'password_change' | 'permission_change' | 'suspicious_activity';
  user: string;
  ip: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export function SecuritySettings() {
  const [settings, setSettings] = useState<SecuritySettings>({
    twoFactorAuth: true,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSymbols: true,
      maxAge: 90
    },
    sessionSecurity: {
      timeout: 24,
      maxConcurrent: 3,
      requireReauth: true
    },
    ipWhitelist: ['192.168.1.0/24', '10.0.0.0/8'],
    rateLimiting: {
      enabled: true,
      maxAttempts: 5,
      lockoutDuration: 15
    },
    encryption: {
      dataAtRest: true,
      dataInTransit: true,
      keyRotation: 30
    },
    auditLogging: true,
    securityHeaders: true,
    corsEnabled: true,
    corsOrigins: ['https://breaktool.com', 'https://admin.breaktool.com']
  });

  const [events] = useState<SecurityEvent[]>([
    {
      id: '1',
      timestamp: '2024-01-15 14:30:15',
      type: 'failed_login',
      user: 'admin@example.com',
      ip: '192.168.1.100',
      details: 'Multiple failed login attempts',
      severity: 'high'
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:25:30',
      type: 'login',
      user: 'team.breaktool@gmail.com',
      ip: '192.168.1.50',
      details: 'Successful login from admin panel',
      severity: 'low'
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:20:45',
      type: 'password_change',
      user: 'user@example.com',
      ip: '10.0.0.15',
      details: 'Password changed successfully',
      severity: 'medium'
    },
    {
      id: '4',
      timestamp: '2024-01-15 14:15:20',
      type: 'suspicious_activity',
      user: 'unknown',
      ip: '203.0.113.1',
      details: 'Unusual API access pattern detected',
      severity: 'critical'
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showIpWhitelist, setShowIpWhitelist] = useState(false);
  const [newIp, setNewIp] = useState('');

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Error saving security settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addIpToWhitelist = () => {
    if (newIp.trim()) {
      setSettings(prev => ({
        ...prev,
        ipWhitelist: [...prev.ipWhitelist, newIp.trim()]
      }));
      setNewIp('');
    }
  };

  const removeIpFromWhitelist = (ip: string) => {
    setSettings(prev => ({
      ...prev,
      ipWhitelist: prev.ipWhitelist.filter(i => i !== ip)
    }));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge variant="destructive" className="bg-orange-100 text-orange-800">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge variant="default" className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Security Settings
          </h2>
          <p className="text-muted-foreground">
            Configure platform security policies and access controls
          </p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Shield className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {saved && (
        <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <span className="text-green-600">Security settings saved successfully!</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Authentication Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Authentication Security
            </CardTitle>
            <CardDescription>
              Configure user authentication and access policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require 2FA for all admin accounts
                </p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
              />
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Password Policy</h4>
              <div className="space-y-2">
                <div className="space-y-2">
                  <Label htmlFor="minLength">Minimum Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    value={settings.passwordPolicy.minLength}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, minLength: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require Uppercase</Label>
                  <Switch
                    checked={settings.passwordPolicy.requireUppercase}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, requireUppercase: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require Lowercase</Label>
                  <Switch
                    checked={settings.passwordPolicy.requireLowercase}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, requireLowercase: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require Numbers</Label>
                  <Switch
                    checked={settings.passwordPolicy.requireNumbers}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, requireNumbers: checked }
                    }))}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Require Symbols</Label>
                  <Switch
                    checked={settings.passwordPolicy.requireSymbols}
                    onCheckedChange={(checked) => setSettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, requireSymbols: checked }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxAge">Password Max Age (days)</Label>
                  <Input
                    id="maxAge"
                    type="number"
                    value={settings.passwordPolicy.maxAge}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      passwordPolicy: { ...prev.passwordPolicy, maxAge: parseInt(e.target.value) }
                    }))}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Session Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Session Security
            </CardTitle>
            <CardDescription>
              Manage user session security and timeouts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
              <Input
                id="sessionTimeout"
                type="number"
                value={settings.sessionSecurity.timeout}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  sessionSecurity: { ...prev.sessionSecurity, timeout: parseInt(e.target.value) }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxConcurrent">Max Concurrent Sessions</Label>
              <Input
                id="maxConcurrent"
                type="number"
                value={settings.sessionSecurity.maxConcurrent}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  sessionSecurity: { ...prev.sessionSecurity, maxConcurrent: parseInt(e.target.value) }
                }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Re-authentication</Label>
                <p className="text-sm text-muted-foreground">
                  Require password confirmation for sensitive operations
                </p>
              </div>
              <Switch
                checked={settings.sessionSecurity.requireReauth}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  sessionSecurity: { ...prev.sessionSecurity, requireReauth: checked }
                }))}
              />
            </div>
          </CardContent>
        </Card>

        {/* IP Whitelist */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              IP Whitelist
            </CardTitle>
            <CardDescription>
              Restrict access to specific IP addresses or ranges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable IP Whitelist</Label>
                <p className="text-sm text-muted-foreground">
                  Restrict admin access to whitelisted IPs only
                </p>
              </div>
              <Switch
                checked={showIpWhitelist}
                onCheckedChange={setShowIpWhitelist}
              />
            </div>
            
            {showIpWhitelist && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="192.168.1.0/24 or 10.0.0.1"
                    value={newIp}
                    onChange={(e) => setNewIp(e.target.value)}
                  />
                  <Button onClick={addIpToWhitelist} size="sm">
                    Add
                  </Button>
                </div>
                <div className="space-y-2">
                  {settings.ipWhitelist.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <code className="text-sm">{ip}</code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeIpFromWhitelist(ip)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Rate Limiting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Rate Limiting
            </CardTitle>
            <CardDescription>
              Configure login attempt limits and lockout policies
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Rate Limiting</Label>
                <p className="text-sm text-muted-foreground">
                  Limit failed login attempts
                </p>
              </div>
              <Switch
                checked={settings.rateLimiting.enabled}
                onCheckedChange={(checked) => setSettings(prev => ({
                  ...prev,
                  rateLimiting: { ...prev.rateLimiting, enabled: checked }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxAttempts">Max Failed Attempts</Label>
              <Input
                id="maxAttempts"
                type="number"
                value={settings.rateLimiting.maxAttempts}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  rateLimiting: { ...prev.rateLimiting, maxAttempts: parseInt(e.target.value) }
                }))}
                disabled={!settings.rateLimiting.enabled}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
              <Input
                id="lockoutDuration"
                type="number"
                value={settings.rateLimiting.lockoutDuration}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  rateLimiting: { ...prev.rateLimiting, lockoutDuration: parseInt(e.target.value) }
                }))}
                disabled={!settings.rateLimiting.enabled}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Events */}
      <Card>
        <CardHeader>
          <CardTitle>Security Events</CardTitle>
          <CardDescription>
            Recent security-related events and alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events.map((event) => (
              <div key={event.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getSeverityIcon(event.severity)}
                    <span className="text-xs text-muted-foreground">{event.timestamp}</span>
                  </div>
                  {getSeverityBadge(event.severity)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">{event.details}</p>
                  <div className="text-xs text-muted-foreground">
                    <span>User: {event.user}</span> • <span>IP: {event.ip}</span> • <span>Type: {event.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
