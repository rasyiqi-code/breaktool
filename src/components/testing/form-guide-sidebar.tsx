'use client';

import { BookOpen, Lightbulb, CheckCircle, AlertCircle, Info, Star, Target, Users, Clock, Shield, Zap } from 'lucide-react';

export function FormGuideSidebar() {
  return (
    <div className="w-full xl:w-80 bg-gradient-to-b from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl p-4 sm:p-6 border border-blue-200/50 dark:border-blue-800/50">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Form Guide</h3>
      </div>
      
      <div className="space-y-6">
        {/* Basic Information Guide */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-blue-600" />
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Basic Information</h4>
          </div>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Choose the tool you want to test from the dropdown</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Write a clear, descriptive title for your report</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle className="h-3 w-3 mt-0.5 text-green-500 flex-shrink-0" />
              <span>Provide a brief summary of your testing experience</span>
            </div>
          </div>
        </div>

        {/* Scoring Guide */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-600" />
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Scoring (1-10)</h4>
          </div>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <div className="flex items-start gap-2">
              <Target className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
              <span><strong>Overall:</strong> General impression and overall value</span>
            </div>
            <div className="flex items-start gap-2">
              <Target className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
              <span><strong>Value:</strong> Cost-effectiveness and ROI</span>
            </div>
            <div className="flex items-start gap-2">
              <Target className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
              <span><strong>Usage:</strong> Ease of use and user experience</span>
            </div>
            <div className="flex items-start gap-2">
              <Target className="h-3 w-3 mt-0.5 text-yellow-500 flex-shrink-0" />
              <span><strong>Integration:</strong> How well it works with other tools</span>
            </div>
          </div>
        </div>

        {/* Additional Information Guide */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-purple-600" />
            <h4 className="font-medium text-blue-900 dark:text-blue-100">Additional Info</h4>
          </div>
          <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
            <div className="flex items-start gap-2">
              <Clock className="h-3 w-3 mt-0.5 text-purple-500 flex-shrink-0" />
              <span><strong>Setup Time:</strong> How long to get started</span>
            </div>
            <div className="flex items-start gap-2">
              <Users className="h-3 w-3 mt-0.5 text-purple-500 flex-shrink-0" />
              <span><strong>Learning Curve:</strong> Difficulty to master</span>
            </div>
            <div className="flex items-start gap-2">
              <Shield className="h-3 w-3 mt-0.5 text-purple-500 flex-shrink-0" />
              <span><strong>Security:</strong> Data protection and privacy</span>
            </div>
            <div className="flex items-start gap-2">
              <Zap className="h-3 w-3 mt-0.5 text-purple-500 flex-shrink-0" />
              <span><strong>Performance:</strong> Speed and reliability</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="h-4 w-4 text-amber-600" />
            <h4 className="font-medium text-amber-900 dark:text-amber-100">Pro Tips</h4>
          </div>
          <div className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3 w-3 mt-0.5 text-amber-500 flex-shrink-0" />
              <span>Be honest and objective in your assessment</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3 w-3 mt-0.5 text-amber-500 flex-shrink-0" />
              <span>Include specific examples and use cases</span>
            </div>
            <div className="flex items-start gap-2">
              <AlertCircle className="h-3 w-3 mt-0.5 text-amber-500 flex-shrink-0" />
              <span>Test all major features before scoring</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
