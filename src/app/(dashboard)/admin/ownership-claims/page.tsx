'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RequireRole } from '@/components/auth/require-role';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Building,
  User,
  Phone,
  Globe,
  ExternalLink
} from 'lucide-react';
import Image from 'next/image';

interface OwnershipClaim {
  id: string;
  tool: {
    id: string;
    name: string;
    website: string | null;
    logoUrl: string | null;
  };
  vendor: {
    id: string;
    name: string | null;
    email: string;
    company: string | null;
  };
  claimType: string;
  companyName: string | null;
  contactEmail: string;
  contactPhone: string | null;
  website: string | null;
  businessRegistration: string | null;
  proofOfOwnership: string | null;
  additionalInfo: string | null;
  status: string;
  createdAt: string;
  reviewedAt: string | null;
  reviewNotes: string | null;
  reviewer: {
    id: string;
    name: string | null;
    email: string;
  } | null;
}

export default function OwnershipClaimsPage() {
  const [claims, setClaims] = useState<OwnershipClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClaim, setSelectedClaim] = useState<OwnershipClaim | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchClaims = useCallback(async () => {
    try {
      setLoading(true);
      const url = statusFilter === 'all' 
        ? '/api/admin/ownership-claims' 
        : `/api/admin/ownership-claims?status=${statusFilter}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setClaims(data.claims || []);
        setError(null);
      } else {
        const errorText = await response.text();
        console.error('Failed to load claims:', errorText);
        
        if (response.status === 401) {
          setError('Please log in to access this page');
        } else if (response.status === 403) {
          setError('Admin access required. Please contact super admin to get admin permissions.');
        } else {
          setError('Failed to fetch ownership claims. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      setError('Failed to fetch ownership claims');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleReviewClaim = (claim: OwnershipClaim) => {
    setSelectedClaim(claim);
    setReviewNotes('');
    setReviewStatus('approved');
    setShowReviewModal(true);
    setError(null);
    setSuccess(null);
  };

  const handleSubmitReview = async () => {
    if (!selectedClaim) return;

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch(`/api/admin/ownership-claims/${selectedClaim.id}/review`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: reviewStatus,
          reviewNotes
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Ownership claim ${reviewStatus} successfully!`);
        setShowReviewModal(false);
        setSelectedClaim(null);
        setReviewNotes('');
        // Refresh claims
        await fetchClaims();
      } else {
        setError(data.error || 'Failed to review claim');
      }
    } catch (error) {
      console.error('Error reviewing claim:', error);
      setError('Failed to review claim');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'rejected':
        return <Badge variant="secondary" className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getClaimTypeLabel = (type: string) => {
    switch (type) {
      case 'owner':
        return 'Owner';
      case 'representative':
        return 'Representative';
      case 'affiliate':
        return 'Affiliate';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading ownership claims...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <RequireRole requiredRoles={['admin', 'super_admin']}>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground dark:text-white">Ownership Claims</h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-2">
            Review and manage tool ownership claims from vendors
          </p>
        </div>

        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Filter */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Claims</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Claims List */}
        <Card>
          <CardHeader>
            <CardTitle>Ownership Claims ({claims.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {claims.length === 0 ? (
              <div className="text-center py-8">
                <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No ownership claims</h3>
                <p className="text-muted-foreground">
                  No ownership claims have been submitted yet. Claims will appear here when vendors submit them.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {claims.map((claim) => (
                  <div key={claim.id} className="border rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        {claim.tool.logoUrl && (
                          <Image
                            src={claim.tool.logoUrl}
                            alt={claim.tool.name}
                            width={60}
                            height={60}
                            className="rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="text-xl font-semibold">{claim.tool.name}</h3>
                            {getStatusBadge(claim.status)}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-2">Claim Details</h4>
                              <div className="space-y-1 text-sm">
                                <p><span className="font-medium">Type:</span> {getClaimTypeLabel(claim.claimType)}</p>
                                <p><span className="font-medium">Company:</span> {claim.companyName || 'Not provided'}</p>
                                <p><span className="font-medium">Submitted:</span> {new Date(claim.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="font-medium text-sm text-muted-foreground mb-2">Vendor Information</h4>
                              <div className="space-y-1 text-sm">
                                <p className="flex items-center">
                                  <User className="w-3 h-3 mr-1" />
                                  {claim.vendor.name || 'No name'} ({claim.vendor.email})
                                </p>
                                {claim.contactPhone && (
                                  <p className="flex items-center">
                                    <Phone className="w-3 h-3 mr-1" />
                                    {claim.contactPhone}
                                  </p>
                                )}
                                {claim.website && (
                                  <p className="flex items-center">
                                    <Globe className="w-3 h-3 mr-1" />
                                    <a href={claim.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                                      {claim.website}
                                    </a>
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {claim.proofOfOwnership && (
                            <div className="mb-4">
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">Proof of Ownership</h4>
                              <a 
                                href={claim.proofOfOwnership} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                View Proof Document
                              </a>
                            </div>
                          )}

                          {claim.additionalInfo && (
                            <div className="mb-4">
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">Additional Information</h4>
                              <p className="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded">
                                {claim.additionalInfo}
                              </p>
                            </div>
                          )}

                          {claim.reviewNotes && (
                            <div className="mb-4">
                              <h4 className="font-medium text-sm text-muted-foreground mb-1">Review Notes</h4>
                              <p className="text-sm bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                                {claim.reviewNotes}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        {claim.status === 'pending' ? (
                          <Button onClick={() => handleReviewClaim(claim)}>
                            Review Claim
                          </Button>
                        ) : (
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Reviewed by: {claim.reviewer?.name || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {claim.reviewedAt && new Date(claim.reviewedAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Review Modal */}
        {showReviewModal && selectedClaim && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl">
              <CardHeader>
                <CardTitle>Review Ownership Claim</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tool: {selectedClaim.tool.name} | Vendor: {selectedClaim.vendor.name || selectedClaim.vendor.email}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="reviewStatus">Decision</Label>
                  <Select value={reviewStatus} onValueChange={(value: 'approved' | 'rejected') => setReviewStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approve</SelectItem>
                      <SelectItem value="rejected">Reject</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="reviewNotes">Review Notes</Label>
                  <Textarea
                    id="reviewNotes"
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    rows={4}
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setShowReviewModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting}
                    variant={reviewStatus === 'approved' ? 'default' : 'destructive'}
                  >
                    {submitting ? 'Processing...' : `${reviewStatus === 'approved' ? 'Approve' : 'Reject'} Claim`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </RequireRole>
  );
}
