import { prisma } from '@/lib/prisma'
import type {
  ToolWithCategory,
  ToolWithDetails
} from '@/types/app'

// Helper function to transform Prisma Decimal objects to numbers
function transformPrismaData(data: unknown): unknown {
  if (data === null || data === undefined) return data
  
  if (typeof data === 'object' && data !== null) {
    // Check for Decimal object (has s, e, d properties)
    if ('s' in data && 'e' in data && 'd' in data) {
      return Number(data)
    }
    
    // Check for Decimal constructor
    if (data.constructor && data.constructor.name === 'Decimal') {
      return Number(data)
    }
    
    if (Array.isArray(data)) {
      return data.map(transformPrismaData)
    }
    
    const transformed: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(data)) {
      transformed[key] = transformPrismaData(value)
    }
    return transformed
  }
  
  return data
}

export class ToolsService {
  // Get all tools with pagination and filtering
  static async getTools({
    page = 1,
    limit = 20,
    category,
    search,
    verdict,
    featured,
    priceRange,
    features,
    showFeatured,
    showTrending,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  }: {
    page?: number
    limit?: number
    category?: string
    search?: string
    verdict?: string
    featured?: boolean
    priceRange?: string
    features?: string[]
    showFeatured?: boolean
    showTrending?: boolean
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
  } = {}) {
    try {
      const skip = (page - 1) * limit
      
      // Build where conditions
      const where: Record<string, unknown> = {
        status: 'active'
      }

      if (category) {
        where.categoryId = category
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { hasSome: [search] } }
        ]
      }

      if (verdict) {
        where.verdict = verdict
      }

      if (featured !== undefined) {
        where.featured = featured
      }

      // Price range filter
      if (priceRange) {
        where.pricingModel = priceRange
      }

      // Features filter
      if (features && features.length > 0) {
        where.tags = { hasSome: features }
      }

      // Show featured tools
      if (showFeatured) {
        where.featured = true
      }

      // Show trending tools (based on recent activity)
      if (showTrending) {
        where.upvotes = { gte: 10 }
      }

      // Build order by
      const orderBy: Record<string, unknown> = {}
      if (sortBy === 'totalReviews') {
        orderBy.totalReviews = sortOrder
      } else {
        orderBy[sortBy] = sortOrder
      }

      const [tools, totalCount] = await Promise.all([
        prisma.tool.findMany({
          where,
          include: {
            category: true
          },
          orderBy,
          skip,
          take: limit
        }),
        prisma.tool.count({ where })
      ])

      // Transform Decimal objects to numbers
      const transformedTools = transformPrismaData(tools)

      return {
        tools: transformedTools as unknown as ToolWithCategory[],
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
      }
    } catch (error) {
      console.error('Service error:', error)
      return {
        tools: [] as ToolWithCategory[],
        totalCount: 0,
        totalPages: 0,
        currentPage: page
      }
    }
  }

  // Get single tool by ID with full details
  static async getToolById(id: string): Promise<ToolWithDetails | null> {
    try {
      const tool = await prisma.tool.findUnique({
        where: { id },
        include: {
          category: true,
          reviews: {
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
            where: { status: 'active' },
            orderBy: { createdAt: 'desc' }
          }
        }
      })

      if (!tool) return null

      // Transform Decimal objects to numbers
      const transformedTool = transformPrismaData(tool)

      return transformedTool as unknown as ToolWithDetails
    } catch (error) {
      console.error('Error in getToolById:', error)
      return null
    }
  }

  // Get tool by slug
  static async getToolBySlug(slug: string): Promise<ToolWithDetails | null> {
    try {
      const tool = await prisma.tool.findUnique({
        where: { slug },
        include: {
          category: true
          // Removed reviews include for better performance - reviews will be loaded separately
        }
      })

      if (!tool) return null

      // Transform Decimal objects to numbers
      const transformedTool = transformPrismaData(tool)

      return transformedTool as unknown as ToolWithDetails
    } catch (error) {
      console.error('Error in getToolBySlug:', error)
      return null
    }
  }

  // Get featured tools
  static async getFeaturedTools(limit = 6): Promise<ToolWithCategory[]> {
    try {
      const tools = await prisma.tool.findMany({
        where: {
          status: 'active',
          featured: true
        },
        include: {
          category: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      // Transform Decimal objects to numbers
      const transformedTools = transformPrismaData(tools)

      return transformedTools as unknown as ToolWithCategory[]
    } catch (error) {
      console.error('Service error:', error)
      return []
    }
  }

  // Get trending tools (based on recent reviews and upvotes)
  static async getTrendingTools(limit = 6): Promise<ToolWithCategory[]> {
    try {
      const tools = await prisma.tool.findMany({
        where: {
          status: 'active'
        },
        include: {
          category: true
        },
        orderBy: [
          { upvotes: 'desc' },
          { totalReviews: 'desc' }
        ],
        take: limit
      })

      // Transform Decimal objects to numbers
      const transformedTools = transformPrismaData(tools)

      return transformedTools as unknown as ToolWithCategory[]
    } catch (error) {
      console.error('Service error:', error)
      return []
    }
  }

  // Get tools by category
  static async getToolsByCategory(categorySlug: string, limit = 20): Promise<ToolWithCategory[]> {
    try {
      const tools = await prisma.tool.findMany({
        where: {
          status: 'active',
          category: {
            slug: categorySlug
          }
        },
        include: {
          category: true
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      })

      // Transform Decimal objects to numbers
      const transformedTools = transformPrismaData(tools)

      return transformedTools as unknown as ToolWithCategory[]
    } catch (error) {
      console.error('Service error:', error)
      return []
    }
  }

  // Search tools
  static async searchTools(query: string, limit = 20): Promise<ToolWithCategory[]> {
    try {
      const tools = await prisma.tool.findMany({
        where: {
          status: 'active',
          OR: [
            { name: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        include: {
          category: true
        },
        orderBy: { upvotes: 'desc' },
        take: limit
      })

      // Transform Decimal objects to numbers
      const transformedTools = transformPrismaData(tools)

      return transformedTools as unknown as ToolWithCategory[]
    } catch (error) {
      console.error('Service error:', error)
      return []
    }
  }

  // Upvote a tool
  static async upvoteTool(toolId: string, userId: string): Promise<void> {
    try {
      // Check if user already upvoted
      const existingVote = await prisma.toolUpvote.findUnique({
        where: {
          toolId_userId: {
            toolId,
            userId
          }
        }
      })

      if (existingVote) {
        // Remove upvote
        await prisma.$transaction([
          prisma.toolUpvote.delete({
            where: {
              toolId_userId: {
                toolId,
                userId
              }
            }
          }),
          prisma.tool.update({
            where: { id: toolId },
            data: { upvotes: { decrement: 1 } }
          })
        ])
      } else {
        // Add upvote
        await prisma.$transaction([
          prisma.toolUpvote.create({
            data: { toolId, userId }
          }),
          prisma.tool.update({
            where: { id: toolId },
            data: { upvotes: { increment: 1 } }
          })
        ])
      }
    } catch (error) {
      console.error('Error in upvoteTool:', error)
      throw error
    }
  }

  // Get user's upvoted tools
  static async getUserUpvotedTools(userId: string): Promise<string[]> {
    try {
      const upvotes = await prisma.toolUpvote.findMany({
        where: { userId },
        select: { toolId: true }
      })

      return upvotes.map(vote => vote.toolId)
    } catch (error) {
      console.error('Error in getUserUpvotedTools:', error)
      return []
    }
  }
}
