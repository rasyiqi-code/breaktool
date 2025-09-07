'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Star, 
  Clock, 
  User, 
  Award,
  Calendar,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReportApprovalCardProps {
  report: {
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
  };
  onApprove: (reportId: string, feedback?: string) => void;
  onReject: (reportId: string, feedback?: string) => void;
  isLoading?: boolean;
}

export function ReportApprovalCard({ report, onApprove, onReject, isLoading = false }: ReportApprovalCardProps) {
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);

  const handleAction = (actionType: 'approve' | 'reject') => {
    setAction(actionType);
    setShowFeedback(true);
  };

  const handleSubmit = () => {
    if (action === 'approve') {
      onApprove(report.id, feedback);
    } else if (action === 'reject') {
      onReject(report.id, feedback);
    }
    setShowFeedback(false);
    setFeedback('');
    setAction(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'recommended': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      case 'not_recommended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderScore = (label: string, score: number) => (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{label}:</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= score ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            )}
          />
        ))}
        <span className="text-sm font-semibold ml-1">{score}/5</span>
      </div>
    </div>
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{report.title}</CardTitle>
            <CardDescription>
              Testing report for <Badge variant="outline">{report.tool.name}</Badge>
            </CardDescription>
          </div>
          <Badge variant="outline" className={getVerdictColor(report.verdict)}>
            {report.verdict.replace('_', ' ')}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Task Information */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Award className="h-4 w-4" />
            Task Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Task:</span> {report.task.title}
            </div>
            <div>
              <span className="font-medium">Priority:</span> 
              <Badge className={cn("ml-2", getPriorityColor(report.task.priority))}>
                {report.task.priority}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Deadline:</span> 
              <span className="ml-2">{new Date(report.task.deadline).toLocaleDateString()}</span>
            </div>
            <div>
              <span className="font-medium">Reward:</span> 
              <span className="ml-2 flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {report.task.reward}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tester Information */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <User className="h-4 w-4" />
            Tester Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Name:</span> {report.tester.name}
            </div>
            <div>
              <span className="font-medium">Email:</span> {report.tester.email}
            </div>
            <div>
              <span className="font-medium">Role:</span> 
              <Badge variant="outline" className="ml-2">
                {report.tester.role.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Trust Score:</span> 
              <span className="ml-2">{report.tester.trustScore}/100</span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Scoring */}
        <div className="space-y-3">
          <h4 className="font-semibold flex items-center gap-2">
            <Star className="h-4 w-4" />
            Scoring
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderScore('Overall', report.overallScore)}
            {renderScore('Value', report.valueScore)}
            {renderScore('Usage', report.usageScore)}
            {renderScore('Integration', report.integrationScore)}
          </div>
        </div>

        <Separator />

        {/* Summary */}
        <div className="space-y-3">
          <h4 className="font-semibold">Executive Summary</h4>
          <p className="text-sm text-muted-foreground">{report.summary}</p>
        </div>

        {/* Pros and Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h4 className="font-semibold text-green-700">Pros</h4>
            <ul className="space-y-1">
              {report.pros.map((pro, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-green-500 mt-1">•</span>
                  {pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="font-semibold text-red-700">Cons</h4>
            <ul className="space-y-1">
              {report.cons.map((con, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-red-500 mt-1">•</span>
                  {con}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Recommendations */}
        {report.recommendations && (
          <div className="space-y-3">
            <h4 className="font-semibold">Recommendations</h4>
            <p className="text-sm text-muted-foreground">{report.recommendations}</p>
          </div>
        )}

        {/* Use Cases */}
        {report.useCases.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold">Use Cases</h4>
            <ul className="space-y-1">
              {report.useCases.map((useCase, index) => (
                <li key={index} className="text-sm flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  {useCase}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          {report.setupTime && (
            <div>
              <span className="font-medium">Setup Time:</span> {report.setupTime}
            </div>
          )}
          {report.learningCurve && (
            <div>
              <span className="font-medium">Learning Curve:</span> {report.learningCurve}
            </div>
          )}
          {report.supportQuality && (
            <div>
              <span className="font-medium">Support Quality:</span> {report.supportQuality}
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        {!showFeedback ? (
          <div className="flex gap-3">
            <Button
              onClick={() => handleAction('approve')}
              className="flex-1 bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve Report
            </Button>
            <Button
              onClick={() => handleAction('reject')}
              variant="destructive"
              className="flex-1"
              disabled={isLoading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject Report
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">
                {action === 'approve' ? 'Approval Feedback (Optional)' : 'Rejection Reason (Required)'}
              </Label>
              <Textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={
                  action === 'approve' 
                    ? 'Add any feedback for the tester...'
                    : 'Please provide a reason for rejection...'
                }
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleSubmit}
                className={cn(
                  "flex-1",
                  action === 'approve' 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-red-600 hover:bg-red-700"
                )}
                disabled={isLoading || (action === 'reject' && !feedback.trim())}
              >
                {action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </Button>
              <Button
                onClick={() => {
                  setShowFeedback(false);
                  setFeedback('');
                  setAction(null);
                }}
                variant="outline"
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Report Metadata */}
        <div className="text-xs text-muted-foreground flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Submitted: {new Date(report.createdAt).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {new Date(report.createdAt).toLocaleTimeString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
