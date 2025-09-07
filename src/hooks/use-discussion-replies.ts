import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useUser } from '@stackframe/stack'

interface ReplyData {
  discussionId: string
  content: string
  parentReplyId?: string
}

interface DiscussionReply {
  id: string
  discussionId: string
  userId: string
  content: string
  parentReplyId?: string
  isSolution: boolean
  helpfulVotes: number
  totalVotes: number
  status: string
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
  childReplies?: DiscussionReply[]
}

export function useDiscussionReplies(discussionId: string) {
  const queryClient = useQueryClient()
  const user = useUser()

  // Fetch replies
  const {
    data: replies = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['discussion-replies', discussionId],
    queryFn: async (): Promise<DiscussionReply[]> => {
      console.log('Fetching replies for discussion:', discussionId)
      const response = await fetch(`/api/community/discussions/replies?discussionId=${discussionId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch replies')
      }

      const data = await response.json()
      console.log('Raw API response:', data.replies?.length, 'replies')
      console.log('Raw replies data:', data.replies?.map((r: DiscussionReply) => ({ id: r.id, content: r.content, parentReplyId: r.parentReplyId })))
      
      // Deduplicate replies by ID
      const seenIds = new Set<string>()
      const deduplicatedReplies = (data.replies || []).filter((reply: DiscussionReply) => {
        if (seenIds.has(reply.id)) {
          console.log('Duplicate reply found and skipped:', reply.id)
          return false
        }
        seenIds.add(reply.id)
        return true
      })

      console.log('After deduplication:', deduplicatedReplies.length, 'replies')
      console.log('Deduplicated replies:', deduplicatedReplies.map((r: DiscussionReply) => ({ id: r.id, content: r.content, parentReplyId: r.parentReplyId })))
      return deduplicatedReplies
    },
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  })

  // Submit reply mutation
  const submitReplyMutation = useMutation({
    mutationFn: async (replyData: ReplyData): Promise<DiscussionReply> => {
      console.log('Submitting reply:', replyData)
      
      const response = await fetch('/api/community/discussions/replies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(replyData),
      })

      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Submit reply failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        throw new Error(`Failed to submit reply: ${response.status} ${response.statusText}`)
      }

      const newReply = await response.json()
      console.log('Reply submitted successfully:', newReply)
      return newReply
    },
    onMutate: async (replyData) => {
      console.log('Optimistic update: Adding reply to cache', replyData)
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['discussion-replies', discussionId] })

      // Snapshot the previous value
      const previousReplies = queryClient.getQueryData(['discussion-replies', discussionId])
      console.log('Previous replies before optimistic update:', previousReplies)

      // Optimistically update to the new value
      queryClient.setQueryData(['discussion-replies', discussionId], (old: DiscussionReply[] = []) => {
        console.log('Current replies in cache:', old.map(r => ({ id: r.id, content: r.content, parentReplyId: r.parentReplyId })))
        const optimisticReply: DiscussionReply = {
          id: `temp-${Date.now()}`,
          discussionId: replyData.discussionId,
          userId: user?.id || '',
          content: replyData.content,
          parentReplyId: replyData.parentReplyId,
          isSolution: false,
          helpfulVotes: 0,
          totalVotes: 0,
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
          user: user ? {
            id: user.id,
            name: user.displayName || 'User',
            avatarUrl: user.profileImageUrl || undefined,
            role: 'User',
            trustScore: 0,
            isVerifiedTester: false
          } : undefined
        }

        if (replyData.parentReplyId) {
          // Add as child reply (supports nested replies)
          console.log('Adding as child reply to parent:', replyData.parentReplyId)
          
          const addReplyToParent = (replies: DiscussionReply[], parentId: string): DiscussionReply[] => {
            return replies.map(reply => {
              if (reply.id === parentId) {
                return {
                  ...reply,
                  childReplies: [...(reply.childReplies || []), optimisticReply]
                }
              }
              if (reply.childReplies && reply.childReplies.length > 0) {
                return {
                  ...reply,
                  childReplies: addReplyToParent(reply.childReplies, parentId)
                }
              }
              return reply
            })
          }
          
          const updatedReplies = addReplyToParent(old, replyData.parentReplyId)
          console.log('Updated replies after adding child:', updatedReplies.map(r => ({ id: r.id, content: r.content, parentReplyId: r.parentReplyId, childCount: r.childReplies?.length || 0 })))
          return updatedReplies
        } else {
          // Add as top-level reply
          console.log('Adding as top-level reply')
          const updatedReplies = [...old, optimisticReply]
          console.log('Updated replies after adding top-level:', updatedReplies.map(r => ({ id: r.id, content: r.content, parentReplyId: r.parentReplyId })))
          return updatedReplies
        }
      })

      // Return a context object with the snapshotted value
      return { previousReplies }
    },
    onSuccess: (newReply, variables) => {
      console.log('Reply submitted successfully, updating cache with real data:', newReply)
      // Update the optimistic reply with real data
      queryClient.setQueryData(['discussion-replies', discussionId], (old: DiscussionReply[] = []) => {
        if (variables.parentReplyId) {
          // Update child reply (supports nested replies)
          const updateReplyInParent = (replies: DiscussionReply[], parentId: string): DiscussionReply[] => {
            return replies.map(reply => {
              if (reply.id === parentId) {
                return {
                  ...reply,
                  childReplies: reply.childReplies?.map(child => 
                    child.id.startsWith('temp-') ? newReply : child
                  ) || []
                }
              }
              if (reply.childReplies && reply.childReplies.length > 0) {
                return {
                  ...reply,
                  childReplies: updateReplyInParent(reply.childReplies, parentId)
                }
              }
              return reply
            })
          }
          return updateReplyInParent(old, variables.parentReplyId)
        } else {
          // Update top-level reply
          return old.map(reply => 
            reply.id.startsWith('temp-') ? newReply : reply
          )
        }
      })
    },
    onError: (err, variables, context) => {
      console.error('Error submitting reply:', err)
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousReplies) {
        queryClient.setQueryData(['discussion-replies', discussionId], context.previousReplies)
      }
    }
  })

  // Delete reply mutation
  const deleteReplyMutation = useMutation({
    mutationFn: async (replyId: string): Promise<void> => {
      console.log('Deleting reply:', replyId)
      
      const response = await fetch(`/api/community/discussions/replies/${replyId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('Delete reply failed:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        })
        throw new Error(`Failed to delete reply: ${response.status} ${response.statusText}`)
      }

      console.log('Reply deleted successfully')
    },
    onMutate: async (replyId) => {
      console.log('Optimistic delete: Removing reply from cache', replyId)
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['discussion-replies', discussionId] })

      // Snapshot the previous value
      const previousReplies = queryClient.getQueryData(['discussion-replies', discussionId])

      // Optimistically remove the reply (supports nested replies)
      const removeReplyFromParent = (replies: DiscussionReply[], targetId: string): DiscussionReply[] => {
        return replies.map(reply => {
          if (reply.id === targetId) {
            return null // Mark for removal
          }
          if (reply.childReplies && reply.childReplies.length > 0) {
            return {
              ...reply,
              childReplies: removeReplyFromParent(reply.childReplies, targetId).filter(Boolean) as DiscussionReply[]
            }
          }
          return reply
        }).filter(Boolean) as DiscussionReply[]
      }
      
      queryClient.setQueryData(['discussion-replies', discussionId], (old: DiscussionReply[] = []) => {
        return removeReplyFromParent(old, replyId)
      })

      return { previousReplies }
    },
    onSuccess: () => {
      console.log('Reply deleted successfully')
    },
    onError: (error, replyId, context) => {
      console.error('Error deleting reply:', error)
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousReplies) {
        queryClient.setQueryData(['discussion-replies', discussionId], context.previousReplies)
      }
    }
  })

  const submitReply = useCallback(async (content: string, parentReplyId?: string) => {
    if (!content.trim()) return
    
    return submitReplyMutation.mutateAsync({
      discussionId,
      content: content.trim(),
      parentReplyId
    })
  }, [discussionId, submitReplyMutation])

  const deleteReply = useCallback(async (replyId: string) => {
    return deleteReplyMutation.mutateAsync(replyId)
  }, [deleteReplyMutation])

  return {
    replies,
    isLoading,
    error,
    submitReply,
    deleteReply,
    isSubmitting: submitReplyMutation.isPending,
    isDeleting: deleteReplyMutation.isPending,
    submitError: submitReplyMutation.error,
    deleteError: deleteReplyMutation.error
  }
}
