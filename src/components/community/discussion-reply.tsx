'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { 
  ThumbsUp, 
  ThumbsDown,
  Reply,
  CheckCircle,
  MoreHorizontal,
  Trash2
} from 'lucide-react'
import { useUser } from '@stackframe/stack'

interface DiscussionReplyProps {
  discussionId: string
  reply: {
    id: string
    content: string
    helpfulVotes: number
    totalVotes: number
    isSolution: boolean
    createdAt: string | Date
    user?: {
      id: string
      name?: string
      avatarUrl?: string
      role: string
      isVerifiedTester: boolean
    }
    childReplies?: DiscussionReplyProps['reply'][]
  }
  depth?: number
  user?: { id: string; name: string; profileImageUrl?: string }
  onReply?: (content: string, parentReplyId?: string) => Promise<void>
  onVote?: (replyId: string, voteType: 'helpful' | 'not_helpful') => Promise<void>
  onDelete?: (replyId: string) => Promise<void>
  isSubmitting?: boolean
  isDeleting?: boolean
}

export function DiscussionReply({ 
  discussionId,
  reply, 
  depth = 0, 
  user,
  onReply, 
  onVote,
  onDelete,
  isSubmitting = false,
  isDeleting = false
}: DiscussionReplyProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [voting, setVoting] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const currentUser = useUser()
  const activeUser = user || currentUser

  const maxDepth = 3
  const canReply = depth < maxDepth && activeUser
  const canDelete = activeUser && reply.user?.id === activeUser.id

  const formatTimeAgo = (date: string | Date) => {
    if (!date) return 'Unknown'
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date)
      if (isNaN(dateObj.getTime())) return 'Unknown'
      
      const now = new Date()
      const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)
      
      if (diffInSeconds < 60) return 'Just now'
      if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`
      if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`
      if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d`
      
      return dateObj.toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!onReply || !replyContent.trim() || submitting || isSubmitting) {
      console.log('Reply submission blocked:', { onReply: !!onReply, content: replyContent.trim(), submitting, isSubmitting })
      return
    }
    
    console.log('Submitting reply:', { content: replyContent.trim(), parentReplyId: reply.id })
    
    try {
      setSubmitting(true)
      await onReply(replyContent.trim(), reply.id)
      setReplyContent('')
      setShowReplyForm(false)
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleVote = async (voteType: 'helpful' | 'not_helpful') => {
    if (!onVote || voting) return
    
    try {
      setVoting(true)
      await onVote(reply.id, voteType)
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setVoting(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete || deleting || isDeleting || !canDelete) return
    
    if (!confirm('Are you sure you want to delete this comment?')) return
    
    try {
      setDeleting(true)
      await onDelete(reply.id)
    } catch (error) {
      console.error('Error deleting comment:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-gray-100' : ''}`}>
      <div className="py-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-7 w-7 mt-1">
            <AvatarImage src={reply.user?.avatarUrl} />
            <AvatarFallback className="text-xs">
              {reply.user?.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm">
                {reply.user?.name || 'Anonymous'}
              </span>
              {reply.user?.isVerifiedTester && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                  Maker
                </Badge>
              )}
              {reply.isSolution && (
                <Badge variant="default" className="text-xs bg-green-500 px-1.5 py-0.5">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Solution
                </Badge>
              )}
              <span className="text-xs text-foreground">
                {formatTimeAgo(reply.createdAt)}
              </span>
            </div>
            
            <p className="text-sm text-foreground mb-2 whitespace-pre-wrap">
              {reply.content}
            </p>
            
            <div className="flex items-center gap-3 text-xs text-foreground">
              <button
                onClick={() => handleVote('helpful')}
                disabled={voting}
                className="flex items-center gap-1 hover:text-blue-600 transition-colors"
              >
                <ThumbsUp className="w-3 h-3" />
                Upvote ({reply.helpfulVotes})
              </button>
              
              <button
                onClick={() => handleVote('not_helpful')}
                disabled={voting}
                className="flex items-center gap-1 hover:text-red-600 transition-colors"
              >
                <ThumbsDown className="w-3 h-3" />
                ({reply.totalVotes - reply.helpfulVotes})
              </button>
              
              {canReply && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <Reply className="w-3 h-3" />
                  Reply
                </button>
              )}
              
              {canDelete && (
                <button
                  onClick={handleDelete}
                  disabled={deleting || isDeleting}
                  className="flex items-center gap-1 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-3 h-3" />
                  {deleting || isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              )}
              
              <button className="flex items-center gap-1 hover:text-gray-600 transition-colors">
                <MoreHorizontal className="w-3 h-3" />
              </button>
            </div>
            
            {/* Reply Form */}
            {showReplyForm && canReply && (
              <div className="mt-3 p-3 bg-background">
                <form 
                  key={`reply-form-${reply.id}`}
                  onSubmit={handleSubmitReply} 
                  className="space-y-3"
                >
                  <Textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write your reply..."
                    rows={3}
                    className="resize-none text-foreground placeholder:text-muted-foreground"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowReplyForm(false)
                        setReplyContent('')
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      size="sm"
                      disabled={!replyContent.trim() || submitting || isSubmitting}
                    >
                      {submitting || isSubmitting ? 'Sending...' : 'Reply'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Nested Replies */}
      {reply.childReplies && reply.childReplies.length > 0 && (
        <div className="space-y-0">
          {reply.childReplies.map((childReply) => (
            <DiscussionReply
              key={childReply.id}
              discussionId={discussionId}
              reply={childReply}
              depth={depth + 1}
              user={activeUser ? { 
                id: activeUser.id, 
                name: (activeUser as { displayName?: string; name?: string }).displayName || (activeUser as { displayName?: string; name?: string }).name || 'User', 
                profileImageUrl: (activeUser as { profileImageUrl?: string }).profileImageUrl || undefined 
              } : undefined}
              onReply={onReply}
              onVote={onVote}
              onDelete={onDelete}
              isSubmitting={isSubmitting}
              isDeleting={isDeleting}
            />
          ))}
        </div>
      )}
    </div>
  )
}
