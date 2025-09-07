'use client';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { FileText, Star, Info, Target, Plus, X } from 'lucide-react';

interface FormData {
  toolId: string;
  title: string;
  summary: string;
  detailedAnalysis: string;
  overallScore: number;
  valueScore: number;
  usageScore: number;
  integrationScore: number;
  recommendations: string;
  pros: string[];
  cons: string[];
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

interface FormSectionsProps {
  formData: FormData;
  tools: Array<{ id: string; name: string; slug: string }>;
  loadingTools: boolean;
  onInputChange: (field: string, value: string | string[]) => void;
  onArrayInputChange: (field: string, index: number, value: string) => void;
  onAddArrayItem: (field: string) => void;
  onRemoveArrayItem: (field: string, index: number) => void;
}

export function ToolSelectionSection({ formData, tools, loadingTools, onInputChange }: FormSectionsProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-blue-200/50">
        <div className="p-1.5 sm:p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <Target className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-blue-900 dark:text-blue-100">Tool Selection</h3>
      </div>
      <div className="space-y-2">
        <Label htmlFor="toolId" className="text-base font-medium">Select Tool to Test</Label>
        <Select 
          value={formData.toolId} 
          onValueChange={(value) => onInputChange('toolId', value)}
          disabled={loadingTools}
        >
          <SelectTrigger>
            <SelectValue placeholder={loadingTools ? "Loading tools..." : "Choose a tool to test"} />
          </SelectTrigger>
          <SelectContent>
            {Array.isArray(tools) && tools.map((tool) => (
              <SelectItem key={tool.id} value={tool.id}>
                {tool.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {loadingTools && (
          <p className="text-sm text-muted-foreground">Loading available tools...</p>
        )}
        {!loadingTools && (!Array.isArray(tools) || tools.length === 0) && (
          <p className="text-sm text-muted-foreground">No tools available. Please try again later.</p>
        )}
      </div>
    </div>
  );
}

export function ReportDetailsSection({ formData, onInputChange }: FormSectionsProps) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-green-200/50">
        <div className="p-1.5 sm:p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
          <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-green-900 dark:text-green-100">Report Details</h3>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="title" className="text-base font-medium">Report Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => onInputChange('title', e.target.value)}
          placeholder="Enter a descriptive title for your report"
        />
        <p className="text-sm text-muted-foreground">
          Leave empty to auto-generate based on selected tool
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary" className="text-base font-medium">Summary</Label>
        <Textarea
          id="summary"
          value={formData.summary}
          onChange={(e) => onInputChange('summary', e.target.value)}
          placeholder="Brief summary of your testing experience"
          rows={3}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="detailedAnalysis" className="text-base font-medium">Detailed Analysis</Label>
        <Textarea
          id="detailedAnalysis"
          value={formData.detailedAnalysis}
          onChange={(e) => onInputChange('detailedAnalysis', e.target.value)}
          placeholder="Provide a detailed analysis of the tool/service"
          rows={6}
          required
        />
      </div>
    </div>
  );
}

export function ScoringSection({ formData, onInputChange }: FormSectionsProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-yellow-200/50">
        <div className="p-1.5 sm:p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
          <Star className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-yellow-900 dark:text-yellow-100">Scoring (1-10)</h3>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="overallScore">Overall Score (1-10)</Label>
          <Input
            id="overallScore"
            type="number"
            min="1"
            max="10"
            value={formData.overallScore}
            onChange={(e) => onInputChange('overallScore', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="valueScore">Value Score (1-10)</Label>
          <Input
            id="valueScore"
            type="number"
            min="1"
            max="10"
            value={formData.valueScore}
            onChange={(e) => onInputChange('valueScore', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="usageScore">Usage Score (1-10)</Label>
          <Input
            id="usageScore"
            type="number"
            min="1"
            max="10"
            value={formData.usageScore}
            onChange={(e) => onInputChange('usageScore', e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="integrationScore">Integration Score (1-10)</Label>
          <Input
            id="integrationScore"
            type="number"
            min="1"
            max="10"
            value={formData.integrationScore}
            onChange={(e) => onInputChange('integrationScore', e.target.value)}
            required
          />
        </div>
      </div>
    </div>
  );
}

export function ProsConsSection({ formData, onArrayInputChange, onAddArrayItem, onRemoveArrayItem }: FormSectionsProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-3 pb-2 sm:pb-3 border-b border-emerald-200/50">
        <div className="p-1.5 sm:p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
          <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-emerald-900 dark:text-emerald-100">Pros & Cons</h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pros */}
        <div className="space-y-2">
          <Label>Pros</Label>
          {formData.pros.map((pro, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={pro}
                onChange={(e) => onArrayInputChange('pros', index, e.target.value)}
                placeholder={`Pro ${index + 1}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRemoveArrayItem('pros', index)}
                disabled={formData.pros.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAddArrayItem('pros')}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Pro
          </Button>
        </div>

        {/* Cons */}
        <div className="space-y-2">
          <Label>Cons</Label>
          {formData.cons.map((con, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={con}
                onChange={(e) => onArrayInputChange('cons', index, e.target.value)}
                placeholder={`Con ${index + 1}`}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onRemoveArrayItem('cons', index)}
                disabled={formData.cons.length === 1}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAddArrayItem('cons')}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Con
          </Button>
        </div>
      </div>
    </div>
  );
}

export function AdditionalInfoSection({ formData, onInputChange, onArrayInputChange, onAddArrayItem, onRemoveArrayItem }: FormSectionsProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Info className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-purple-900 dark:text-purple-100">Additional Information</h3>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <div className="space-y-2">
          <Label htmlFor="setupTime">Setup Time</Label>
          <Select value={formData.setupTime} onValueChange={(value) => onInputChange('setupTime', value)}>
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
          <Select value={formData.learningCurve} onValueChange={(value) => onInputChange('learningCurve', value)}>
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
          <Select value={formData.supportQuality} onValueChange={(value) => onInputChange('supportQuality', value)}>
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
        <div className="space-y-2">
          <Label htmlFor="documentation">Documentation Quality</Label>
          <Select value={formData.documentation} onValueChange={(value) => onInputChange('documentation', value)}>
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
          <Select value={formData.performance} onValueChange={(value) => onInputChange('performance', value)}>
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
        <div className="space-y-2">
          <Label htmlFor="security">Security</Label>
          <Select value={formData.security} onValueChange={(value) => onInputChange('security', value)}>
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
          <Select value={formData.scalability} onValueChange={(value) => onInputChange('scalability', value)}>
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
        <div className="space-y-2">
          <Label htmlFor="costEffectiveness">Cost Effectiveness</Label>
          <Select value={formData.costEffectiveness} onValueChange={(value) => onInputChange('costEffectiveness', value)}>
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

      <div className="space-y-2">
        <Label htmlFor="recommendations">Recommendations</Label>
        <Textarea
          id="recommendations"
          value={formData.recommendations}
          onChange={(e) => onInputChange('recommendations', e.target.value)}
          placeholder="Your recommendations for improvement"
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label>Use Cases</Label>
        {formData.useCases.map((useCase, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={useCase}
              onChange={(e) => onArrayInputChange('useCases', index, e.target.value)}
              placeholder={`Use case ${index + 1}`}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRemoveArrayItem('useCases', index)}
              disabled={formData.useCases.length === 1}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onAddArrayItem('useCases')}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Use Case
        </Button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="verdict">Final Verdict</Label>
        <Select value={formData.verdict} onValueChange={(value) => onInputChange('verdict', value)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select final verdict" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="highly-recommended">Highly Recommended</SelectItem>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="neutral">Neutral</SelectItem>
            <SelectItem value="not-recommended">Not Recommended</SelectItem>
            <SelectItem value="strongly-not-recommended">Strongly Not Recommended</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
