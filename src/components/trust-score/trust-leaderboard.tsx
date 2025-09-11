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
        return 'bg-gradient-to-r from-yellow-200 to-yellow-300 border-yellow-400 shadow-lg'
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
          <div className="space-y-2">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 p-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="w-10 h-10 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-muted rounded w-24"></div>
                  <div className="h-2 bg-muted rounded w-16"></div>
                </div>
                <div className="h-5 bg-muted rounded w-12"></div>
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
        <div className="space-y-2">
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
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${getRankColor(index)}`}
              >
                {/* Trophy/Rank Icon */}
                <div className="flex items-center justify-center w-8 h-8 flex-shrink-0">
                  {getRankIcon(index)}
                </div>
                
                {/* Avatar */}
                <Avatar className="w-10 h-10 flex-shrink-0">
                  <AvatarImage src={user.profileImageUrl} />
                  <AvatarFallback className="bg-gray-600 text-white font-semibold text-sm">
                    {user.displayName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-sm truncate text-gray-800">
                      {user.displayName || 'Anonymous User'}
                    </span>
                    {user.badge && (
                      <div className="w-5 h-5 bg-gray-800 rounded-md flex items-center justify-center">
                        <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-700">
                    {user.factors?.reviewCount || 0} reviews • {user.factors?.helpfulVotesReceived || 0} helpful votes
                  </div>
                </div>
                
                {/* Trust Score */}
                <div className="text-right flex-shrink-0">
                  <div className="text-xl font-bold text-gray-800">{user.score}</div>
                  <div className="text-xs text-gray-600">/ 100</div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {topUsers.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={fetchTopUsers}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Refresh leaderboard
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
