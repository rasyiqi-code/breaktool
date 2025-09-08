'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  MessageSquare, 
  Clock, 
  Eye, 
  Plus,
  Pin,
  Star,
  Award
} from 'lucide-react'
import { useUser } from '@stackframe/stack'
import { DiscussionRepliesList } from '@/components/community/discussion-replies-list'
import { DiscussionForm } from '@/components/community/discussion-form'

interface Discussion {
  id: string
  title: string
  content: string
  toolId: string
  userId: string
  status: string
  isPinned: boolean
  isFeatured: boolean
  viewCount: number
  replyCount: number
  lastReplyAt?: Date
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    name?: string
    avatarUrl?: string
    role: string
    trustScore: number
    isVerifiedTester: boolean
  }
}

interface DiscussionListProps {
  toolId: string
  toolName: string
  onStartDiscussion?: () => void
  readOnly?: boolean
}

export function DiscussionListWithReactQuery({ 
  toolId, 
  toolName,
  readOnly = false
}: DiscussionListProps) {
  const user = useUser()
  const [discussions, setDiscussions] = useState<Discussion[]>([])
  const [loading, setLoading] = useState(true)
  const [showDiscussionForm, setShowDiscussionForm] = useState(false)

  const loadDiscussions = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/community/discussions?toolId=${toolId}`)
      
      if (!response.ok) {
        throw new Error('Failed to load discussions')
      }

      const data = await response.json()
      setDiscussions(data.discussions || [])
    } catch (error) {
      console.error('Error loading discussions:', error)
    } finally {
      setLoading(false)
    }
  }, [toolId])

  useEffect(() => {
    loadDiscussions()
  }, [loadDiscussions])

  const handleDiscussionCreated = useCallback(async () => {
    setShowDiscussionForm(false)
    loadDiscussions()
  }, [loadDiscussions])

  const formatTimeAgo = (date: Date | string) => {
    if (!date) return 'Unknown'
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date)
      if (isNaN(dateObj.getTime())) return 'Unknown'
      
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
      
      if (diffInSeconds < 60) return 'Just now'
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
      
      return dateObj.toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Loading discussions...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Discussion Form */}
      {showDiscussionForm && (
        <div className="mb-6">
          <DiscussionForm
            toolId={toolId}
            toolName={toolName}
            onSubmit={handleDiscussionCreated}
            onCancel={() => setShowDiscussionForm(false)}
          />
        </div>
      )}

      {/* Start Discussion Button */}
      {!showDiscussionForm && user && (
        <div className="mb-6">
          <Button
            onClick={() => setShowDiscussionForm(true)}
            className="w-full sm:w-auto"
            variant="outline"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start Discussion
          </Button>
        </div>
      )}

      {/* Discussions List */}
      {discussions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">No discussions yet</h3>
          <p className="text-sm mb-4">Be the first to start a discussion about {toolName}</p>
          {user && (
            <Button onClick={() => setShowDiscussionForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Start Discussion
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion) => (
            <div key={discussion.id} className="border-b border-border pb-6 mb-6">
              {/* Discussion Header */}
              <div className="flex items-start gap-3 mb-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={discussion.user?.avatarUrl} />
                  <AvatarFallback className="bg-green-500 text-white text-xs">
                    {discussion.user?.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm truncate">
                      {discussion.title}
                    </h4>
                    {discussion.isPinned && (
                      <Pin className="w-3 h-3 text-blue-500" />
                    )}
                    {discussion.isFeatured && (
                      <Star className="w-3 h-3 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <span className="truncate">{discussion.user?.name || 'Anonymous'}</span>
                    <Badge variant="secondary" className="text-xs px-1 py-0">
                      {discussion.user?.role || 'User'}
                    </Badge>
                    {discussion.user?.isVerifiedTester && (
                      <Award className="w-3 h-3 text-green-500" />
                    )}
                    <span>•</span>
                    <span>{formatTimeAgo(discussion.createdAt)}</span>
                  </div>
                  
                  <p className="text-sm text-foreground mb-3 line-clamp-2">
                    {discussion.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      <span>{discussion.replyCount} replies</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{discussion.viewCount} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(discussion.lastReplyAt || discussion.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Replies Section */}
              <div className="mt-4 pl-11">
                <DiscussionRepliesList discussionId={discussion.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
