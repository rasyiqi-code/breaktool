import { prisma } from '@/lib/prisma'

export interface UserBadge {
  id: string
  name: string
  icon: string
  description: string
  category: 'role' | 'achievement' | 'status' | 'activity'
  priority: number // Higher number = higher priority for display
}

export class BadgeService {
  // Define all available badges
  private static readonly BADGES: Record<string, UserBadge> = {
    // Role-based badges
    'super_admin': {
      id: 'super_admin',
      name: 'Super Admin',
      icon: '🛡️',
      description: 'Platform Super Administrator',
      category: 'role',
      priority: 100
    },
    'admin': {
      id: 'admin',
      name: 'Admin',
      icon: '🛡️',
      description: 'Platform Administrator',
      category: 'role',
      priority: 90
    },
    'vendor': {
      id: 'vendor',
      name: 'Vendor',
      icon: '🏢',
      description: 'Approved Vendor',
      category: 'role',
      priority: 80
    },
    'verified_tester': {
      id: 'verified_tester',
      name: 'Verified Tester',
      icon: '✅',
      description: 'Verified Testing Expert',
      category: 'role',
      priority: 70
    },
    'new_user': {
      id: 'new_user',
      name: 'New Member',
      icon: '👋',
      description: 'Welcome to the community!',
      category: 'status',
      priority: 10
    },
    
    // Trust score badges
    'top_expert': {
      id: 'top_expert',
      name: 'Top Expert',
      icon: '🔥',
      description: 'Exceptional expertise and contributions',
      category: 'achievement',
      priority: 95
    },
    'verified_expert': {
      id: 'verified_expert',
      name: 'Verified Expert',
      icon: '⭐',
      description: 'High-quality contributions',
      category: 'achievement',
      priority: 85
    },
    'trusted_reviewer': {
      id: 'trusted_reviewer',
      name: 'Trusted Reviewer',
      icon: '📝',
      description: 'Reliable and helpful reviews',
      category: 'achievement',
      priority: 75
    },
    'active_contributor': {
      id: 'active_contributor',
      name: 'Active Contributor',
      icon: '💪',
      description: 'Regular community contributor',
      category: 'activity',
      priority: 65
    },
    
    // Status badges
    'verification_pending': {
      id: 'verification_pending',
      name: 'Verification Pending',
      icon: '⏳',
      description: 'Verification application under review',
      category: 'status',
      priority: 30
    },
    'vendor_pending': {
      id: 'vendor_pending',
      name: 'Vendor Application Pending',
      icon: '📋',
      description: 'Vendor application under review',
      category: 'status',
      priority: 35
    }
  }

  // Get all badges for a user
  static async getUserBadges(userId: string): Promise<UserBadge[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          role: true,
          isVerifiedTester: true,
          verificationStatus: true,
          vendorStatus: true,
          trustScore: true,
          badges: true,
          createdAt: true,
          helpfulVotesReceived: true
        }
      })

      if (!user) return []

      const badges: UserBadge[] = []

      // Role-based badges
      if (user.role) {
        const roleBadge = this.BADGES[user.role]
        if (roleBadge) {
          badges.push(roleBadge)
        }
      }

      // Trust score badges
      const trustScore = user.trustScore || 0
      if (trustScore >= 90) {
        badges.push(this.BADGES.top_expert)
      } else if (trustScore >= 80) {
        badges.push(this.BADGES.verified_expert)
      } else if (trustScore >= 70) {
        badges.push(this.BADGES.trusted_reviewer)
      } else if (trustScore >= 50) {
        badges.push(this.BADGES.active_contributor)
      }

      // Status badges
      // Only show verification_pending for non-vendor users
      if (user.verificationStatus === 'pending' && user.role !== 'vendor') {
        badges.push(this.BADGES.verification_pending)
      }
      
      if (user.vendorStatus === 'pending') {
        badges.push(this.BADGES.vendor_pending)
      }

      // New user badge (for users created within last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      if (user.createdAt > thirtyDaysAgo && user.role === 'user') {
        badges.push(this.BADGES.new_user)
      }

      // Sort badges by priority (highest first)
      return badges.sort((a, b) => b.priority - a.priority)
    } catch (error) {
      console.error('Error getting user badges:', error)
      return []
    }
  }

  // Auto-assign badges when user status changes
  static async updateUserBadges(userId: string): Promise<string[]> {
    try {
      const badges = await this.getUserBadges(userId)
      const badgeIds = badges.map(badge => badge.id)

      // Update user's badges in database
      await prisma.user.update({
        where: { id: userId },
        data: {
          badges: badgeIds,
          updatedAt: new Date()
        }
      })

      return badgeIds
    } catch (error) {
      console.error('Error updating user badges:', error)
      return []
    }
  }

  // Get badge details by ID
  static getBadgeById(badgeId: string): UserBadge | null {
    return this.BADGES[badgeId] || null
  }

  // Get all available badges
  static getAllBadges(): UserBadge[] {
    return Object.values(this.BADGES)
  }

  // Auto-assign badges for new user registration
  static async assignNewUserBadges(userId: string): Promise<void> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true }
      })

      if (!user) return

      // Assign new user badge for regular users
      if (user.role === 'user') {
        await this.updateUserBadges(userId)
      }
    } catch (error) {
      console.error('Error assigning new user badges:', error)
    }
  }

  // Auto-assign badges when verification status changes
  static async assignVerificationBadges(userId: string, status: string): Promise<void> {
    try {
      if (status === 'approved') {
        // Remove pending badge and add verified tester badge
        await this.updateUserBadges(userId)
      } else if (status === 'pending') {
        // Add pending verification badge
        await this.updateUserBadges(userId)
      }
    } catch (error) {
      console.error('Error assigning verification badges:', error)
    }
  }

  // Auto-assign badges when vendor status changes
  static async assignVendorBadges(userId: string, status: string): Promise<void> {
    try {
      if (status === 'approved') {
        // Remove pending badge and add vendor badge
        await this.updateUserBadges(userId)
      } else if (status === 'pending') {
        // Add pending vendor badge
        await this.updateUserBadges(userId)
      }
    } catch (error) {
      console.error('Error assigning vendor badges:', error)
    }
  }

  // Format badges for display
  static formatBadgesForDisplay(badges: UserBadge[], maxDisplay: number = 3): {
    displayed: UserBadge[]
    remaining: number
  } {
    const displayed = badges.slice(0, maxDisplay)
    const remaining = Math.max(0, badges.length - maxDisplay)
    
    return { displayed, remaining }
  }
}