'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Star, 
  CheckCircle, 
  Clock, 
  FileText,
  Award,
  Calendar
} from 'lucide-react';
import Image from 'next/image';

interface TestingReport {
  id: string;
  title: string;
  summary: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  overallScore?: number;
  valueScore?: number;
  usageScore?: number;
  integrationScore?: number;
  verdict?: string;
  createdAt: string;
  approvedAt?: string;
  task: {
    id: string;
    title: string;
    status: string;
    deadline: string;
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
  approver?: {
    id: string;
    name: string;
    email: string;
  };
}

interface TestingReportCardProps {
  report: TestingReport;
  onView?: (reportId: string) => void;
  onEdit?: (reportId: string) => void;
  onApprove?: (reportId: string) => void;
  onReject?: (reportId: string) => void;
}

export function TestingReportCard({ report, onView, onEdit, onApprove, onReject }: TestingReportCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'submitted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict?.toLowerCase()) {
      case 'recommended':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'neutral':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'not_recommended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getScoreColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 4.0) return 'text-green-600';
    if (score >= 3.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {report.tool.logoUrl ? (
              <Image 
                src={report.tool.logoUrl} 
                alt={report.tool.name}
                width={32}
                height={32}
                className="w-8 h-8 rounded-md object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gray-200 rounded-md flex items-center justify-center">
                <Star className="w-4 h-4 text-gray-500" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{report.title}</CardTitle>
              <CardDescription className="flex items-center gap-2">
                <span>{report.tool.name}</span>
                {report.tool.category && (
                  <>
                    <span>•</span>
                    <span>{report.tool.category.name}</span>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge className={getStatusColor(report.status)}>
              {report.status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
              {report.status === 'submitted' && <Clock className="w-3 h-3 mr-1" />}
              {report.status === 'draft' && <FileText className="w-3 h-3 mr-1" />}
              {report.status}
            </Badge>
            {report.verdict && (
              <Badge className={getVerdictColor(report.verdict)}>
                {report.verdict.replace('_', ' ')}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-2">{report.summary}</p>
        
        {report.overallScore && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Score</span>
              <span className={`font-medium ${getScoreColor(report.overallScore)}`}>
                {report.overallScore}/5.0
              </span>
            </div>
            <Progress value={report.overallScore * 20} className="h-2" />
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-4 text-sm">
          {report.valueScore && (
            <div>
              <div className="text-muted-foreground">Value</div>
              <div className={`font-medium ${getScoreColor(report.valueScore)}`}>
                {report.valueScore}/5.0
              </div>
            </div>
          )}
          {report.usageScore && (
            <div>
              <div className="text-muted-foreground">Usage</div>
              <div className={`font-medium ${getScoreColor(report.usageScore)}`}>
                {report.usageScore}/5.0
              </div>
            </div>
          )}
          {report.integrationScore && (
            <div>
              <div className="text-muted-foreground">Integration</div>
              <div className={`font-medium ${getScoreColor(report.integrationScore)}`}>
                {report.integrationScore}/5.0
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Created {new Date(report.createdAt).toLocaleDateString()}</span>
          </div>
          {report.approvedAt && (
            <div className="flex items-center gap-1">
              <Award className="w-4 h-4" />
              <span>Approved {new Date(report.approvedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {onView && (
            <Button 
              size="sm" 
              onClick={() => onView(report.id)}
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Report
            </Button>
          )}
          
          {report.status === 'draft' && onEdit && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onEdit(report.id)}
            >
              Edit
            </Button>
          )}
          
          {report.status === 'submitted' && onApprove && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onApprove(report.id)}
              className="text-green-600 hover:text-green-700"
            >
              Approve
            </Button>
          )}
          
          {report.status === 'submitted' && onReject && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onReject(report.id)}
              className="text-red-600 hover:text-red-700"
            >
              Reject
            </Button>
          )}
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => window.open(`/tools/${report.tool.slug}`, '_blank')}
          >
            View Tool
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
