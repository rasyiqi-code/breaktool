'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RequireRole } from '@/components/auth/require-role';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Clock, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { toast } from 'sonner';

interface TestingReportDetail {
  id: string;
  title: string;
  summary: string;
  detailedAnalysis?: string;
  overallScore?: number;
  valueScore?: number;
  usageScore?: number;
  integrationScore?: number;
  pros: string[];
  cons: string[];
  recommendations?: string;
  useCases: string[];
  setupTime?: string;
  learningCurve?: string;
  supportQuality?: string;
  documentation?: string;
  performance?: string;
  security?: string;
  scalability?: string;
  costEffectiveness?: string;
  verdict?: string;
  status: string;
  isApproved: boolean;
  approvedAt?: string;
  reviewNotes?: string;
  createdAt: string;
  updatedAt: string;
  tool: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
    website?: string;
    description?: string;
  };
  tester: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  approver?: {
    id: string;
    name: string;
    email: string;
  };
  task: {
    id: string;
    title: string;
    description?: string;
    status: string;
    deadline: string;
  };
}

export default function TestingReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [report, setReport] = useState<TestingReportDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = useCallback(async (reportId: string) => {
    try {
      const response = await fetch(`/api/testing/reports-management/${reportId}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data);
      } else if (response.status === 404) {
        toast.error('Testing report not found');
        router.push('/tester/testing-reports');
      } else {
        toast.error('Failed to fetch testing report');
      }
    } catch (error) {
      console.error('Error fetching report:', error);
      toast.error('Error loading testing report');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (params.id) {
      fetchReport(params.id as string);
    }
  }, [params.id, fetchReport]);

  const handleDelete = async () => {
    if (!report || !confirm('Are you sure you want to delete this testing report?')) {
      return;
    }

    try {
      const response = await fetch(`/api/testing/reports-management/${report.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Testing report deleted successfully');
        router.push('/tester/testing-reports');
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

  const renderScore = (score: number | undefined, label: string) => {
    if (!score) return null;
    
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <span className="font-medium text-gray-900 dark:text-gray-100">{label}</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= score ? 'text-yellow-400 fill-current' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="font-bold text-lg text-gray-900 dark:text-gray-100">{score}/5</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <RequireRole requiredRoles={['verified_tester', 'admin', 'super_admin']} redirectTo="/dashboard">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading testing report...</p>
            </div>
          </div>
        </div>
      </RequireRole>
    );
  }

  if (!report) {
    return (
      <RequireRole requiredRoles={['verified_tester', 'admin', 'super_admin']} redirectTo="/dashboard">
        <div className="container mx-auto py-8 px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Report Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">The testing report you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/tester/testing-reports">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Reports
              </Button>
            </Link>
          </div>
        </div>
      </RequireRole>
    );
  }

  return (
    <RequireRole requiredRoles={['verified_tester', 'admin', 'super_admin']} redirectTo="/dashboard">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <Link href="/tester/testing-reports">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{report.title}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Testing Report Details</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/tester/testing-reports/${report.id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={handleDelete}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tool Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  {report.tool.logoUrl && (
                    <Image
                      src={report.tool.logoUrl}
                      alt={report.tool.name}
                      width={64}
                      height={64}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-gray-100">{report.tool.name}</CardTitle>
                    <CardDescription className="text-gray-700 dark:text-gray-300">{report.tool.description}</CardDescription>
                    {report.tool.website && (
                      <a
                        href={report.tool.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                      >
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{report.summary}</p>
              </CardContent>
            </Card>

            {/* Detailed Analysis */}
            {report.detailedAnalysis && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Detailed Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {report.detailedAnalysis}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Scores */}
            {(report.overallScore || report.valueScore || report.usageScore || report.integrationScore) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Scores</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {renderScore(report.overallScore, 'Overall Score')}
                    {renderScore(report.valueScore, 'Value for Money')}
                    {renderScore(report.usageScore, 'Ease of Use')}
                    {renderScore(report.integrationScore, 'Integration')}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pros and Cons */}
            {(report.pros.length > 0 || report.cons.length > 0) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Pros and Cons</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {report.pros.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-green-800 dark:text-green-400 mb-3 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Pros
                        </h4>
                        <ul className="space-y-2">
                          {report.pros.map((pro, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-800 dark:text-gray-200">{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {report.cons.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-red-800 dark:text-red-400 mb-3 flex items-center">
                          <XCircle className="w-4 h-4 mr-2" />
                          Cons
                        </h4>
                        <ul className="space-y-2">
                          {report.cons.map((con, index) => (
                            <li key={index} className="flex items-start">
                              <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                              <span className="text-gray-800 dark:text-gray-200">{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Use Cases */}
            {report.useCases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Use Cases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {report.useCases.map((useCase, index) => (
                      <Badge key={index} variant="outline" className="px-3 py-1">
                        {useCase}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {report.recommendations && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800 dark:text-gray-200 leading-relaxed">{report.recommendations}</p>
                </CardContent>
              </Card>
            )}

            {/* Technical Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Technical Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {report.setupTime && (
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Setup Time:</span>
                      <p className="text-gray-800 dark:text-gray-200">{report.setupTime}</p>
                    </div>
                  )}
                  {report.learningCurve && (
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Learning Curve:</span>
                      <p className="text-gray-800 dark:text-gray-200">{report.learningCurve}</p>
                    </div>
                  )}
                  {report.supportQuality && (
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Support Quality:</span>
                      <p className="text-gray-800 dark:text-gray-200">{report.supportQuality}</p>
                    </div>
                  )}
                  {report.documentation && (
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Documentation:</span>
                      <p className="text-gray-800 dark:text-gray-200">{report.documentation}</p>
                    </div>
                  )}
                  {report.performance && (
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Performance:</span>
                      <p className="text-gray-800 dark:text-gray-200">{report.performance}</p>
                    </div>
                  )}
                  {report.security && (
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Security:</span>
                      <p className="text-gray-800 dark:text-gray-200">{report.security}</p>
                    </div>
                  )}
                  {report.scalability && (
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Scalability:</span>
                      <p className="text-gray-800 dark:text-gray-200">{report.scalability}</p>
                    </div>
                  )}
                  {report.costEffectiveness && (
                    <div>
                      <span className="font-medium text-gray-900 dark:text-gray-100">Cost Effectiveness:</span>
                      <p className="text-gray-800 dark:text-gray-200">{report.costEffectiveness}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status and Verdict */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Status:</span>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                  </Badge>
                </div>
                {report.verdict && (
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-gray-100">Verdict:</span>
                    <Badge className={getVerdictColor(report.verdict)}>
                      {report.verdict.replace('_', ' ').charAt(0).toUpperCase() + report.verdict.replace('_', ' ').slice(1)}
                    </Badge>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-900 dark:text-gray-100">Approved:</span>
                  <Badge className={report.isApproved ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'}>
                    {report.isApproved ? 'Yes' : 'No'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tester Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Tester</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  {report.tester.avatarUrl && (
                    <Image
                      src={report.tester.avatarUrl}
                      alt={report.tester.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">{report.tester.name}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{report.tester.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approver Info */}
            {report.approver && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Approved By</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900 dark:text-gray-100">{report.approver.name}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{report.approver.email}</p>
                    {report.approvedAt && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(report.approvedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Review Notes */}
            {report.reviewNotes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-900 dark:text-gray-100">Review Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-800 dark:text-gray-200 text-sm">{report.reviewNotes}</p>
                </CardContent>
              </Card>
            )}

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-gray-100">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Created:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(report.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">Updated:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">{new Date(report.updatedAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}