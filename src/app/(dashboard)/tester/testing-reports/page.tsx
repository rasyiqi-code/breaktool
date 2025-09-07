'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RequireRole } from '@/components/auth/require-role';
import { Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

interface TestingReport {
  id: string;
  title: string;
  summary: string;
  overallScore: number;
  verdict: string;
  status: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  tool: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
  tester: {
    id: string;
    name: string;
    email: string;
  };
}

export default function TestingReportsPage() {
  const [reports, setReports] = useState<TestingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [verdictFilter, setVerdictFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchReports();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchReports = async (page = 1, append = false) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '3' // Show 3 reports per page
      });

      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (verdictFilter !== 'all') params.append('verdict', verdictFilter);

      const response = await fetch(`/api/testing/reports-management?${params}`);
      if (response.ok) {
        const data = await response.json();
        const newReports = Array.isArray(data.reports) ? data.reports : [];
        
        if (append) {
          setReports(prev => [...prev, ...newReports]);
        } else {
          setReports(newReports);
        }
        
        setTotalCount(data.pagination?.totalCount || 0);
        setHasMore(data.pagination?.hasNext || false);
        setCurrentPage(page);
      } else {
        toast.error('Failed to fetch testing reports');
        if (!append) setReports([]);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Error loading testing reports');
      if (!append) setReports([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      fetchReports(currentPage + 1, true);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this testing report?')) {
      return;
    }

    try {
      const response = await fetch(`/api/testing/reports-management/${reportId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Testing report deleted successfully');
        fetchReports(1, false); // Refresh the list from page 1
      } else {
        toast.error('Failed to delete testing report');
      }
    } catch (error) {
      console.error('Error deleting report:', error);
      toast.error('Error deleting testing report');
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'recommended':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'not_recommended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'conditional':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  // Handle filter changes
  useEffect(() => {
    if (currentPage === 1) {
      fetchReports(1, false);
    } else {
      setCurrentPage(1);
      fetchReports(1, false);
    }
  }, [searchTerm, statusFilter, verdictFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <RequireRole requiredRoles={['verified_tester', 'admin', 'super_admin']} redirectTo="/dashboard">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading testing reports...</p>
            </div>
          </div>
        </div>
      </RequireRole>
    );
  }

  return (
    <RequireRole requiredRoles={['verified_tester', 'admin', 'super_admin']} redirectTo="/dashboard">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Testing Reports</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Manage and view all testing reports</p>
          </div>
          <Link href="/tester/write-a-test-report">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Edit className="w-4 h-4 mr-2" />
              Write New Report
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-gray-100 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search reports, tools, or testers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="review">Under Review</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                </SelectContent>
              </Select>
              <Select value={verdictFilter} onValueChange={setVerdictFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue placeholder="Filter by verdict" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Verdicts</SelectItem>
                  <SelectItem value="recommended">Recommended</SelectItem>
                  <SelectItem value="conditional">Conditional</SelectItem>
                  <SelectItem value="not_recommended">Not Recommended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Reports List */}
        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <div className="text-gray-400 mb-4">
                  <Eye className="w-12 h-12 mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No testing reports found</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {searchTerm || statusFilter !== 'all' || verdictFilter !== 'all'
                    ? 'Try adjusting your filters or search terms.'
                    : 'No testing reports have been created yet.'}
                </p>
                <Link href="/tester/write-a-test-report">
                  <Button>
                    <Edit className="w-4 h-4 mr-2" />
                    Create First Report
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6">
              {reports.map((report) => (
              <Card key={report.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {report.tool.logoUrl && (
                          <Image
                            src={report.tool.logoUrl}
                            alt={report.tool.name}
                            width={32}
                            height={32}
                            className="w-8 h-8 rounded object-cover"
                          />
                        )}
                        <div>
                          <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{report.title}</CardTitle>
                          <CardDescription className="text-sm text-gray-700 dark:text-gray-300">
                            Tool: {report.tool.name} • Tester: {report.tester.name}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge className={getStatusColor(report.status)}>
                          {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                        </Badge>
                        {report.verdict && (
                          <Badge className={getVerdictColor(report.verdict)}>
                            {report.verdict.replace('_', ' ').charAt(0).toUpperCase() + report.verdict.replace('_', ' ').slice(1)}
                          </Badge>
                        )}
                        {report.isApproved && (
                          <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                            Approved
                          </Badge>
                        )}
                        {report.overallScore && (
                          <Badge variant="outline">
                            Score: {report.overallScore}/5
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-800 dark:text-gray-200 text-sm line-clamp-2">{report.summary}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link href={`/tester/testing-reports/${report.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/tester/testing-reports/${report.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(report.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Created: {new Date(report.createdAt).toLocaleDateString()} • 
                    Updated: {new Date(report.updatedAt).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
            
            {/* Load More Button */}
            {hasMore && (
              <div className="text-center py-6">
                <Button 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                  className="px-8"
                >
                  {loadingMore ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                      Loading...
                    </>
                  ) : (
                    'Load More Reports'
                  )}
                </Button>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Showing {reports.length} of {totalCount} reports
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </RequireRole>
  );
}