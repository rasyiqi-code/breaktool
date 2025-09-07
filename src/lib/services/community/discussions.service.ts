import { prisma } from '@/lib/prisma'

export interface Discussion {
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
  discussionReplies?: DiscussionReply[]
  discussionVotes?: DiscussionVote[]
}

export interface DiscussionReply {
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

export interface DiscussionVote {
  discussionId: string
  userId: string
  voteType: 'upvote' | 'downvote'
  createdAt: Date
}

export interface DiscussionReplyVote {
  replyId: string
  userId: string
  voteType: 'helpful' | 'not_helpful'
  createdAt: Date
}

export class DiscussionsService {
  // Get discussions for a tool
  static async getDiscussionsByToolId(
    toolId: string,
    options: {
      page?: number
      limit?: number
      sortBy?: string
      sortOrder?: 'asc' | 'desc'
    } = {}
  ) {
    try {
      const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options
      const skip = (page - 1) * limit

      const where = {
        toolId,
        status: 'active'
      }

      const orderBy: Record<string, 'asc' | 'desc'> = {}
      orderBy[sortBy] = sortOrder

      const discussions = await prisma.discussion.findMany({
        where,
        include: {
        user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
              trustScore: true,
              isVerifiedTester: true
            }
          }
        },
        orderBy,
        skip,
        take: limit
      })

      return {
        discussions: discussions as unknown as Discussion[],
        totalCount: discussions.length,
        totalPages: 1,
        currentPage: page
      }
    } catch (error) {
      console.error('Service error:', error)
      return {
        discussions: [] as Discussion[],
        totalCount: 0,
        totalPages: 0,
        currentPage: options.page || 1
      }
    }
  }

  // Get discussion replies only
  static async getDiscussionReplies(discussionId: string): Promise<DiscussionReply[]> {
    try {
      const replies = await prisma.discussionReply.findMany({
        where: { 
          discussionId,
          status: 'active',
          parentReplyId: null // Only top-level replies
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
              trustScore: true,
              isVerifiedTester: true
            }
          },
          childReplies: {
            where: { status: 'active' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  role: true,
                  trustScore: true,
                  isVerifiedTester: true
                }
              },
              childReplies: {
                where: { status: 'active' },
                include: {
                  user: {
                    select: {
                      id: true,
                      name: true,
                      avatarUrl: true,
                      role: true,
                      trustScore: true,
                      isVerifiedTester: true
                    }
                  }
                },
                orderBy: { createdAt: 'asc' }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        },
        orderBy: { createdAt: 'asc' }
      })

      console.log('Service: Fetched replies:', replies.length, 'top-level replies')
      return replies as unknown as DiscussionReply[]
    } catch (error) {
      console.error('Service error in getDiscussionReplies:', error)
      return []
    }
  }

  // Get discussion by ID with replies
  static async getDiscussionById(id: string): Promise<Discussion | null> {
    try {
      const discussion = await prisma.discussion.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
              trustScore: true,
              isVerifiedTester: true
            }
          },
          discussionReplies: {
            where: { status: 'active' },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  avatarUrl: true,
                  role: true,
                  trustScore: true,
                  isVerifiedTester: true
                }
              },
              childReplies: {
                where: { status: 'active' },
                include: {
        user: {
                    select: {
                      id: true,
                      name: true,
                      avatarUrl: true,
                      role: true,
                      trustScore: true,
                      isVerifiedTester: true
                    }
                  }
                },
                orderBy: { createdAt: 'asc' }
              }
            },
            orderBy: { createdAt: 'asc' }
          }
        }
      })

      return discussion as unknown as Discussion
    } catch (error) {
      console.error('Service error:', error)
      return null
    }
  }

  // Create new discussion
  static async createDiscussion(data: {
    title: string
    content: string
    toolId: string
    userId: string
  }): Promise<Discussion | null> {
    try {
      const discussion = await prisma.discussion.create({
        data,
        include: {
      user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
              trustScore: true,
              isVerifiedTester: true
            }
          }
        }
      })

      return discussion as unknown as Discussion
    } catch (error) {
      console.error('Service error:', error)
      return null
    }
  }

  // Create discussion reply
  static async createDiscussionReply(data: {
    discussionId: string
    userId: string
    content: string
    parentReplyId?: string
  }): Promise<DiscussionReply | null> {
    try {
      console.log('DiscussionsService.createDiscussionReply called with:', data)
      
      const reply = await prisma.discussionReply.create({
        data,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
              role: true,
              trustScore: true,
              isVerifiedTester: true
            }
          }
        }
      })

      console.log('Reply created successfully:', { id: reply.id })

      // Update discussion reply count and last reply time
      console.log('Updating discussion reply count...')
      await prisma.discussion.update({
        where: { id: data.discussionId },
        data: {
          replyCount: {
            increment: 1
          },
          lastReplyAt: new Date()
        }
      })

      console.log('Discussion updated successfully')
      return reply as unknown as DiscussionReply
    } catch (error) {
      console.error('Service error in createDiscussionReply:', error)
      console.error('Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        data
      })
      return null
    }
  }

  // Vote on discussion
  static async voteDiscussion(data: {
    discussionId: string
    userId: string
    voteType: 'upvote' | 'downvote'
  }): Promise<boolean> {
    try {
      await prisma.discussionVote.upsert({
        where: {
          discussionId_userId: {
            discussionId: data.discussionId,
            userId: data.userId
          }
        },
        update: {
          voteType: data.voteType
        },
        create: {
          discussionId: data.discussionId,
          userId: data.userId,
          voteType: data.voteType
        }
      })

      return true
    } catch (error) {
      console.error('Service error:', error)
      return false
    }
  }

  // Vote on discussion reply
  static async voteDiscussionReply(data: {
    replyId: string
    userId: string
    voteType: 'helpful' | 'not_helpful'
  }): Promise<boolean> {
    try {
      await prisma.discussionReplyVote.upsert({
        where: {
          replyId_userId: {
            replyId: data.replyId,
            userId: data.userId
          }
        },
        update: {
          voteType: data.voteType
        },
        create: {
          replyId: data.replyId,
          userId: data.userId,
          voteType: data.voteType
        }
      })

      // Update reply vote counts
      const votes = await prisma.discussionReplyVote.findMany({
        where: { replyId: data.replyId }
      })

      const helpfulVotes = votes.filter((v: { voteType: string }) => v.voteType === 'helpful').length
      const totalVotes = votes.length

      await prisma.discussionReply.update({
        where: { id: data.replyId },
        data: {
          helpfulVotes,
          totalVotes
        }
      })

      return true
    } catch (error) {
      console.error('Service error:', error)
      return false
    }
  }

  // Mark reply as solution
  static async markReplyAsSolution(replyId: string, discussionId: string): Promise<boolean> {
    try {
      // First, unmark all other solutions in this discussion
      await prisma.discussionReply.updateMany({
        where: {
          discussionId,
          isSolution: true
        },
        data: {
          isSolution: false
        }
      })

      // Mark this reply as solution
      await prisma.discussionReply.update({
        where: { id: replyId },
        data: {
          isSolution: true
        }
      })

      return true
    } catch (error) {
      console.error('Service error:', error)
      return false
    }
  }

  // Increment view count
  static async incrementViewCount(discussionId: string): Promise<void> {
    try {
      await prisma.discussion.update({
        where: { id: discussionId },
        data: {
          viewCount: {
            increment: 1
          }
        }
      })
    } catch (error) {
      console.error('Service error:', error)
    }
  }
}
