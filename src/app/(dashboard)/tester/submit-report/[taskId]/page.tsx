'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { TestingReportForm } from '@/components/testing/testing-report-form';
import { useMultiRole } from '@/hooks/use-multi-role';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface TestingTask {
  id: string;
  title: string;
  description: string;
  deadline: string;
  tool: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string;
  };
}

interface TestingReportFormData {
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
  documentation: string;
  performance: string;
  security: string;
  scalability: string;
  costEffectiveness: string;
  verdict: string;
}

export default function SubmitReportPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.taskId as string;
  
  const { isLoading: roleLoading, hasAnyRole } = useMultiRole();
  const hasAccess = hasAnyRole(['verified_tester', 'admin', 'super_admin']);

  const [task, setTask] = useState<TestingTask | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTask = useCallback(async () => {
    try {
      const response = await fetch(`/api/testing/tester-stats/tasks?taskId=${taskId}`);
      const data = await response.json();
      
      if (data.tasks && data.tasks.length > 0) {
        setTask(data.tasks[0]);
      } else {
        // No task found, redirect back
        router.push('/tester');
        return;
      }
    } catch (error) {
      console.error('Error fetching task:', error);
    } finally {
      setLoading(false);
    }
  }, [taskId, router]);

  useEffect(() => {
    if (hasAccess && taskId) {
      fetchTask();
    }
  }, [hasAccess, taskId, fetchTask]);

  const handleSubmit = async (data: TestingReportFormData) => {
    if (!task) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/testing/reports-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId: task.id,
          toolId: task.tool.id,
          ...data
        }),
      });

      if (response.ok) {
        router.push('/tester');
      } else {
        console.error('Failed to submit report');
      }
    } catch (error) {
      console.error('Error submitting report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push('/tester');
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
          <p className="text-muted-foreground">You don&apos;t have permission to submit testing reports.</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Task Not Found</h2>
          <p className="text-muted-foreground">The testing task you&apos;re looking for doesn&apos;t exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20">
      <div className="container mx-auto py-4 px-0 sm:px-4 sm:py-8">
        <div className="flex flex-col xl:flex-row gap-4 xl:gap-8">
          {/* Desktop Sidebar */}
          <div className="hidden xl:block flex-shrink-0 sticky top-4 self-start">
            <div className="w-80 bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4 sm:p-6 border border-blue-200/50 dark:border-blue-800/50">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Task Details</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">{task.title}</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">{task.description}</p>
                  <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <div><strong>Tool:</strong> {task.tool.name}</div>
                    <div><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
                  <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Report Guidelines</h4>
                  <div className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                    <div>• Be objective and honest</div>
                    <div>• Include specific examples</div>
                    <div>• Offer constructive feedback</div>
                    <div>• Test all major features</div>
                    <div>• Write professionally</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="flex-1 min-w-0">
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-2xl overflow-hidden">
              <CardHeader className="py-8 sm:py-12 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-t-xl shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 h-full">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-3 sm:p-4 rounded-2xl bg-white/15 backdrop-blur-sm shadow-lg border border-white/20">
                      <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                    <div className="space-y-1">
                      <CardTitle className="text-2xl sm:text-3xl xl:text-4xl font-bold text-white tracking-tight">
                        Submit Testing Report
                      </CardTitle>
                      <CardDescription className="text-blue-100 text-sm sm:text-base xl:text-lg font-medium">
                        Complete your testing report for {task.tool.name}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                {/* Mobile Task Info */}
                <div className="xl:hidden mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">{task.title}</h3>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">{task.description}</p>
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <div><strong>Tool:</strong> {task.tool.name}</div>
                    <div><strong>Deadline:</strong> {new Date(task.deadline).toLocaleDateString()}</div>
                  </div>
                </div>

                <TestingReportForm
                  taskId={task.id}
                  toolId={task.tool.id}
                  toolName={task.tool.name}
                  onSubmit={handleSubmit}
                  onCancel={handleCancel}
                  isLoading={isSubmitting}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
