'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  UserPlus, 
  Shield, 
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Building
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  roles: string[];
  status: string;
  joinDate: string;
  lastActive: string;
  trustScore: number;
  averageRating: number;
  totalReviews: number;
  toolsCount: number;
  testsCompleted: number;
  isVerifiedTester: boolean;
  vendorStatus: string;
  badges: string[];
  company: string;
  location: string;
}

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  vendorApproved: number;
}

export default function ManageUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    suspendedUsers: 0,
    vendorApproved: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add User Modal State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'user',
    company: '',
    location: '',
    bio: ''
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedRole !== 'all') params.append('role', selectedRole);
      
      const response = await fetch(`/api/admin/users?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data.users);
      setStats(data.statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedRole]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = async () => {
    if (!newUserData.name || !newUserData.email) {
      setError('Name and email are required');
      return;
    }

    setIsAddingUser(true);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add user');
      }

      // Reset form and close modal
      setNewUserData({
        name: '',
        email: '',
        role: 'user',
        company: '',
        location: '',
        bio: ''
      });
      setIsAddUserModalOpen(false);
      
      // Refresh users list
      await fetchUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add user');
    } finally {
      setIsAddingUser(false);
    }
  };

  const resetAddUserForm = () => {
    setNewUserData({
      name: '',
      email: '',
      role: 'user',
      company: '',
      location: '',
      bio: ''
    });
    setError(null);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'suspended':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      super_admin: 'destructive',
      admin: 'destructive',
      verified_tester: 'secondary',
      vendor: 'outline',
      user: 'outline'
    } as const;

    return (
      <Badge variant={variants[role as keyof typeof variants] || 'outline'}>
        {role.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading users...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={fetchUsers} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Manage Users</h2>
          <p className="text-muted-foreground">
            View and manage all platform users
          </p>
        </div>
        <Dialog open={isAddUserModalOpen} onOpenChange={setIsAddUserModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetAddUserForm}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account. Fill in the required information below.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name *
                </Label>
                <Input
                  id="name"
                  value={newUserData.name}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, name: e.target.value }))}
                  className="col-span-3"
                  placeholder="Enter full name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, email: e.target.value }))}
                  className="col-span-3"
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select value={newUserData.role} onValueChange={(value) => setNewUserData(prev => ({ ...prev, role: value }))}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="verified_tester">Verified Tester</SelectItem>
                    <SelectItem value="vendor">Vendor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="company" className="text-right">
                  Company
                </Label>
                <Input
                  id="company"
                  value={newUserData.company}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, company: e.target.value }))}
                  className="col-span-3"
                  placeholder="Enter company name"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  value={newUserData.location}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, location: e.target.value }))}
                  className="col-span-3"
                  placeholder="Enter location"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="bio" className="text-right">
                  Bio
                </Label>
                <Input
                  id="bio"
                  value={newUserData.bio}
                  onChange={(e) => setNewUserData(prev => ({ ...prev, bio: e.target.value }))}
                  className="col-span-3"
                  placeholder="Enter bio"
                />
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddUserModalOpen(false)}
                disabled={isAddingUser}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleAddUser}
                disabled={isAddingUser || !newUserData.name || !newUserData.email}
              >
                {isAddingUser ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* User Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers?.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground">All registered users</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Verified Testers</p>
                <p className="text-2xl font-bold">{stats.activeUsers?.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground">Approved testers</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tester Applications</p>
                <p className="text-2xl font-bold">{stats.pendingUsers?.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground">Pending verification</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved Vendors</p>
                <p className="text-2xl font-bold">{stats.vendorApproved?.toLocaleString() || '0'}</p>
                <p className="text-xs text-muted-foreground">Vendor accounts</p>
              </div>
              <Building className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>
            Manage individual user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{user.name || 'Unknown User'}</h3>
                      {getStatusIcon(user.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {getRoleBadge(user.role)}
                      <span className="text-xs text-muted-foreground">
                        Trust Score: {user.trustScore}
                      </span>
                      {user.averageRating > 0 && (
                        <span className="text-xs text-muted-foreground">
                          Rating: {user.averageRating}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right text-sm text-muted-foreground">
                    <p>Joined: {user.joinDate}</p>
                    <p>Last active: {user.lastActive}</p>
                    <p>Reviews: {user.totalReviews} | Tools: {user.toolsCount}</p>
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
