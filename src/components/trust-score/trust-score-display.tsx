"use client"

import { useState, useEffect, useCallback } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { RefreshCw, TrendingUp, Star, Award, Clock, MessageSquare } from 'lucide-react'
import type { TrustScore } from '@/lib/services/reviews/trust-score.service'

interface TrustScoreDisplayProps {
  userId: string
  showDetails?: boolean
  className?: string
}

export function TrustScoreDisplay({ userId, showDetails = false, className = '' }: TrustScoreDisplayProps) {
  const [trustScore, setTrustScore] = useState<TrustScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [calculating, setCalculating] = useState(false)

  const fetchTrustScore = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/trust-score?userId=${userId}&action=get`)
      if (response.ok) {
        const data = await response.json()
        setTrustScore(data)
      }
    } catch (error) {
      console.error('Error fetching trust score:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchTrustScore()
  }, [fetchTrustScore])

  const calculateTrustScore = async () => {
    try {
      setCalculating(true)
      const response = await fetch('/api/trust-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })
      if (response.ok) {
        const data = await response.json()
        setTrustScore(data)
      }
    } catch (error) {
      console.error('Error calculating trust score:', error)
    } finally {
      setCalculating(false)
    }
  }

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-muted rounded w-24 mb-2"></div>
        <div className="h-2 bg-muted rounded w-full"></div>
      </div>
    )
  }

  if (!trustScore) {
    return (
      <div className={className}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={calculateTrustScore}
          disabled={calculating}
        >
          {calculating ? (
            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <TrendingUp className="w-4 h-4 mr-2" />
          )}
          Calculate Trust Score
        </Button>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{trustScore.score}</span>
          <span className="text-sm text-muted-foreground">/ 100</span>
        </div>
        {trustScore.badge && (
          <Badge variant="secondary" className="ml-2">
            {trustScore.badge}
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={calculateTrustScore}
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

      <Progress value={trustScore.score} className="mb-2" />

      {showDetails && trustScore.factors && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm">Trust Score Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <TrustScoreFactor
              label="Review Count"
              value={trustScore.factors.reviewCount}
              maxValue={10}
              icon={<MessageSquare className="w-4 h-4" />}
            />
            <TrustScoreFactor
              label="Review Quality"
              value={Math.round(trustScore.factors.reviewQuality * 100)}
              maxValue={100}
              icon={<Star className="w-4 h-4" />}
              suffix="%"
            />
            <TrustScoreFactor
              label="Helpful Votes"
              value={trustScore.factors.helpfulVotesReceived}
              maxValue={50}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <TrustScoreFactor
              label="Activity Recency"
              value={Math.round(trustScore.factors.activityRecency * 100)}
              maxValue={100}
              icon={<Clock className="w-4 h-4" />}
              suffix="%"
            />
            {trustScore.factors.verifiedExpertise && (
              <div className="flex items-center gap-2 text-sm">
                <Award className="w-4 h-4 text-green-600" />
                <span>Verified Expert</span>
                <Badge variant="outline" className="ml-auto">+25 points</Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-muted-foreground mt-2">
        Last updated: {new Date(trustScore.lastCalculated).toLocaleDateString()}
      </div>
    </div>
  )
}

interface TrustScoreFactorProps {
  label: string
  value: number
  maxValue: number
  icon: React.ReactNode
  suffix?: string
}

function TrustScoreFactor({ label, value, maxValue, icon, suffix = '' }: TrustScoreFactorProps) {
  const percentage = Math.min((value / maxValue) * 100, 100)
  
  return (
    <div className="flex items-center gap-2 text-sm">
      {icon}
      <span className="flex-1">{label}</span>
      <span className="font-medium">
        {value}{suffix}
      </span>
      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
