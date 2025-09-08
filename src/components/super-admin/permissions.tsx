'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Key, 
  XCircle,
  Plus,
  Edit,
  Loader2
} from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  description: string;
}

interface PermissionCategory {
  description: string;
  permissions: Permission[];
}

interface RolePermission {
  name: string;
  description: string;
  permissions: string[];
}

interface RoleUsageStats {
  [key: string]: number;
}

export default function Permissions() {
  const [permissionCategories, setPermissionCategories] = useState<Record<string, PermissionCategory>>({});
  const [rolePermissions, setRolePermissions] = useState<Record<string, RolePermission>>({});
  const [, setRoleUsageStats] = useState<RoleUsageStats>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/permissions');
      
      if (!response.ok) {
        throw new Error('Failed to fetch permissions');
      }
      
      const data = await response.json();
      setPermissionCategories(data.permissionCategories);
      setRolePermissions(data.rolePermissions);
      setRoleUsageStats(data.roleUsageStats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading permissions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={fetchPermissions} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Real implementation - data fetched from API


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Permissions</h2>
          <p className="text-muted-foreground">
            Manage system permissions and access control
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Permission
        </Button>
      </div>

      {/* Permission Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        {Object.entries(permissionCategories).map(([categoryName, category]) => (
          <Card key={categoryName}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-blue-500">
                  <Key className="h-6 w-6" />
                </div>
                <Badge variant="outline">
                  {category.permissions.length}
                </Badge>
              </div>
              <h3 className="font-medium mb-1">{categoryName}</h3>
              <p className="text-sm text-muted-foreground">
                {category.permissions.length} permissions
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Role-Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle>Role-Permission Matrix</CardTitle>
          <CardDescription>
            View which roles have access to which permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Permission</th>
                  {Object.entries(rolePermissions).map(([roleId, role]) => (
                    <th key={roleId} className="text-center p-2">
                      <div className="flex flex-col items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-xs">{role.name}</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(permissionCategories).flatMap(([, category]) =>
                  category.permissions.map((permission) => (
                  <tr key={permission.id} className="border-b">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div className="text-blue-500">
                          <Key className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="font-medium">{permission.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {permission.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    {Object.entries(rolePermissions).map(([roleId, role]) => (
                      <td key={roleId} className="text-center p-2">
                        <div className={`w-4 h-4 rounded-full mx-auto ${
                          role.permissions.includes(permission.id) 
                            ? 'bg-green-500' 
                            : 'bg-gray-200'
                        }`}></div>
                      </td>
                    ))}
                  </tr>
                ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Permissions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Permissions by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Permissions by Category</CardTitle>
            <CardDescription>
              Manage permissions organized by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(permissionCategories).map(([categoryName, category]) => {
                
                return (
                  <div key={categoryName}>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="text-blue-500">
                        <Key className="h-4 w-4" />
                      </div>
                      <h4 className="font-medium">{categoryName}</h4>
                      <Badge variant="outline">
                        {category.permissions.length} permissions
                      </Badge>
                    </div>
                    <div className="space-y-2 ml-6">
                      {category.permissions.map((permission) => (
                        <div key={permission.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <div className="font-medium text-sm">{permission.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {permission.description}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="default" className="text-xs">
                              Active
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Permission Details */}
        <Card>
          <CardHeader>
            <CardTitle>Permission Details</CardTitle>
            <CardDescription>
              View detailed information about permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(permissionCategories).slice(0, 4).flatMap(([, category]) =>
                category.permissions.slice(0, 1).map((permission) => (
                <div key={permission.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="text-blue-500">
                        <Key className="h-4 w-4" />
                      </div>
                      <h4 className="font-medium">{permission.name}</h4>
                    </div>
                    <Badge variant="default">
                      Active
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {permission.description}
                  </p>
                  <div>
                    <h5 className="text-sm font-medium mb-2">Assigned Roles:</h5>
                    <div className="flex gap-1 flex-wrap">
                      {Object.entries(rolePermissions)
                        .filter(([, role]) => role.permissions.includes(permission.id))
                        .map(([roleId, role]) => (
                          <Badge key={roleId} variant="outline" className="text-xs">
                            {role.name}
                          </Badge>
                        ))}
                    </div>
                  </div>
                </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
