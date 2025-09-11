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
import { AITextMapper } from '@/components/testing/ai-text-mapper';
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
  const [userRole, setUserRole] = useState<string>('user');
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

  // Load available tools and user role
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

    const loadUserRole = async () => {
      if (!user?.id) return;
      
      try {
        const response = await fetch('/api/users/me');
        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role || 'user');
        }
      } catch (error) {
        console.error('Error loading user role:', error);
      }
    };

    loadTools();
    loadUserRole();
  }, [user]);

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

  const handleFormDataUpdate = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
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
      const submitData = {
        ...formData,
        title: formData.title || `Manual Test Report - ${tools.find(t => t.id === formData.toolId)?.name || 'Unknown Tool'}`
      };
      
      console.log('Submitting test report with data:', submitData);
      
      const response = await fetch('/api/testing/reports-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
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
    <RequireRole requiredRoles={['verified_tester', 'admin', 'super_admin']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-950/20 dark:to-indigo-950/20">
        <div className="w-full px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
          <div className="flex flex-col xl:flex-row gap-3 sm:gap-4 xl:gap-8">
            {/* Desktop Sidebar */}
            <div className="hidden xl:block flex-shrink-0 sticky top-4 self-start">
              <div className="w-80">
                <FormGuideSidebar />
              </div>
            </div>

            {/* Main Form */}
            <div className="flex-1 min-w-0">
              <Card className="border-0 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm rounded-xl sm:rounded-2xl overflow-hidden">
                <CardHeader className="py-6 sm:py-8 md:py-12 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-t-xl shadow-lg">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="p-2 sm:p-3 md:p-4 rounded-xl sm:rounded-2xl bg-white/15 backdrop-blur-sm shadow-lg border border-white/20">
                        <FileText className="h-6 w-6 sm:h-8 sm:w-8 md:h-10 md:w-10 text-white" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-xl sm:text-2xl md:text-3xl xl:text-4xl font-bold text-white tracking-tight">
                          Write Test Report
                        </CardTitle>
                        <CardDescription className="text-blue-100 text-sm sm:text-base xl:text-lg font-medium">
                          Submit a comprehensive test report for a tool or service
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-4 md:px-6 lg:px-10 py-4 sm:py-6 md:py-8 lg:py-10">
                  {/* Mobile Guide Button */}
                  <div className="xl:hidden mb-4 sm:mb-6">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700 text-sm sm:text-base"
                      onClick={() => setShowMobileGuide(!showMobileGuide)}
                    >
                      <FileText className="h-4 w-4" />
                      {showMobileGuide ? 'Hide Form Guide' : 'Show Form Guide'}
                    </Button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 md:space-y-10">
                    <ToolSelectionSection
                      formData={formData}
                      tools={tools}
                      loadingTools={loadingTools}
                      onInputChange={handleInputChange}
                      onArrayInputChange={handleArrayInputChange}
                      onAddArrayItem={addArrayItem}
                      onRemoveArrayItem={removeArrayItem}
                    />

                    {/* AI Text Mapper - Admin Only */}
                    <AITextMapper
                      formData={formData}
                      onFormDataUpdate={handleFormDataUpdate}
                      isAdmin={['admin', 'super_admin'].includes(userRole)}
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
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-border/50">
                      <Button 
                        type="submit" 
                        disabled={isSubmitting} 
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 text-sm sm:text-base"
                        size="lg"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            <span className="hidden xs:inline">Submitting Report...</span>
                            <span className="xs:hidden">Submitting...</span>
                          </>
                        ) : (
                          <>
                            <FileText className="h-4 w-4 mr-2" />
                            <span className="hidden xs:inline">Submit Report</span>
                            <span className="xs:hidden">Submit</span>
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={isSubmitting}
                        className="px-4 sm:px-8 border-2 hover:bg-muted/50 transition-all duration-200 text-sm sm:text-base"
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
              <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-xl sm:rounded-t-2xl p-3 sm:p-4 md:p-6 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="text-base sm:text-lg font-semibold">Form Guide</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowMobileGuide(false)}
                    className="rounded-full p-2"
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