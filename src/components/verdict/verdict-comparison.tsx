"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertTriangle, XCircle, HelpCircle, TrendingUp, RefreshCw } from 'lucide-react'
import type { ToolVerdict } from '@/lib/services/reviews/verdict-aggregation.service'

interface VerdictComparisonProps {
  toolIds: string[]
  className?: string
}

export function VerdictComparison({ toolIds, className = '' }: VerdictComparisonProps) {
  const [verdicts, setVerdicts] = useState<ToolVerdict[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchVerdicts = useCallback(async () => {
    try {
      setLoading(true)
      const promises = toolIds.map(toolId => 
        fetch(`/api/verdict?toolId=${toolId}&action=get`).then(res => res.json())
      )
      const results = await Promise.all(promises)
      setVerdicts(results.filter(v => v !== null))
    } catch (error) {
      console.error('Error fetching verdicts:', error)
    } finally {
      setLoading(false)
    }
  }, [toolIds])

  useEffect(() => {
    fetchVerdicts()
  }, [fetchVerdicts])

  const refreshVerdicts = async () => {
    try {
      setRefreshing(true)
      const promises = toolIds.map(toolId => 
        fetch('/api/verdict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toolId })
        }).then(res => res.json())
      )
      const results = await Promise.all(promises)
      setVerdicts(results.filter(v => v !== null))
    } catch (error) {
      console.error('Error refreshing verdicts:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'keep':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'try':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />
      case 'stop':
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <HelpCircle className="w-4 h-4 text-gray-600" />
    }
  }

  // const getVerdictColor = (verdict: string) => {
  //   switch (verdict) {
  //     case 'keep':
  //       return 'bg-green-100 text-green-800 border-green-200'
  //     case 'try':
  //       return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  //     case 'stop':
  //       return 'bg-red-100 text-red-800 border-red-200'
  //     default:
  //       return 'bg-gray-100 text-gray-800 border-gray-200'
  //   }
  // }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    if (confidence >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Verdict Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {toolIds.map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-24"></div>
                  <div className="h-3 bg-muted rounded w-16"></div>
                </div>
                <div className="h-6 bg-muted rounded w-12"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (verdicts.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Verdict Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <HelpCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No verdicts available for comparison</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshVerdicts}
              disabled={refreshing}
              className="mt-2"
            >
              {refreshing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <TrendingUp className="w-4 h-4 mr-2" />
              )}
              Calculate All Verdicts
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Sort verdicts by confidence (highest first)
  const sortedVerdicts = [...verdicts].sort((a, b) => b.confidence - a.confidence)

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Verdict Comparison</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refreshVerdicts}
            disabled={refreshing}
          >
            {refreshing ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedVerdicts.map((verdict, index) => (
            <div
              key={verdict.toolId}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                index === 0 ? 'bg-gradient-to-r from-green-50 to-green-100 border-green-200' : 'bg-background'
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8">
                {index === 0 && <Badge variant="secondary" className="text-xs">#1</Badge>}
                {index === 1 && <Badge variant="outline" className="text-xs">#2</Badge>}
                {index === 2 && <Badge variant="outline" className="text-xs">#3</Badge>}
                {index > 2 && <span className="text-xs text-muted-foreground">#{index + 1}</span>}
              </div>
              
              <div className="flex items-center gap-2">
                {getVerdictIcon(verdict.verdict)}
                <span className="font-medium capitalize">{verdict.verdict.replace('_', ' ')}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="text-sm text-muted-foreground">
                  {verdict.factors?.totalReviews || 0} reviews • {verdict.factors?.averageRating?.toFixed(1) || '0.0'}/5.0
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {verdict.explanation}
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-bold ${getConfidenceColor(verdict.confidence)}`}>
                  {verdict.confidence}%
                </div>
                <div className="text-xs text-muted-foreground">Confidence</div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <div className="text-xs text-muted-foreground">
            <p>• Verdicts are calculated based on review ratings, reviewer types, and review quality</p>
            <p>• Higher confidence indicates more reliable recommendations</p>
            <p>• Verified tester and admin reviews carry more weight</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
