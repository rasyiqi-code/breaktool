import { prisma } from '@/lib/prisma'
import type { User } from '@/types/app'

export class UsersService {
  // Get user by ID
  static async getUserById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      })

      return user as unknown as User
    } catch (error) {
      console.error('Service error:', error)
      return null
    }
  }

  // Get user by email
  static async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email }
      })

      return user as unknown as User
    } catch (error) {
      console.error('Service error:', error)
      return null
    }
  }

  // Create new user
  static async createUser(data: {
    id: string
    email: string
    name?: string
    avatarUrl?: string
    role?: string
  }): Promise<User> {
    try {
      const user = await prisma.user.create({
        data
      })

      return user as unknown as User
    } catch (error) {
      console.error('Service error:', error)
      throw error
    }
  }

  // Update user
  static async updateUser(
    id: string,
    data: Partial<{
      name: string
      avatarUrl: string
      role: string
      trustScore: number
      badges: string[]
      bio: string
      company: string
      linkedinUrl: string
      websiteUrl: string
      location: string
      expertise: string[]
      isVerifiedTester: boolean
      verificationStatus: string
      verifiedAt: Date
      verifiedBy: string
      helpfulVotesReceived: number
    }>
  ): Promise<User> {
    try {
      const user = await prisma.user.update({
        where: { id },
        data
      })

      return user as unknown as User
    } catch (error) {
      console.error('Service error:', error)
      throw error
    }
  }

  // Get verified testers
  static async getVerifiedTesters(limit = 20): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        where: {
          isVerifiedTester: true,
          verificationStatus: 'approved'
        },
        orderBy: { trustScore: 'desc' },
        take: limit
      })

      return users as unknown as User[]
    } catch (error) {
      console.error('Service error:', error)
      return []
    }
  }

  // Get top reviewers
  static async getTopReviewers(limit = 20): Promise<User[]> {
    try {
      const users = await prisma.user.findMany({
        where: {
          trustScore: { gt: 0 }
        },
        orderBy: { trustScore: 'desc' },
        take: limit
      })

      return users as unknown as User[]
    } catch (error) {
      console.error('Service error:', error)
      return []
    }
  }

  // Update user trust score
  static async updateTrustScore(userId: string, newScore: number): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { trustScore: newScore }
      })
    } catch (error) {
      console.error('Service error:', error)
      throw error
    }
  }

  // Get users with pagination
  static async getUsers(options: {
    page?: number
    limit?: number
    role?: string
    verificationStatus?: string
    search?: string
  } = {}): Promise<{ users: User[], totalCount: number, totalPages: number, currentPage: number }> {
    try {
      const { page = 1, limit = 20, role, verificationStatus, search } = options
      const skip = (page - 1) * limit

      const where: Record<string, unknown> = {}

      if (role) {
        where.role = role
      }

      if (verificationStatus) {
        where.verificationStatus = verificationStatus
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } }
        ]
      }

      const [users, totalCount] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit
        }),
        prisma.user.count({ where })
      ])

      return {
        users: users as unknown as User[],
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page
      }
    } catch (error) {
      console.error('Service error:', error)
      return {
        users: [] as User[],
        totalCount: 0,
        totalPages: 0,
        currentPage: options.page || 1
      }
    }
  }
}
