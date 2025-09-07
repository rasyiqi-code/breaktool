"use client"

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, HelpCircle, TrendingUp, Users, Star } from 'lucide-react'
import type { ToolVerdict } from '@/lib/services/reviews/verdict-aggregation.service'

interface VerdictDisplayProps {
  toolId: string
  showDetails?: boolean
  className?: string
  autoCalculate?: boolean
}

export function VerdictDisplay({ toolId, showDetails = false, className = '' }: VerdictDisplayProps) {
  const [verdict, setVerdict] = useState<ToolVerdict | null>(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)


  const fetchVerdict = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/verdict?toolId=${toolId}&action=get`)
      if (response.ok) {
        const data = await response.json()
        setVerdict(data)
      }
    } catch (error) {
      console.error('Error fetching verdict:', error)
    } finally {
      setLoading(false)
    }
  }, [toolId])

  useEffect(() => {
    fetchVerdict()
  }, [fetchVerdict])

  const calculateVerdict = async () => {
    try {
      setCalculating(true)
      const response = await fetch('/api/verdict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolId, action: 'calculate' })
      })
      if (response.ok) {
        const data = await response.json()
        setVerdict(data)
      } else {
        console.error('Failed to calculate verdict:', response.status)
      }
    } catch (error) {
      console.error('Error calculating verdict:', error)
    } finally {
      setCalculating(false)
    }
  }

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'keep':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'try':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'stop':
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <HelpCircle className="w-5 h-5 text-gray-600" />
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'keep':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'try':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'stop':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // const getConfidenceColor = (confidence: number) => {
  //   if (confidence >= 80) return 'text-green-600'
  //   if (confidence >= 60) return 'text-yellow-600'
  //   if (confidence >= 40) return 'text-orange-600'
  //   return 'text-red-600'
  // }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-muted rounded w-24 mb-2"></div>
        <div className="h-2 bg-muted rounded w-full"></div>
      </div>
    )
  }

  if (!verdict) {
    return (
      <div className={className}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={calculateVerdict}
          disabled={calculating}
        >
          {calculating ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <TrendingUp className="w-4 h-4 mr-2" />
          )}
          Calculate Verdict
        </Button>
      </div>
    )
  }

  // Handle null or missing verdict data
  if (!verdict || !verdict.verdict) {
    return (
      <div className={className}>
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="w-5 h-5 text-gray-600" />
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-muted-foreground">No Verdict Available</span>
            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
              Not Calculated
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={calculateVerdict}
            disabled={calculating}
            className="ml-auto"
          >
            {calculating ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Click the refresh button to calculate a verdict based on reviews and ratings.
        </p>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-3">
        {getVerdictIcon(verdict.verdict)}
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold capitalize">
            {verdict.verdict ? verdict.verdict.replace('_', ' ') : 'Unknown'}
          </span>
          <Badge variant="outline" className={getVerdictColor(verdict.verdict)}>
            {verdict.confidence || 0}% Confidence
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={calculateVerdict}
          disabled={calculating}
          className="ml-auto"
        >
          {calculating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>

      {verdict.confidence && <Progress value={verdict.confidence} className="mb-3" />}

      {verdict.explanation && (
        <p className="text-sm text-muted-foreground mb-3">
          {verdict.explanation}
        </p>
      )}

      {showDetails && verdict.factors && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Verdict Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {verdict.reviewBreakdown && (
              <VerdictFactor
                label="Review Distribution"
                value={`${verdict.reviewBreakdown.keep || 0} Keep • ${verdict.reviewBreakdown.try || 0} Try • ${verdict.reviewBreakdown.stop || 0} Stop`}
                icon={<Users className="w-4 h-4" />}
              />
            )}
            {verdict.factors?.averageRating && (
              <VerdictFactor
                label="Average Rating"
                value={`${verdict.factors.averageRating.toFixed(1)}/5.0`}
                icon={<Star className="w-4 h-4" />}
              />
            )}
            {verdict.factors?.totalReviews && (
              <VerdictFactor
                label="Total Reviews"
                value={verdict.factors.totalReviews.toString()}
                icon={<TrendingUp className="w-4 h-4" />}
              />
            )}
            {verdict.factors?.verifiedTesterReviews && (
              <VerdictFactor
                label="Verified Tester Reviews"
                value={verdict.factors.verifiedTesterReviews.toString()}
                icon={<CheckCircle className="w-4 h-4" />}
              />
            )}
            {verdict.factors?.adminReviews && (
              <VerdictFactor
                label="Admin Reviews"
                value={verdict.factors.adminReviews.toString()}
                icon={<Star className="w-4 h-4" />}
              />
            )}
            {verdict.factors?.reviewQuality && (
              <VerdictFactor
                label="Review Quality"
                value={`${Math.round(verdict.factors.reviewQuality * 100)}%`}
                icon={<TrendingUp className="w-4 h-4" />}
              />
            )}
          </CardContent>
        </Card>
      )}

      {verdict.lastCalculated && (
        <div className="text-xs text-muted-foreground mt-2">
          Last updated: {new Date(verdict.lastCalculated).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

interface VerdictFactorProps {
  label: string
  value: string
  icon: React.ReactNode
}

function VerdictFactor({ label, value, icon }: VerdictFactorProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <span className="flex-1">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
