'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Shield, 
  FileText,
  Eye,
  Check,
  X,
  Loader2
} from 'lucide-react';

interface Verification {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string | null;
  userTrustScore: number;
  userJoinDate: string;
  expertiseAreas: string[];
  company: string | null;
  jobTitle: string | null;
  linkedinUrl: string | null;
  websiteUrl: string | null;
  portfolioUrl: string | null;
  motivation: string | null;
  experienceYears: number | null;
  previousReviews: string | null;
  status: string;
  reviewedBy: string | null;
  reviewedAt: string | null;
  reviewNotes: string | null;
  submittedAt: string;
  updatedAt: string;
  // Add missing properties for compatibility
  type: string;
  user: {
    name: string;
    email: string;
    joinDate: string;
  };
  experience: string;
  reason: string;
  documents: string[];
}

interface VerificationStats {
  totalVerifications: number;
  pendingVerifications: number;
  approvedVerifications: number;
  rejectedVerifications: number;
}

export default function Verifications() {
  const [activeTab, setActiveTab] = useState('pending');
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [stats, setStats] = useState<VerificationStats>({
    totalVerifications: 0,
    pendingVerifications: 0,
    approvedVerifications: 0,
    rejectedVerifications: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm] = useState('');

  const fetchVerifications = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== 'all') params.append('status', activeTab);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/admin/verifications?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch verifications');
      }
      
      const data = await response.json();
      setVerifications(data.verifications);
      setStats(data.statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchTerm]);

  useEffect(() => {
    fetchVerifications();
  }, [fetchVerifications]);

  // const handleVerificationAction = async (verificationId: string, action: 'approved' | 'rejected', reviewNotes?: string) => {
  //   try {
  //     const response = await fetch('/api/admin/verifications', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         verificationId,
  //         action,
  //         reviewNotes
  //       }),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to update verification');
  //     }

  //     // Refresh the data
  //     await fetchVerifications();
  //   } catch (err) {
  //     setError(err instanceof Error ? err.message : 'An error occurred');
  //   }
  // };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading verifications...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={fetchVerifications} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Real implementation - data fetched from API

  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'approved':
  //       return <CheckCircle className="h-4 w-4 text-green-500" />;
  //     case 'rejected':
  //       return <XCircle className="h-4 w-4 text-red-500" />;
  //     case 'pending':
  //       return <Clock className="h-4 w-4 text-yellow-500" />;
  //     default:
  //       return <Clock className="h-4 w-4 text-gray-500" />;
  //   }
  // };

  const getStatusBadge = (status: string) => {
    const variants = {
      approved: 'default',
      rejected: 'destructive',
      pending: 'secondary'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'tester_verification':
        return <Shield className="h-4 w-4 text-blue-500" />;
      case 'vendor_verification':
        return <User className="h-4 w-4 text-green-500" />;
      default:
        return <User className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleApprove = (id: string) => {
    console.log('Approving verification:', id);
    // Handle approval logic
  };

  const handleReject = (id: string) => {
    console.log('Rejecting verification:', id);
    // Handle rejection logic
  };

  // Real implementation - data fetched from API
  const pendingRequests = verifications?.filter(req => req.status === 'pending') || [];
  const approvedRequests = verifications?.filter(req => req.status === 'approved') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Verifications</h2>
          <p className="text-muted-foreground">
            Manage user verification requests
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline">
            {pendingRequests.length} Pending
          </Badge>
          <Badge variant="outline">
            {approvedRequests.length} Approved
          </Badge>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Requests</p>
                <p className="text-2xl font-bold">{stats.totalVerifications.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingVerifications.toLocaleString()}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{stats.approvedVerifications.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejectedVerifications.toLocaleString()}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Verification Requests */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({stats.pendingVerifications})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({stats.approvedVerifications})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({stats.rejectedVerifications})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {verifications.filter(v => v.status === 'pending').map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(request.type)}
                    <div>
                      <CardTitle className="text-lg">{request.user.name}</CardTitle>
                      <CardDescription>{request.user.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    <Badge variant="outline">
                      {request.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Experience & Background</h4>
                    <p className="text-sm text-muted-foreground">{request.experience}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Reason for Verification</h4>
                    <p className="text-sm text-muted-foreground">{request.reason}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Submitted Documents</h4>
                    <div className="flex gap-2">
                        {request.documents.map((doc: string, index: number) => (
                        <Badge key={index} variant="outline" className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {doc}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-sm text-muted-foreground">
                      <p>Submitted: {request.submittedAt}</p>
                      <p>User since: {request.user.joinDate}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleReject(request.id)}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleApprove(request.id)}
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {verifications.filter(v => v.status === 'approved').map((request) => (
            <Card key={request.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getTypeIcon(request.type)}
                    <div>
                      <CardTitle className="text-lg">{request.user.name}</CardTitle>
                      <CardDescription>{request.user.email}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    <Badge variant="outline">
                      {request.type.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    <strong>Experience:</strong> {request.experience}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <strong>Submitted:</strong> {request.submittedAt}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {verifications.filter(v => v.status === 'rejected').length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <XCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Rejected Requests</h3>
                <p className="text-muted-foreground">
                  All verification requests have been processed
                </p>
              </CardContent>
            </Card>
          ) : (
            verifications.filter(v => v.status === 'rejected').map((request) => (
              <Card key={request.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{request.userName}</h3>
                        <p className="text-sm text-muted-foreground">{request.userEmail}</p>
                      </div>
                    </div>
                    <Badge variant="destructive">Rejected</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><strong>Company:</strong> {request.company || 'N/A'}</p>
                    <p><strong>Job Title:</strong> {request.jobTitle || 'N/A'}</p>
                    <p><strong>Experience:</strong> {request.experienceYears || 'N/A'} years</p>
                    <p><strong>Submitted:</strong> {request.submittedAt}</p>
                    {request.reviewNotes && (
                      <p><strong>Review Notes:</strong> {request.reviewNotes}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
