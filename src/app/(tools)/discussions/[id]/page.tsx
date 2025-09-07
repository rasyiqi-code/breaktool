'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  MessageSquare, 
  Clock, 
  Eye, 
  ThumbsUp, 
  ThumbsDown,
  Reply,
  CheckCircle
} from 'lucide-react'
import { useUser } from '@stackframe/stack'
import { Discussion, DiscussionReply } from '@/lib/services/community/discussions.service'

export default function DiscussionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const user = useUser()
  const discussionId = params.id as string
  
  const [discussion, setDiscussion] = useState<Discussion | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [nestedReplyContent, setNestedReplyContent] = useState('')
  const [submittingNestedReply, setSubmittingNestedReply] = useState(false)

  const loadDiscussion = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/community/discussions/${discussionId}`)
      
      if (!response.ok) {
        throw new Error('Discussion not found')
      }

      const data = await response.json()
      setDiscussion(data)
    } catch (error) {
      console.error('Error loading discussion:', error)
      setError('Failed to load discussion')
    } finally {
      setLoading(false)
    }
  }, [discussionId])

  useEffect(() => {
    if (discussionId) {
      loadDiscussion()
    }
  }, [discussionId, loadDiscussion])

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user?.id || !discussion?.id || !replyContent.trim()) return
    
    try {
      setSubmittingReply(true)
      const response = await fetch('/api/community/discussions/replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discussionId: discussion.id,
          content: replyContent.trim(),
          parentReplyId: null
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit reply')
      }

      setReplyContent('')
      await loadDiscussion() // Reload to get updated replies
    } catch (error) {
      console.error('Error submitting reply:', error)
      alert('Failed to submit reply. Please try again.')
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleSubmitNestedReply = async (parentReplyId: string) => {
    if (!user?.id || !discussion?.id || !nestedReplyContent.trim()) return
    
    try {
      setSubmittingNestedReply(true)
      const response = await fetch('/api/community/discussions/replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          discussionId: discussion.id,
          content: nestedReplyContent.trim(),
          parentReplyId: parentReplyId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit reply')
      }

      setNestedReplyContent('')
      setReplyingTo(null)
      await loadDiscussion() // Reload to get updated replies
    } catch (error) {
      console.error('Error submitting nested reply:', error)
      alert('Failed to submit reply. Please try again.')
    } finally {
      setSubmittingNestedReply(false)
    }
  }

  const handleVoteReply = async (replyId: string, voteType: 'helpful' | 'not_helpful') => {
    if (!user?.id) return
    
    try {
      const response = await fetch('/api/community/discussions/replies/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          replyId,
          voteType
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to vote')
      }

      await loadDiscussion() // Reload to get updated vote counts
    } catch (error) {
      console.error('Error voting on reply:', error)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown Date'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Invalid Date'
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return 'Invalid Date'
    }
  }

  const formatTimeAgo = (dateString: string) => {
    if (!dateString) return 'Unknown'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Unknown'
      
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
      
      if (diffInSeconds < 60) return 'Just now'
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`
      
      return formatDate(dateString)
    } catch {
      return 'Unknown'
    }
  }

  const renderReply = (reply: DiscussionReply, depth: number = 0) => {
    const maxDepth = 3 // Maximum nesting depth
    const canReply = depth < maxDepth

    return (
      <div key={reply.id} className={`${depth > 0 ? 'ml-6 border-l-2 border-muted pl-4' : ''}`}>
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={reply.user?.avatarUrl} />
                <AvatarFallback>
                  {reply.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-sm">
                    {reply.user?.name || 'Anonymous'}
                  </span>
                  {reply.user?.isVerifiedTester && (
                    <Badge variant="secondary" className="text-xs">
                      Verified
                    </Badge>
                  )}
                  {reply.isSolution && (
                    <Badge variant="default" className="text-xs bg-green-500">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Solution
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(reply.createdAt.toString())}
                  </span>
                </div>
                
                <p className="text-sm mb-3 whitespace-pre-wrap">
                  {reply.content}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleVoteReply(reply.id, 'helpful')}
                    >
                      <ThumbsUp className="w-3 h-3" />
                    </Button>
                    <span>{reply.helpfulVotes}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleVoteReply(reply.id, 'not_helpful')}
                    >
                      <ThumbsDown className="w-3 h-3" />
                    </Button>
                    <span>{reply.totalVotes - reply.helpfulVotes}</span>
                  </div>
                  
                  {canReply && user && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={() => setReplyingTo(replyingTo === reply.id ? null : reply.id)}
                    >
                      <Reply className="w-3 h-3 mr-1" />
                      Reply
                    </Button>
                  )}
                </div>
                
                {/* Nested Reply Form */}
                {replyingTo === reply.id && user && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <Textarea
                      value={nestedReplyContent}
                      onChange={(e) => setNestedReplyContent(e.target.value)}
                      placeholder="Write your reply..."
                      rows={3}
                      className="mb-2"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setReplyingTo(null)
                          setNestedReplyContent('')
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSubmitNestedReply(reply.id)}
                        disabled={!nestedReplyContent.trim() || submittingNestedReply}
                      >
                        {submittingNestedReply ? 'Sending...' : 'Reply'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Render nested replies */}
        {reply.childReplies && reply.childReplies.length > 0 && (
          <div className="space-y-2">
            {reply.childReplies.map((childReply) => 
              renderReply(childReply, depth + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading discussion...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !discussion) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-20">
            <h1 className="text-2xl font-bold mb-4">Discussion Not Found</h1>
            <p className="text-muted-foreground mb-6">
              {error || 'The discussion you are looking for does not exist.'}
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Tool
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">{discussion.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Avatar className="h-5 w-5">
                <AvatarImage src={discussion.user?.avatarUrl} />
                <AvatarFallback className="text-xs">
                  {discussion.user?.name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <span>{discussion.user?.name || 'Anonymous'}</span>
              {discussion.user?.isVerifiedTester && (
                <Badge variant="secondary" className="text-xs">
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDate(discussion.createdAt.toString())}
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              {discussion.replyCount} replies
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {discussion.viewCount} views
            </div>
          </div>
        </div>

        {/* Discussion Content */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap">{discussion.content}</p>
            </div>
          </CardContent>
        </Card>

        {/* Replies Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">
            Replies ({discussion.replyCount})
          </h2>
          
          {/* Main Reply Form */}
          {user && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add a Reply</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitReply} className="space-y-4">
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Share your thoughts, ask questions, or provide help..."
                    rows={4}
                    className="resize-none"
                  />
                  <div className="flex items-center justify-end">
                    <Button
                      type="submit"
                      disabled={!replyContent.trim() || submittingReply}
                    >
                      {submittingReply ? 'Sending...' : 'Post Reply'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
          
          {/* Replies List */}
          <div className="space-y-4">
            {discussion.discussionReplies && discussion.discussionReplies.length > 0 ? (
              discussion.discussionReplies.map((reply) => renderReply(reply))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No replies yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  Be the first to reply to this discussion!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
