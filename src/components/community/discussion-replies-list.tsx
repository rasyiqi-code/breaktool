'use client'

import { useDiscussionReplies } from '@/hooks/use-discussion-replies'
import { DiscussionReply } from '@/components/community/discussion-reply'
import { useUser } from '@stackframe/stack'

interface DiscussionRepliesListProps {
  discussionId: string
}

export function DiscussionRepliesList({ discussionId }: DiscussionRepliesListProps) {
  const user = useUser()
  const {
    replies,
    isLoading,
    error,
    submitReply,
    deleteReply,
    isSubmitting,
    isDeleting,
    submitError,
    deleteError
  } = useDiscussionReplies(discussionId)

  const handleReply = async (content: string, parentReplyId?: string) => {
    try {
      await submitReply(content, parentReplyId)
    } catch (error) {
      console.error('Error submitting reply:', error)
    }
  }

  const handleDelete = async (replyId: string) => {
    try {
      await deleteReply(replyId)
    } catch (error) {
      console.error('Error deleting reply:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">Loading replies...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-destructive">Error loading replies: {error.message}</div>
      </div>
    )
  }

  if (replies.length === 0) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-muted-foreground">No replies yet. Be the first to reply!</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {replies.map((reply) => (
        <DiscussionReply
          key={reply.id}
          reply={reply}
          discussionId={discussionId}
          user={user ? { id: user.id, name: user.displayName || 'User', profileImageUrl: user.profileImageUrl || undefined } : undefined}
          onReply={handleReply}
          onDelete={handleDelete}
          isSubmitting={isSubmitting}
          isDeleting={isDeleting}
        />
      ))}
      
      {submitError && (
        <div className="text-sm text-destructive">
          Error submitting reply: {submitError.message}
        </div>
      )}
      
      {deleteError && (
        <div className="text-sm text-destructive">
          Error deleting reply: {deleteError.message}
        </div>
      )}
    </div>
  )
}
