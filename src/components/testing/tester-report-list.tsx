"use client";

import { useState, useEffect, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Download, 
  Calendar,
  User,
  CheckCircle,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
// import { useUser } from "@stackframe/stack";
import { formatRelativeTime } from "@/utils/formatting.utils";

interface TestingReport {
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
  verdict?: string;
  status: string;
  isApproved: boolean;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
  tester: {
    id: string;
    name?: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
  approver?: {
    id: string;
    name?: string;
    email: string;
  };
}

interface TesterReportListProps {
  toolId: string;
  toolName: string;
  readOnly?: boolean;
}

export function TesterReportList({ toolId, toolName, readOnly = false }: TesterReportListProps) {
  const [reports, setReports] = useState<TestingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(new Set());
  // Tester reports are now public - no role checking needed


  // Removed access checking - reports are now public

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Loading reports for toolId:', toolId);
      const response = await fetch(`/api/testing/reports?toolId=${toolId}`);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Reports data:', data);
        setReports(data);
      } else if (response.status === 403) {
        // Access denied - user doesn't have required role
        console.log('Access denied');
        setReports([]);
      } else {
        console.error('Failed to load testing reports:', response.status);
        setReports([]);
      }
    } catch (error) {
      console.error('Error loading testing reports:', error);
      setReports([]);
    } finally {
      setLoading(false);
    }
  }, [toolId]);

  // Load reports for everyone
  useEffect(() => {
    loadReports();
  }, [toolId, loadReports]);

  const handleDownloadPDF = async (reportId: string, reportTitle: string) => {
    try {
      const response = await fetch(`/api/testing/reports-management/${reportId}/pdf`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${toolName}-${reportTitle}-report.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Failed to download PDF:', response.status, errorData);
        // You could add a toast notification here if you have a toast system
        alert(`Failed to download PDF: ${errorData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error downloading PDF. Please try again.');
    }
  };

  const getStatusBadge = (status: string, isApproved: boolean) => {
    if (isApproved) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    }
    
    switch (status) {
      case 'draft':
        return (
          <Badge variant="secondary">
            <Clock className="w-3 h-3 mr-1" />
            Draft
          </Badge>
        );
      case 'submitted':
        return (
          <Badge variant="outline">
            <AlertCircle className="w-3 h-3 mr-1" />
            Under Review
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            {status}
          </Badge>
        );
    }
  };

  const getVerdictBadge = (verdict?: string) => {
    if (!verdict) return null;
    
    const verdictConfig = {
      'keep': { color: 'bg-green-100 text-green-800', label: 'Keep' },
      'try': { color: 'bg-yellow-100 text-yellow-800', label: 'Try' },
      'stop': { color: 'bg-red-100 text-red-800', label: 'Stop' }
    };
    
    const config = verdictConfig[verdict as keyof typeof verdictConfig];
    if (!config) return null;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const formatScore = (score: number | string | null | undefined): string => {
    if (score === null || score === undefined) return '0.0';
    const numScore = typeof score === 'string' ? parseFloat(score) : score;
    return isNaN(numScore) ? '0.0' : numScore.toFixed(1);
  };

  const toggleExpanded = (reportId: string) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // Reports are now public - no access restrictions

  if (reports.length === 0) {
    return (
      <div className="text-center py-8">
        <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">No Reports Available</h3>
        <p className="text-muted-foreground dark:text-gray-400">
          No testing reports have been published for {toolName} yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Tester Reports</h3>
          <p className="text-sm text-muted-foreground">
            Professional reports from verified testers
          </p>
        </div>
        <Badge variant="outline">
          {reports.length} {reports.length === 1 ? 'Report' : 'Reports'}
        </Badge>
      </div>

      <div className="space-y-2">
        {reports.map((report) => {
          const isExpanded = expandedReports.has(report.id);
          
          return (
            <div key={report.id} className="border-b border-border pb-4 mb-4">
              {/* Header - Always Visible */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">{report.title}</h4>
                    {getStatusBadge(report.status, report.isApproved)}
                    {getVerdictBadge(report.verdict)}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {report.summary}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={readOnly ? undefined : () => handleDownloadPDF(report.id, report.title)}
                    className={`h-8 w-8 p-0 ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={readOnly ? "Login to download PDF" : "Download PDF"}
                    disabled={readOnly}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={readOnly ? undefined : () => toggleExpanded(report.id)}
                    className={`h-8 w-8 p-0 ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={readOnly ? "Login to expand" : (isExpanded ? "Collapse" : "Expand")}
                    disabled={readOnly}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Quick Info - Always Visible */}
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{report.tester.name || report.tester.email}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatRelativeTime(report.createdAt)}</span>
                  </div>
                </div>
                {report.overallScore && (
                  <div className="text-sm font-medium">
                    {formatScore(report.overallScore)}/10
                  </div>
                )}
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="space-y-3 pt-3 border-t">
                  {/* Detailed Analysis */}
                  {report.detailedAnalysis && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <h5 className="font-medium text-sm mb-2">Detailed Analysis</h5>
                      <p className="text-sm leading-relaxed">{report.detailedAnalysis}</p>
                    </div>
                  )}

                  {/* Scores Grid */}
                  {report.overallScore && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="text-center p-2 bg-muted/30 rounded">
                        <div className="text-lg font-bold text-primary">
                          {formatScore(report.overallScore)}/10
                        </div>
                        <div className="text-xs text-muted-foreground">Overall</div>
                      </div>
                      {report.valueScore && (
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="text-sm font-semibold">
                            {formatScore(report.valueScore)}/10
                          </div>
                          <div className="text-xs text-muted-foreground">Value</div>
                        </div>
                      )}
                      {report.usageScore && (
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="text-sm font-semibold">
                            {formatScore(report.usageScore)}/10
                          </div>
                          <div className="text-xs text-muted-foreground">Usage</div>
                        </div>
                      )}
                      {report.integrationScore && (
                        <div className="text-center p-2 bg-muted/30 rounded">
                          <div className="text-sm font-semibold">
                            {formatScore(report.integrationScore)}/10
                          </div>
                          <div className="text-xs text-muted-foreground">Integration</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Pros and Cons */}
                  {(report.pros.length > 0 || report.cons.length > 0) && (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {report.pros.length > 0 && (
                        <div>
                          <h5 className="font-medium text-green-700 dark:text-green-400 text-sm mb-2">Pros</h5>
                          <ul className="text-xs space-y-1">
                            {report.pros.map((pro, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{pro}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {report.cons.length > 0 && (
                        <div>
                          <h5 className="font-medium text-red-700 dark:text-red-400 text-sm mb-2">Cons</h5>
                          <ul className="text-xs space-y-1">
                            {report.cons.map((con, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <AlertCircle className="w-3 h-3 text-red-600 mt-0.5 flex-shrink-0" />
                                <span>{con}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Recommendations */}
                  {report.recommendations && (
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <h5 className="font-medium text-sm mb-2">Recommendations</h5>
                      <p className="text-sm leading-relaxed">{report.recommendations}</p>
                    </div>
                  )}

                  {/* Approval Info */}
                  {report.isApproved && report.approver && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span>Approved by {report.approver.name || report.approver.email}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}