'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RequireRole } from '@/components/auth/require-role';
import { ArrowLeft, Save, Plus, X, FileText, Star, Target, Lightbulb, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface TestingReportForm {
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
  status: string;
}

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
  tool: {
    id: string;
    name: string;
  };
}

export default function EditTestingReportPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [report, setReport] = useState<TestingReport | null>(null);
  const [formData, setFormData] = useState<TestingReportForm>({
    title: '',
    summary: '',
    detailedAnalysis: '',
    overallScore: 1,
    valueScore: 1,
    usageScore: 1,
    integrationScore: 1,
    pros: [''],
    cons: [''],
    recommendations: '',
    useCases: [''],
    setupTime: '',
    learningCurve: '',
    supportQuality: '',
    documentation: '',
    performance: '',
    security: '',
    scalability: '',
    costEffectiveness: '',
    verdict: '',
    status: 'draft'
  });

  const fetchReport = useCallback(async (reportId: string) => {
    try {
      const response = await fetch(`/api/testing/reports-management/${reportId}`);
      if (response.ok) {
        const data = await response.json();
        setReport(data);
        setFormData({
          title: data.title || '',
          summary: data.summary || '',
          detailedAnalysis: data.detailedAnalysis || '',
          overallScore: data.overallScore || 1,
          valueScore: data.valueScore || 1,
          usageScore: data.usageScore || 1,
          integrationScore: data.integrationScore || 1,
          pros: data.pros.length > 0 ? data.pros : [''],
          cons: data.cons.length > 0 ? data.cons : [''],
          recommendations: data.recommendations || '',
          useCases: data.useCases.length > 0 ? data.useCases : [''],
          setupTime: data.setupTime || '',
          learningCurve: data.learningCurve || '',
          supportQuality: data.supportQuality || '',
          documentation: data.documentation || '',
          performance: data.performance || '',
          security: data.security || '',
          scalability: data.scalability || '',
          costEffectiveness: data.costEffectiveness || '',
          verdict: data.verdict || '',
          status: data.status || 'draft'
        });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/testing/reports-management/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          pros: formData.pros.filter(p => p.trim() !== ''),
          cons: formData.cons.filter(c => c.trim() !== ''),
          useCases: formData.useCases.filter(u => u.trim() !== '')
        }),
      });

      if (response.ok) {
        toast.success('Testing report updated successfully');
        router.push(`/tester/testing-reports/${params.id}`);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update testing report');
      }
    } catch (error) {
      console.error('Error updating report:', error);
      toast.error('Error updating testing report');
    } finally {
      setSaving(false);
    }
  };

  const addArrayItem = (field: 'pros' | 'cons' | 'useCases') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const removeArrayItem = (field: 'pros' | 'cons' | 'useCases', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const updateArrayItem = (field: 'pros' | 'cons' | 'useCases', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
  };

  if (loading) {
    return (
      <RequireRole requiredRoles={['verified_tester', 'admin', 'super_admin']} redirectTo="/dashboard">
        <div className="container mx-auto py-8 px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading testing report...</p>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Report Not Found</h1>
            <p className="text-gray-600 mb-4">The testing report you&apos;re trying to edit doesn&apos;t exist.</p>
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
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Report Details</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">{report.title}</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">Tool: {report.tool.name}</p>
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <div><strong>Status:</strong> {report.status}</div>
                      <div><strong>Overall Score:</strong> {report.overallScore || 'N/A'}/10</div>
                    </div>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
                    <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">Edit Guidelines</h4>
                    <div className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                      <div>• Review all sections carefully</div>
                      <div>• Update scores if needed</div>
                      <div>• Ensure accuracy of information</div>
                      <div>• Save changes regularly</div>
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
                          Edit Testing Report
                        </CardTitle>
                        <CardDescription className="text-blue-100 text-sm sm:text-base xl:text-lg font-medium">
                          Update your testing report for {report.tool.name}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
                  {/* Mobile Report Info */}
                  <div className="xl:hidden mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">{report.title}</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">Tool: {report.tool.name}</p>
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <div><strong>Status:</strong> {report.status}</div>
                      <div><strong>Overall Score:</strong> {report.overallScore || 'N/A'}/10</div>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                        <div className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30">
                          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Basic Information</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="title">Report Title *</Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="e.g., Comprehensive Notion Testing Report"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="summary">Executive Summary *</Label>
                        <Textarea
                          id="summary"
                          value={formData.summary}
                          onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                          placeholder="Brief overview of your testing experience..."
                          rows={4}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="detailedAnalysis">Detailed Analysis *</Label>
                        <Textarea
                          id="detailedAnalysis"
                          value={formData.detailedAnalysis}
                          onChange={(e) => setFormData(prev => ({ ...prev, detailedAnalysis: e.target.value }))}
                          placeholder="Provide a comprehensive analysis of the tool's features, performance, and usability..."
                          rows={8}
                        />
                      </div>
                    </div>

                    {/* Scoring */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                        <div className="p-1.5 rounded-md bg-yellow-100 dark:bg-yellow-900/30">
                          <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Scoring (1-10)</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="overallScore">Overall Score *</Label>
                          <Input
                            id="overallScore"
                            type="number"
                            min="1"
                            max="10"
                            value={formData.overallScore}
                            onChange={(e) => setFormData(prev => ({ ...prev, overallScore: parseInt(e.target.value) }))}
                            placeholder="1-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="valueScore">Value Score *</Label>
                          <Input
                            id="valueScore"
                            type="number"
                            min="1"
                            max="10"
                            value={formData.valueScore}
                            onChange={(e) => setFormData(prev => ({ ...prev, valueScore: parseInt(e.target.value) }))}
                            placeholder="1-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="usageScore">Usage Score *</Label>
                          <Input
                            id="usageScore"
                            type="number"
                            min="1"
                            max="10"
                            value={formData.usageScore}
                            onChange={(e) => setFormData(prev => ({ ...prev, usageScore: parseInt(e.target.value) }))}
                            placeholder="1-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="integrationScore">Integration Score *</Label>
                          <Input
                            id="integrationScore"
                            type="number"
                            min="1"
                            max="10"
                            value={formData.integrationScore}
                            onChange={(e) => setFormData(prev => ({ ...prev, integrationScore: parseInt(e.target.value) }))}
                            placeholder="1-10"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pros and Cons */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                        <div className="p-1.5 rounded-md bg-green-100 dark:bg-green-900/30">
                          <Plus className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Pros and Cons</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label>Pros</Label>
                          <div className="space-y-2">
                            {formData.pros.map((pro, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={pro}
                                  onChange={(e) => updateArrayItem('pros', index, e.target.value)}
                                  placeholder="Enter a pro"
                                />
                                {formData.pros.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeArrayItem('pros', index)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addArrayItem('pros')}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Pro
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Cons</Label>
                          <div className="space-y-2">
                            {formData.cons.map((con, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  value={con}
                                  onChange={(e) => updateArrayItem('cons', index, e.target.value)}
                                  placeholder="Enter a con"
                                />
                                {formData.cons.length > 1 && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => removeArrayItem('cons', index)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => addArrayItem('cons')}
                              className="w-full"
                            >
                              <Plus className="h-4 w-4 mr-2" />
                              Add Con
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Use Cases */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                        <div className="p-1.5 rounded-md bg-orange-100 dark:bg-orange-900/30">
                          <Target className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Use Cases</h3>
                      </div>
                      
                      <div className="space-y-2">
                        {formData.useCases.map((useCase, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={useCase}
                              onChange={(e) => updateArrayItem('useCases', index, e.target.value)}
                              placeholder="Enter a use case"
                            />
                            {formData.useCases.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeArrayItem('useCases', index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => addArrayItem('useCases')}
                          className="w-full"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Use Case
                        </Button>
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                        <div className="p-1.5 rounded-md bg-indigo-100 dark:bg-indigo-900/30">
                          <Lightbulb className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Recommendations</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="recommendations">Recommendations</Label>
                        <Textarea
                          id="recommendations"
                          value={formData.recommendations}
                          onChange={(e) => setFormData(prev => ({ ...prev, recommendations: e.target.value }))}
                          placeholder="Any recommendations for improvement or specific use cases..."
                          rows={3}
                        />
                      </div>
                    </div>

                    {/* Additional Information */}
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h3 className="text-base sm:text-lg font-semibold text-purple-900 dark:text-purple-100">Additional Information</h3>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                          <div className="space-y-2">
                            <Label htmlFor="setupTime">Setup Time</Label>
                            <Input
                              id="setupTime"
                              value={formData.setupTime}
                              onChange={(e) => setFormData(prev => ({ ...prev, setupTime: e.target.value }))}
                              placeholder="e.g., 30 minutes"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="learningCurve">Learning Curve</Label>
                            <Input
                              id="learningCurve"
                              value={formData.learningCurve}
                              onChange={(e) => setFormData(prev => ({ ...prev, learningCurve: e.target.value }))}
                              placeholder="e.g., Easy, Moderate, Steep"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="supportQuality">Support Quality</Label>
                            <Input
                              id="supportQuality"
                              value={formData.supportQuality}
                              onChange={(e) => setFormData(prev => ({ ...prev, supportQuality: e.target.value }))}
                              placeholder="e.g., Excellent, Good, Poor"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="documentation">Documentation</Label>
                            <Input
                              id="documentation"
                              value={formData.documentation}
                              onChange={(e) => setFormData(prev => ({ ...prev, documentation: e.target.value }))}
                              placeholder="e.g., Comprehensive, Basic, Limited"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="performance">Performance</Label>
                            <Input
                              id="performance"
                              value={formData.performance}
                              onChange={(e) => setFormData(prev => ({ ...prev, performance: e.target.value }))}
                              placeholder="e.g., Fast, Average, Slow"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="security">Security</Label>
                            <Input
                              id="security"
                              value={formData.security}
                              onChange={(e) => setFormData(prev => ({ ...prev, security: e.target.value }))}
                              placeholder="e.g., High, Medium, Low"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="scalability">Scalability</Label>
                            <Input
                              id="scalability"
                              value={formData.scalability}
                              onChange={(e) => setFormData(prev => ({ ...prev, scalability: e.target.value }))}
                              placeholder="e.g., Highly scalable, Limited"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="costEffectiveness">Cost Effectiveness</Label>
                            <Input
                              id="costEffectiveness"
                              value={formData.costEffectiveness}
                              onChange={(e) => setFormData(prev => ({ ...prev, costEffectiveness: e.target.value }))}
                              placeholder="e.g., Excellent value, Overpriced"
                            />
                          </div>
                        </div>
                    </div>

                    {/* Status and Verdict */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                        <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30">
                          <CheckCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground">Status & Verdict</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="status">Status</Label>
                          <Select
                            value={formData.status}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="review">Under Review</SelectItem>
                              <SelectItem value="published">Published</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="verdict">Final Verdict *</Label>
                          <Select
                            value={formData.verdict}
                            onValueChange={(value) => setFormData(prev => ({ ...prev, verdict: value }))}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select verdict" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="highly-recommended">Highly Recommended</SelectItem>
                              <SelectItem value="recommended">Recommended</SelectItem>
                              <SelectItem value="not-recommended">Not Recommended</SelectItem>
                              <SelectItem value="conditional">Conditional</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-6 border-t border-border/50">
                      <Button type="submit" className="flex-1" disabled={saving}>
                        <Save className="w-4 h-4 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Link href={`/tester/testing-reports/${params.id}`} className="flex-1">
                        <Button type="button" variant="outline" className="w-full">
                          Cancel
                        </Button>
                      </Link>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </RequireRole>
  );
}