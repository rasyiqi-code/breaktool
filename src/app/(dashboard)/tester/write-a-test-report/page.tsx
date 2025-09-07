'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { FileText, X } from 'lucide-react';
import { RequireRole } from '@/components/auth/require-role';
import { useUser } from '@stackframe/stack';
import { FormGuideSidebar } from '@/components/testing/form-guide-sidebar';
import { 
  ToolSelectionSection, 
  ReportDetailsSection, 
  ScoringSection, 
  ProsConsSection, 
  AdditionalInfoSection 
} from '@/components/testing/form-sections';

interface Tool {
  id: string;
  name: string;
  slug: string;
}

export default function WriteTestReportPage() {
  const router = useRouter();
  const { toast } = useToast();
  const user = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tools, setTools] = useState<Tool[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [showMobileGuide, setShowMobileGuide] = useState(false);
  const [formData, setFormData] = useState({
    toolId: '',
    title: '',
    summary: '',
    detailedAnalysis: '',
    overallScore: 0,
    valueScore: 0,
    usageScore: 0,
    integrationScore: 0,
    recommendations: '',
    pros: [] as string[],
    cons: [] as string[],
    useCases: [] as string[],
    setupTime: '',
    learningCurve: '',
    supportQuality: '',
    documentation: '',
    performance: '',
    security: '',
    scalability: '',
    costEffectiveness: '',
    verdict: '',
    status: 'submitted'
  });

  // Load available tools
  useEffect(() => {
    const loadTools = async () => {
      try {
        setLoadingTools(true);
        const response = await fetch('/api/tools');
        if (response.ok) {
          const data = await response.json();
          setTools(data.tools || []);
        } else {
          console.error('Failed to load tools');
        }
      } catch (error) {
        console.error('Error loading tools:', error);
      } finally {
        setLoadingTools(false);
      }
    };

    loadTools();
  }, []);

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field: string, index: number, value: string) => {
    setFormData(prev => {
      const array = [...(prev[field as keyof typeof prev] as string[])];
      array[index] = value;
      return {
        ...prev,
        [field]: array
      };
    });
  };

  const addArrayItem = (field: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[]), '']
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData(prev => {
      const array = [...(prev[field as keyof typeof prev] as string[])];
      array.splice(index, 1);
      return {
        ...prev,
        [field]: array
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to submit a report.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.toolId) {
      toast({
        title: 'Error',
        description: 'Please select a tool to test.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate a unique task ID for manual reports
      const taskId = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch('/api/testing/reports-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taskId,
          ...formData,
          title: formData.title || `Manual Test Report - ${tools.find(t => t.id === formData.toolId)?.name || 'Unknown Tool'}`
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to submit test report');
      }

      toast({
        title: 'Success',
        description: 'Test report submitted successfully!',
      });

      router.push('/tester');
    } catch (error) {
      console.error('Error submitting test report:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit test report. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RequireRole requiredRoles={['verified_tester']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20">
        <div className="container mx-auto py-4 px-0 sm:px-4 sm:py-8">
          <div className="flex flex-col xl:flex-row gap-4 xl:gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden xl:block flex-shrink-0 sticky top-4 self-start">
              <FormGuideSidebar />
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
                          Write Test Report
                        </CardTitle>
                        <CardDescription className="text-blue-100 text-sm sm:text-base xl:text-lg font-medium">
              Submit a comprehensive test report for a tool or service
            </CardDescription>
                </div>
              </div>
              </div>
                </CardHeader>
                <CardContent className="px-2 sm:px-6 lg:px-10 py-6 sm:py-8 lg:py-10">
                  {/* Mobile Guide Button */}
                  <div className="xl:hidden mb-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
                      onClick={() => setShowMobileGuide(!showMobileGuide)}
                    >
                      <FileText className="h-4 w-4" />
                      {showMobileGuide ? 'Hide Form Guide' : 'Show Form Guide'}
                </Button>
              </div>

                  <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10">
                    <ToolSelectionSection
                      formData={formData}
                      tools={tools}
                      loadingTools={loadingTools}
                      onInputChange={handleInputChange}
                      onArrayInputChange={handleArrayInputChange}
                      onAddArrayItem={addArrayItem}
                      onRemoveArrayItem={removeArrayItem}
                    />

                    <ReportDetailsSection
                      formData={formData}
                      tools={tools}
                      loadingTools={loadingTools}
                      onInputChange={handleInputChange}
                      onArrayInputChange={handleArrayInputChange}
                      onAddArrayItem={addArrayItem}
                      onRemoveArrayItem={removeArrayItem}
                    />

                    <ScoringSection
                      formData={formData}
                      tools={tools}
                      loadingTools={loadingTools}
                      onInputChange={handleInputChange}
                      onArrayInputChange={handleArrayInputChange}
                      onAddArrayItem={addArrayItem}
                      onRemoveArrayItem={removeArrayItem}
                    />

                    <ProsConsSection
                      formData={formData}
                      tools={tools}
                      loadingTools={loadingTools}
                      onInputChange={handleInputChange}
                      onArrayInputChange={handleArrayInputChange}
                      onAddArrayItem={addArrayItem}
                      onRemoveArrayItem={removeArrayItem}
                    />

                    <AdditionalInfoSection
                      formData={formData}
                      tools={tools}
                      loadingTools={loadingTools}
                      onInputChange={handleInputChange}
                      onArrayInputChange={handleArrayInputChange}
                      onAddArrayItem={addArrayItem}
                      onRemoveArrayItem={removeArrayItem}
                    />

              {/* Submit Button */}
                    <div className="flex gap-4 pt-6 border-t border-border/50">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Submitting Report...
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            Submit Report
                          </>
                        )}
                      </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                        disabled={isSubmitting}
                        className="px-8 border-2 hover:bg-muted/50 transition-all duration-200"
                        size="lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
            </div>
          </div>

          {/* Mobile Guide Modal */}
          {showMobileGuide && (
            <div className="fixed inset-0 bg-black/50 z-50 xl:hidden">
              <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-2xl p-2 sm:p-6 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Form Guide</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileGuide(false)}
                    className="rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="max-w-none">
                  <FormGuideSidebar />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </RequireRole>
  );
}