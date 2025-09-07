"use client"

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react'
import type { TrustScore } from '@/lib/services/reviews/trust-score.service'

interface TrustLeaderboardProps {
  limit?: number
  className?: string
}

export function TrustLeaderboard({ limit = 10, className = '' }: TrustLeaderboardProps) {
  const [topUsers, setTopUsers] = useState<TrustScore[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTopUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/community/trust-score/top-users?limit=${limit}`)
      if (response.ok) {
        const data = await response.json()
        setTopUsers(data)
      }
    } catch (error) {
      console.error('Error fetching top users:', error)
    } finally {
      setLoading(false)
    }
  }, [limit])

  useEffect(() => {
    fetchTopUsers()
  }, [fetchTopUsers])

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />
      default:
        return <span className="text-sm font-medium text-muted-foreground">#{index + 1}</span>
    }
  }

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300'
      case 1:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300'
      case 2:
        return 'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300'
      default:
        return 'bg-background border-border'
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Top Trusted Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: limit }).map((_, i) => (
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Top Trusted Users
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topUsers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No trusted users yet</p>
              <p className="text-sm">Start reviewing tools to build your trust score!</p>
            </div>
          ) : (
            topUsers.map((user, index) => (
              <div
                key={user.userId}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${getRankColor(index)}`}
              >
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(index)}
                </div>
                
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.profileImageUrl} />
                  <AvatarFallback>
                    {user.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">
                      {user.displayName || 'Anonymous User'}
                    </span>
                    {user.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {user.badge}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {user.factors?.reviewCount || 0} reviews • {user.factors?.helpfulVotesReceived || 0} helpful votes
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-lg font-bold">{user.score}</div>
                  <div className="text-xs text-muted-foreground">/ 100</div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {topUsers.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={fetchTopUsers}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Refresh leaderboard
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
