'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ReportApprovalCard } from '@/components/admin/report-approval-card';
import { useRoleCheck } from '@/hooks/use-role-check';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText,
  RefreshCw
} from 'lucide-react';

interface TestingReport {
  id: string;
  title: string;
  summary: string;
  detailedAnalysis: string;
  overallScore: number;
  valueScore: number;
  usageScore: number;
  integrationScore: number;
  pros: string[];
  cons: string[];
  recommendations: string;
  useCases: string[];
  setupTime: string;
  learningCurve: string;
  supportQuality: string;
  verdict: string;
  status: string;
  createdAt: string;
  task: {
    id: string;
    title: string;
    description: string;
    priority: string;
    deadline: string;
    reward: number;
    status: string;
  };
  tool: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    category?: {
      name: string;
    };
  };
  tester: {
    id: string;
    name: string;
    email: string;
    role: string;
    trustScore: number;
    isVerifiedTester: boolean;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ApproveReportsPage() {
  const router = useRouter();
  const { hasAccess, isLoading: roleLoading } = useRoleCheck({
    requiredRoles: ['admin', 'super_admin']
  });

  const [reports, setReports] = useState<TestingReport[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchReports = useCallback(async (page = pagination.page, limit = pagination.limit) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reports/pending?status=${activeTab}&page=${page}&limit=${limit}`);
      const data = await response.json();
      
      setReports(data.reports || []);
      setPagination(data.pagination || { page, limit, total: 0, totalPages: 0 });
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, pagination.page, pagination.limit]);

  useEffect(() => {
    if (hasAccess) {
      fetchReports();
    }
  }, [hasAccess, activeTab, fetchReports]);

  const handleApprove = async (reportId: string, feedback?: string) => {
    setActionLoading(reportId);
    try {
      const response = await fetch('/api/admin/reports/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          action: 'approve',
          adminId: 'current-admin-id', // This should come from auth
          feedback
        }),
      });

      if (response.ok) {
        // Remove the report from the list
        setReports(prev => prev.filter(report => report.id !== reportId));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      } else {
        console.error('Failed to approve report');
      }
    } catch (error) {
      console.error('Error approving report:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reportId: string, feedback?: string) => {
    setActionLoading(reportId);
    try {
      const response = await fetch('/api/admin/reports/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportId,
          action: 'reject',
          adminId: 'current-admin-id', // This should come from auth
          feedback
        }),
      });

      if (response.ok) {
        // Remove the report from the list
        setReports(prev => prev.filter(report => report.id !== reportId));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
      } else {
        console.error('Failed to reject report');
      }
    } catch (error) {
      console.error('Error rejecting report:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    fetchReports(newPage, pagination.limit);
  };

  if (roleLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don&apos;t have permission to approve testing reports.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/admin')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchReports()}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Approve Testing Reports</h1>
          </div>
          <p className="text-muted-foreground">
            Review and approve testing reports submitted by verified testers
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeTab === 'pending' ? pagination.total : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting your review
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Reports</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeTab === 'approved' ? pagination.total : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Successfully approved
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected Reports</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {activeTab === 'rejected' ? pagination.total : 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Rejected with feedback
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pending ({activeTab === 'pending' ? pagination.total : 0})
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Approved ({activeTab === 'approved' ? pagination.total : 0})
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Rejected ({activeTab === 'rejected' ? pagination.total : 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {reports.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Reports Found</h3>
                  <p className="text-muted-foreground text-center">
                    {activeTab === 'pending' 
                      ? 'No pending reports to review at the moment.'
                      : `No ${activeTab} reports found.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {reports.map((report) => (
                  <ReportApprovalCard
                    key={report.id}
                    report={report}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    isLoading={actionLoading === report.id}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
