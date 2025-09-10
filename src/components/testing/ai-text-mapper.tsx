'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { FileText, MapPin, Loader2, CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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

interface AITextMapperProps {
  formData: FormData;
  onFormDataUpdate: (updates: Partial<FormData>) => void;
  isAdmin: boolean;
}

export function AITextMapper({ formData, onFormDataUpdate, isAdmin }: AITextMapperProps) {
  const [testNotes, setTestNotes] = useState('');
  const [isMapping, setIsMapping] = useState(false);
  const [mappedData, setMappedData] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { toast } = useToast();

  if (!isAdmin) {
    return null;
  }

  const mapTextToFields = async () => {
    if (!testNotes.trim()) {
      toast({
        title: 'Error',
        description: 'Please paste your test notes first before mapping.',
        variant: 'destructive',
      });
      return;
    }

    setIsMapping(true);
    setMappedData(null);

    try {
      const response = await fetch('/api/testing/ai-map-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: testNotes,
          currentFormData: formData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to map text to fields');
      }

      const data = await response.json();
      setMappedData(data);
      
      toast({
        title: 'Success',
        description: 'AI has successfully mapped your text to form fields!',
      });
    } catch (error) {
      console.error('Error mapping text:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to map text to fields. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsMapping(false);
    }
  };

  const applyMappedData = (field?: string) => {
    if (!mappedData) return;

    if (field) {
      // Apply specific field
      if (mappedData[field] !== undefined) {
        onFormDataUpdate({ [field]: mappedData[field] });
        toast({
          title: 'Applied',
          description: `${field} has been updated with mapped data.`,
        });
      }
    } else {
      // Apply all mapped data
      onFormDataUpdate(mappedData);
      toast({
        title: 'Applied',
        description: 'All mapped data has been applied to the form.',
      });
    }
  };

  const clearNotes = () => {
    setTestNotes('');
    setMappedData(null);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(testNotes);
    toast({
      title: 'Copied',
      description: 'Test notes copied to clipboard.',
    });
  };

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
            <MapPin className="h-6 w-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-orange-900 dark:text-orange-100">
              AI Text Mapper
            </CardTitle>
            <CardDescription className="text-orange-700 dark:text-orange-300">
              Paste your test notes and let AI map them to form fields automatically
            </CardDescription>
          </div>
          <div className="ml-auto flex gap-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
              Smart Mapping
            </Badge>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              Admin Only
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Text Input Area */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">Test Notes & Observations</Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                disabled={!testNotes.trim()}
                className="border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:border-orange-600 dark:hover:bg-orange-950/20"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearNotes}
                disabled={!testNotes.trim()}
                className="border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:border-orange-600 dark:hover:bg-orange-950/20"
              >
                Clear
              </Button>
            </div>
          </div>
          
          <Textarea
            value={testNotes}
            onChange={(e) => setTestNotes(e.target.value)}
            placeholder="Paste your test notes, observations, or any text about the tool here...

Example:
- Tool is very easy to use, took only 5 minutes to set up
- Great performance, fast loading times
- Excellent documentation and support
- Some bugs in the mobile version
- Overall score: 8/10
- Would recommend for small teams
- Pros: Easy setup, good UI, fast
- Cons: Limited customization, expensive
- Use cases: Project management, team collaboration"
            rows={8}
            className="border-orange-200 focus:border-orange-300 dark:border-orange-700 dark:focus:border-orange-600"
          />
          
          <div className="flex items-center gap-2 text-sm text-orange-700 dark:text-orange-300">
            <FileText className="h-4 w-4" />
            <span>Paste any text about your testing experience - AI will intelligently map it to the appropriate form fields</span>
          </div>
        </div>

        {/* Mapping Button */}
        <div className="flex gap-3">
          <Button
            onClick={mapTextToFields}
            disabled={isMapping || !testNotes.trim()}
            className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
          >
            {isMapping ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                AI is mapping your text...
              </>
            ) : (
              <>
                <MapPin className="h-4 w-4 mr-2" />
                Map Text to Form Fields
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="border-orange-200 hover:border-orange-300 hover:bg-orange-50 dark:border-orange-700 dark:hover:border-orange-600 dark:hover:bg-orange-950/20"
          >
            {showAdvanced ? 'Hide' : 'Show'} Advanced
          </Button>
        </div>

        {/* Advanced Options */}
        {showAdvanced && (
          <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">Advanced Mapping Options</h4>
            <div className="space-y-2 text-sm text-orange-700 dark:text-orange-300">
              <p>• AI will automatically detect scores, ratings, and numerical values</p>
              <p>• Identifies pros/cons, recommendations, and use cases</p>
              <p>• Maps qualitative assessments to appropriate dropdown values</p>
              <p>• Extracts key insights and technical details</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isMapping && (
          <div className="flex items-center justify-center gap-2 p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-700">
            <Loader2 className="h-4 w-4 animate-spin text-orange-600 dark:text-orange-400" />
            <span className="text-sm text-orange-700 dark:text-orange-300">
              AI is analyzing your text and mapping it to form fields...
            </span>
          </div>
        )}

        {/* Mapped Results */}
        {mappedData && (
          <div className="space-y-4 p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-800 dark:text-green-200">
                AI Mapping Complete
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                <Button
                  size="sm"
                  onClick={() => applyMappedData()}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Apply All Mapped Data
                </Button>
                {Object.keys(mappedData).map((key) => (
                  <Button
                    key={key}
                    size="sm"
                    variant="outline"
                    onClick={() => applyMappedData(key)}
                    className="border-green-200 hover:border-green-300 hover:bg-green-50 dark:border-green-700 dark:hover:border-green-600 dark:hover:bg-green-950/20"
                  >
                    Apply {key}
                  </Button>
                ))}
              </div>
              
              <div className="text-xs text-green-700 dark:text-green-300">
                <strong>Mapped Fields:</strong> {Object.keys(mappedData).join(', ')}
              </div>
              
              <details className="text-xs text-green-700 dark:text-green-300">
                <summary className="cursor-pointer font-medium">View Mapped Data Preview</summary>
                <pre className="mt-2 p-2 bg-green-100 dark:bg-green-900/30 rounded text-xs overflow-auto max-h-32">
                  {JSON.stringify(mappedData, null, 2)}
                </pre>
              </details>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div className="text-sm text-blue-700 dark:text-blue-300">
              <p className="font-medium mb-1">How it works:</p>
              <ul className="space-y-1 text-xs">
                <li>• Paste any text about your testing experience</li>
                <li>• AI analyzes the text and identifies relevant information</li>
                <li>• Maps the information to appropriate form fields</li>
                <li>• Review and apply the mapped data to your form</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
