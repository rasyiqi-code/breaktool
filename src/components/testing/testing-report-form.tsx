'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Star, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestingReportFormProps {
  taskId: string;
  toolId: string;
  toolName: string;
  onSubmit: (data: TestingReportFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
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

// Separate interface for form errors
interface TestingReportFormErrors {
  title?: string;
  summary?: string;
  detailedAnalysis?: string;
  overallScore?: string;
  valueScore?: string;
  usageScore?: string;
  integrationScore?: string;
  pros?: string;
  cons?: string;
  recommendations?: string;
  useCases?: string;
  setupTime?: string;
  learningCurve?: string;
  supportQuality?: string;
  documentation?: string;
  performance?: string;
  security?: string;
  scalability?: string;
  costEffectiveness?: string;
  verdict?: string;
}

export function TestingReportForm({ onSubmit, onCancel, isLoading = false }: TestingReportFormProps) {
  const [formData, setFormData] = useState<TestingReportFormData>({
    title: '',
    summary: '',
    detailedAnalysis: '',
    overallScore: 0,
    valueScore: 0,
    usageScore: 0,
    integrationScore: 0,
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
    verdict: ''
  });

  const [errors, setErrors] = useState<TestingReportFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: TestingReportFormErrors = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.summary.trim()) newErrors.summary = 'Summary is required';
    if (!formData.detailedAnalysis.trim()) newErrors.detailedAnalysis = 'Detailed analysis is required';
    if (formData.overallScore < 1 || formData.overallScore > 5) newErrors.overallScore = 'Overall score must be between 1-5';
    if (formData.valueScore < 1 || formData.valueScore > 5) newErrors.valueScore = 'Value score must be between 1-5';
    if (formData.usageScore < 1 || formData.usageScore > 5) newErrors.usageScore = 'Usage score must be between 1-5';
    if (formData.integrationScore < 1 || formData.integrationScore > 5) newErrors.integrationScore = 'Integration score must be between 1-5';
    if (!formData.verdict) newErrors.verdict = 'Verdict is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      // Filter out empty strings from arrays
      const cleanedData = {
        ...formData,
        pros: formData.pros.filter(p => p.trim() !== ''),
        cons: formData.cons.filter(c => c.trim() !== ''),
        useCases: formData.useCases.filter(u => u.trim() !== '')
      };
      onSubmit(cleanedData);
    }
  };

  const handleInputChange = (field: keyof TestingReportFormData, value: string | number | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
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

  const renderScoreInput = (label: string, field: keyof TestingReportFormData, error?: string) => (
    <div className="space-y-2">
      <Label htmlFor={field}>{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          id={field}
          type="number"
          min="1"
          max="10"
          step="0.1"
          value={formData[field]}
          onChange={(e) => handleInputChange(field, parseFloat(e.target.value) || 0)}
          className={cn("w-20", error && 'border-red-500')}
        />
        <div className="flex">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <Star
              key={star}
              className={cn(
                "h-3 w-3 cursor-pointer",
                star <= (formData[field] as number) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
              )}
              onClick={() => handleInputChange(field, star)}
            />
          ))}
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );

  const renderArrayInput = (label: string, field: 'pros' | 'cons' | 'useCases') => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {formData[field].map((item, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={item}
              onChange={(e) => updateArrayItem(field, index, e.target.value)}
              placeholder={`${label.slice(0, -1)} ${index + 1}`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeArrayItem(field, index)}
              disabled={formData[field].length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => addArrayItem(field)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add {label.slice(0, -1)}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="w-full">
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
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="e.g., Comprehensive Notion Testing Report"
                className={cn(errors.title && 'border-red-500')}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Executive Summary *</Label>
              <Textarea
                id="summary"
                value={formData.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
                placeholder="Brief overview of your testing experience..."
                rows={3}
                className={cn(errors.summary && 'border-red-500')}
              />
              {errors.summary && <p className="text-sm text-red-500">{errors.summary}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="detailedAnalysis">Detailed Analysis *</Label>
              <Textarea
                id="detailedAnalysis"
                value={formData.detailedAnalysis}
                onChange={(e) => handleInputChange('detailedAnalysis', e.target.value)}
                placeholder="Comprehensive analysis of the tool's features, usability, and performance..."
                rows={6}
                className={cn(errors.detailedAnalysis && 'border-red-500')}
              />
              {errors.detailedAnalysis && <p className="text-sm text-red-500">{errors.detailedAnalysis}</p>}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderScoreInput('Overall Score *', 'overallScore', errors.overallScore)}
              {renderScoreInput('Value Score *', 'valueScore', errors.valueScore)}
              {renderScoreInput('Usage Score *', 'usageScore', errors.usageScore)}
              {renderScoreInput('Integration Score *', 'integrationScore', errors.integrationScore)}
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {renderArrayInput('Pros', 'pros')}
              {renderArrayInput('Cons', 'cons')}
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
                <Select value={formData.setupTime} onValueChange={(value) => handleInputChange('setupTime', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select setup time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under-5-minutes">Under 5 minutes</SelectItem>
                    <SelectItem value="5-15-minutes">5-15 minutes</SelectItem>
                    <SelectItem value="15-30-minutes">15-30 minutes</SelectItem>
                    <SelectItem value="30-60-minutes">30-60 minutes</SelectItem>
                    <SelectItem value="over-1-hour">Over 1 hour</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="learningCurve">Learning Curve</Label>
                <Select value={formData.learningCurve} onValueChange={(value) => handleInputChange('learningCurve', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select learning curve" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="very-easy">Very Easy</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="moderate">Moderate</SelectItem>
                    <SelectItem value="difficult">Difficult</SelectItem>
                    <SelectItem value="very-difficult">Very Difficult</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportQuality">Support Quality</Label>
                <Select value={formData.supportQuality} onValueChange={(value) => handleInputChange('supportQuality', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select support quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="very-poor">Very Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 col-span-2 lg:col-span-3">
                <Label htmlFor="verdict">Final Verdict *</Label>
                <Select value={formData.verdict} onValueChange={(value) => handleInputChange('verdict', value)}>
                  <SelectTrigger className={cn('w-full', errors.verdict && 'border-red-500')}>
                    <SelectValue placeholder="Select verdict" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="highly-recommended">Highly Recommended</SelectItem>
                    <SelectItem value="recommended">Recommended</SelectItem>
                    <SelectItem value="neutral">Neutral</SelectItem>
                    <SelectItem value="not-recommended">Not Recommended</SelectItem>
                    <SelectItem value="strongly-not-recommended">Strongly Not Recommended</SelectItem>
                  </SelectContent>
                </Select>
                {errors.verdict && <p className="text-sm text-red-500">{errors.verdict}</p>}
              </div>
            </div>

            {/* Additional Quality Fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="documentation">Documentation Quality</Label>
                <Select value={formData.documentation} onValueChange={(value) => handleInputChange('documentation', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select documentation quality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="very-poor">Very Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="performance">Performance</Label>
                <Select value={formData.performance} onValueChange={(value) => handleInputChange('performance', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select performance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="very-poor">Very Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="security">Security</Label>
                <Select value={formData.security} onValueChange={(value) => handleInputChange('security', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select security level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="very-poor">Very Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="scalability">Scalability</Label>
                <Select value={formData.scalability} onValueChange={(value) => handleInputChange('scalability', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select scalability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="very-poor">Very Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="costEffectiveness">Cost Effectiveness</Label>
                <Select value={formData.costEffectiveness} onValueChange={(value) => handleInputChange('costEffectiveness', value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select cost effectiveness" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="average">Average</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                    <SelectItem value="very-poor">Very Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2 col-span-2 lg:col-span-3">
              <Label htmlFor="recommendations">Recommendations</Label>
              <Textarea
                id="recommendations"
                value={formData.recommendations}
                onChange={(e) => handleInputChange('recommendations', e.target.value)}
                placeholder="Any recommendations for improvement or specific use cases..."
                rows={3}
              />
            </div>

            <div className="col-span-2 lg:col-span-3">
              {renderArrayInput('Use Cases', 'useCases')}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t border-border/50">
            <Button 
              type="submit" 
              disabled={isLoading} 
              className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              size="lg"
            >
              {isLoading ? (
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
              onClick={onCancel} 
              disabled={isLoading}
              className="px-8 border-2 hover:bg-muted/50 transition-all duration-200"
              size="lg"
            >
              Cancel
            </Button>
          </div>
      </form>
    </div>
  );
}
