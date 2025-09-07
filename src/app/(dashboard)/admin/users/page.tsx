'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { 
  Search, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Shield,
  Star,
  MessageSquare,
  Award,
  Users,
  Mail,
  Calendar,
  MapPin,
  Building
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'verified_tester' | 'vendor';
  is_verified_tester: boolean;
  verification_status: 'pending' | 'approved' | 'rejected' | null;
  trust_score: number;
  total_reviews: number;
  helpful_votes_received: number;
  badges: string[];
  expertise_areas: string[];
  company: string;
  location: string;
  bio: string;
  created_at: string;
  verification_date: string | null;
  verification_proof: string | null;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [reviewNotes, setReviewNotes] = useState<{ [key: string]: string }>({});
  const [showReviewInput, setShowReviewInput] = useState<{ [key: string]: boolean }>({});

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = useCallback(() => {
    let filtered = users;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Verification filter
    if (verificationFilter !== 'all') {
      filtered = filtered.filter(user => user.verification_status === verificationFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter, verificationFilter]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [filterUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        // Update local state
        setUsers(users.map(user =>
          user.id === userId
            ? { ...user, role: newRole as 'user' | 'verified_tester' | 'vendor' }
            : user
        ));
      }
    } catch (error) {
      console.error('Error updating user role:', error);
    }
  };

  const handleVerificationChange = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/verification`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verification_status: newStatus }),
      });

      if (response.ok) {
        // Update local state
        setUsers(users.map(user =>
          user.id === userId
            ? { 
                ...user, 
                verification_status: newStatus as 'pending' | 'approved' | 'rejected' | null,
                is_verified_tester: newStatus === 'approved',
                verification_date: newStatus === 'approved' ? new Date().toISOString() : user.verification_date,
                role: newStatus === 'approved' ? 'verified_tester' as const : 'user' as const
              }
            : user
        ));
      }
    } catch (error) {
      console.error('Error updating verification status:', error);
    }
  };

  const handleApprove = async (userId: string) => {
    const notes = reviewNotes[userId] || '';
    try {
      const response = await fetch(`/api/admin/users/${userId}/verification`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          verification_status: 'approved',
          review_notes: notes
        }),
      });

      if (response.ok) {
        // Update local state
        setUsers(users.map(user =>
          user.id === userId
            ? { 
                ...user, 
                verification_status: 'approved',
                is_verified_tester: true,
                verification_date: new Date().toISOString(),
                role: 'verified_tester' as const
              }
            : user
        ));
        // Clear review notes and hide input
        setReviewNotes(prev => ({ ...prev, [userId]: '' }));
        setShowReviewInput(prev => ({ ...prev, [userId]: false }));
      }
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleReject = async (userId: string) => {
    const notes = reviewNotes[userId] || '';
    try {
      const response = await fetch(`/api/admin/users/${userId}/verification`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          verification_status: 'rejected',
          review_notes: notes
        }),
      });

      if (response.ok) {
        // Update local state
        setUsers(users.map(user =>
          user.id === userId
            ? { 
                ...user, 
                verification_status: 'rejected',
                is_verified_tester: false,
                verification_date: null,
                role: 'user' as const
              }
            : user
        ));
        // Clear review notes and hide input
        setReviewNotes(prev => ({ ...prev, [userId]: '' }));
        setShowReviewInput(prev => ({ ...prev, [userId]: false }));
      }
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'verified_tester':
        return <Badge variant="secondary" className="text-xs">Verified Tester</Badge>;
      case 'vendor':
        return <Badge variant="destructive" className="text-xs">Vendor</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">User</Badge>;
    }
  };

  const getVerificationBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="text-xs bg-green-100 text-green-800">Approved</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="text-xs">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="text-xs">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Not Applied</Badge>;
    }
  };

  const getUserBadges = (badges: string[]) => {
    if (!badges || badges.length === 0) return null;
    
    return (
      <div className="flex flex-wrap gap-1">
        {badges.map((badge, index) => (
          <Badge key={index} variant="outline" className="text-xs">
            {badge}
          </Badge>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        
        <div className="container mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Loading users...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      
      <div className="container mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-16">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user roles, verification status, and permissions</p>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Shield className="h-4 w-4" />
              <span>
                <strong>Note:</strong> Admin and Super Admin accounts are not displayed in this list as they are system administrators.
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="verified_tester">Verified Tester</SelectItem>
                  <SelectItem value="vendor">Vendor</SelectItem>
                </SelectContent>
              </Select>

              <Select value={verificationFilter} onValueChange={setVerificationFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by verification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setVerificationFilter('all');
              }}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                        <AvatarFallback>
                          {user.name?.slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{user.name || 'Unknown User'}</h3>
                          {getRoleBadge(user.role)}
                          {getVerificationBadge(user.verification_status)}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                          {user.company && (
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4" />
                              <span>{user.company}</span>
                            </div>
                          )}
                          {user.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              <span>{user.location}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4" />
                            <span>{user.trust_score} Trust Score</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>{user.total_reviews} reviews</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Award className="h-4 w-4" />
                            <span>{user.helpful_votes_received} helpful votes</span>
                          </div>
                        </div>

                        {user.bio && (
                          <p className="text-sm text-muted-foreground mb-3">{user.bio}</p>
                        )}

                        {user.expertise_areas && user.expertise_areas.length > 0 && (
                          <div className="mb-3">
                            <p className="text-sm font-medium mb-1">Expertise:</p>
                            <div className="flex flex-wrap gap-1">
                              {user.expertise_areas.map((area, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {getUserBadges(user.badges)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        asChild
                      >
                        <a href={`/profile/${user.id}`}>
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-4 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Role:</span>
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="verified_tester">Verified Tester</SelectItem>
                          <SelectItem value="vendor">Vendor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Verification:</span>
                      <Select
                        value={user.verification_status || ''}
                        onValueChange={(value) => handleVerificationChange(user.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Not applied" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="approved">Approved</SelectItem>
                          <SelectItem value="rejected">Rejected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      {/* Review Notes Input */}
                      {showReviewInput[user.id] && (
                        <div className="flex items-center gap-2">
                          <Input
                            placeholder="Add review notes..."
                            value={reviewNotes[user.id] || ''}
                            onChange={(e) => setReviewNotes(prev => ({ 
                              ...prev, 
                              [user.id]: e.target.value 
                            }))}
                            className="w-48"
                          />
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowReviewInput(prev => ({ 
                              ...prev, 
                              [user.id]: false 
                            }))}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setShowReviewInput(prev => ({ 
                          ...prev, 
                          [user.id]: !prev[user.id] 
                        }))}
                        disabled={user.verification_status === 'approved' || user.verification_status === 'rejected'}
                      >
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Notes
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleApprove(user.id)}
                        disabled={user.verification_status === 'approved'}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(user.id)}
                        disabled={user.verification_status === 'rejected'}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No users found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || roleFilter !== 'all' || verificationFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'No users have registered yet'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
