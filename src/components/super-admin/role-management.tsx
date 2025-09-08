'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Shield, 
  Users, 
  Settings, 
  Database, 
  Globe, 
  Activity,
  CheckCircle,
  XCircle,
  Plus,
  Edit,
  Trash2,
  Loader2
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isActive: boolean;
}

interface RoleAssignment {
  id: string;
  userId: string;
  role: string;
  isActive: boolean;
  grantedAt: string;
  grantedBy: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string;
  };
}

interface PermissionCategories {
  [key: string]: string[];
}

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [, setRoleAssignments] = useState<RoleAssignment[]>([]);
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategories>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/roles');
      
      if (!response.ok) {
        throw new Error('Failed to fetch roles');
      }
      
      const data = await response.json();
      setRoles(data.roles);
      setRoleAssignments(data.roleAssignments);
      setPermissionCategories(data.permissionCategories);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading roles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={fetchRoles} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const getPermissionIcon = (permission: string) => {
    const icons = {
      all: <Shield className="h-4 w-4" />,
      user_management: <Users className="h-4 w-4" />,
      system_settings: <Settings className="h-4 w-4" />,
      database_management: <Database className="h-4 w-4" />,
      api_management: <Globe className="h-4 w-4" />,
      analytics: <Activity className="h-4 w-4" />,
      testing: <CheckCircle className="h-4 w-4" />,
      content_moderation: <Edit className="h-4 w-4" />
    };
    return icons[permission as keyof typeof icons] || <Shield className="h-4 w-4" />;
  };

  const toggleRoleStatus = (roleId: string) => {
    setRoles(roles.map(role => 
      role.id === roleId ? { ...role, isActive: !role.isActive } : role
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Role Management</h2>
          <p className="text-muted-foreground">
            Manage user roles and permissions
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Role
        </Button>
      </div>

      {/* Role Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        {roles.map((role) => (
          <Card key={role.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="font-medium">{role.name}</span>
                </div>
                <Switch
                  checked={role.isActive}
                  onCheckedChange={() => toggleRoleStatus(role.id)}
                />
              </div>
              <p className="text-sm text-muted-foreground mb-2">
                {role.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {role.permissions.length} permissions
                </span>
                <Badge variant="outline">
                  {role.userCount} users
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detailed Role Management */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Roles List */}
        <Card>
          <CardHeader>
            <CardTitle>Roles Overview</CardTitle>
            <CardDescription>
              Manage existing roles and their settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">{role.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {role.userCount} users • {role.permissions.length} permissions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={role.isActive ? "default" : "secondary"}>
                      {role.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Permissions Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions Matrix</CardTitle>
            <CardDescription>
              View and manage role permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(permissionCategories).map(([category, permissions]) => (
                <div key={category}>
                  <h4 className="font-medium mb-2">{category}</h4>
                  <div className="grid gap-2">
                    {permissions.map((permission) => (
                      <div key={permission} className="flex items-center gap-2 p-2 border rounded">
                        {getPermissionIcon(permission)}
                        <span className="text-sm flex-1">
                          {permission.replace('_', ' ').toUpperCase()}
                        </span>
                        <div className="flex gap-1">
                          {roles.slice(0, 3).map((role) => (
                            <div
                              key={role.id}
                              className={`w-3 h-3 rounded-full ${
                                role.permissions.includes(permission) || role.permissions.includes('all')
                                  ? 'bg-green-500'
                                  : 'bg-gray-200'
                              }`}
                              title={role.name}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
