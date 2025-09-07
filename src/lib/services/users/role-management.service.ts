import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserRoleInfo {
  id: string;
  userId: string;
  role: string;
  isActive: boolean;
  grantedAt: Date;
  grantedBy?: string | null;
}

export interface UserWithRoles {
  id: string;
  email: string;
  name?: string | null;
  primaryRole?: string | null;
  activeRole?: string | null;
  roleSwitchedAt?: Date | null;
  userRoles: UserRoleInfo[];
}

export class RoleManagementService {
  /**
   * Get user with all their roles
   */
  static async getUserWithRoles(userId: string): Promise<UserWithRoles | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          primaryRole: true,
          activeRole: true,
          roleSwitchedAt: true,
          userRoles: {
            select: {
              id: true,
              userId: true,
              role: true,
              isActive: true,
              grantedAt: true,
              grantedBy: true
            },
            orderBy: { grantedAt: 'desc' }
          },
          vendorApplications: {
            where: { status: 'approved' },
            select: { id: true }
          },
          verificationRequests: {
            where: { status: 'approved' },
            select: { id: true }
          }
        }
      });

      if (user) {
        // Add application flags
        (user as UserWithRoles & { hasVendorApplication?: boolean; hasVerificationRequest?: boolean }).hasVendorApplication = user.vendorApplications.length > 0;
        (user as UserWithRoles & { hasVendorApplication?: boolean; hasVerificationRequest?: boolean }).hasVerificationRequest = user.verificationRequests.length > 0;
      }

      return user as UserWithRoles;
    } catch (error) {
      console.error('Error getting user with roles:', error);
      throw error;
    }
  }

  /**
   * Get user's available roles (active roles)
   */
  static async getUserAvailableRoles(userId: string): Promise<string[]> {
    try {
      const userRoles = await prisma.userRole.findMany({
        where: {
          userId: userId,
          isActive: true
        },
        select: {
          role: true
        },
        orderBy: { grantedAt: 'desc' }
      });

      return userRoles.map(ur => ur.role);
    } catch (error) {
      console.error('Error getting user available roles:', error);
      throw error;
    }
  }

  /**
   * Switch user's active role
   */
  static async switchUserRole(userId: string, newRole: string): Promise<boolean> {
    try {
      // Check if user has this role
      const userRole = await prisma.userRole.findUnique({
        where: {
          userId_role: {
            userId: userId,
            role: newRole
          }
        }
      });

      if (!userRole || !userRole.isActive) {
        throw new Error(`User does not have access to role: ${newRole}`);
      }

      // Update user's active role
      await prisma.user.update({
        where: { id: userId },
        data: {
          activeRole: newRole,
          roleSwitchedAt: new Date()
        }
      });

      return true;
    } catch (error) {
      console.error('Error switching user role:', error);
      throw error;
    }
  }

  /**
   * Grant a new role to user
   */
  static async grantRoleToUser(
    userId: string, 
    role: string, 
    grantedBy: string
  ): Promise<UserRoleInfo> {
    try {
      // Check if user already has this role
      const existingRole = await prisma.userRole.findUnique({
        where: {
          userId_role: {
            userId: userId,
            role: role
          }
        }
      });

      if (existingRole) {
        // Reactivate existing role
        const updatedRole = await prisma.userRole.update({
          where: { id: existingRole.id },
          data: {
            isActive: true,
            grantedAt: new Date(),
            grantedBy: grantedBy,
            updatedAt: new Date()
          }
        });

        return updatedRole;
      } else {
        // Create new role
        const newRole = await prisma.userRole.create({
          data: {
            userId: userId,
            role: role,
            isActive: true,
            grantedBy: grantedBy
          }
        });

        return newRole;
      }
    } catch (error) {
      console.error('Error granting role to user:', error);
      throw error;
    }
  }

  /**
   * Revoke a role from user
   */
  static async revokeRoleFromUser(userId: string, role: string): Promise<boolean> {
    try {
      const userRole = await prisma.userRole.findUnique({
        where: {
          userId_role: {
            userId: userId,
            role: role
          }
        }
      });

      if (!userRole) {
        throw new Error(`User does not have role: ${role}`);
      }

      // Deactivate role instead of deleting
      await prisma.userRole.update({
        where: { id: userRole.id },
        data: {
          isActive: false,
          updatedAt: new Date()
        }
      });

      // If this was the active role, switch to primary role
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { activeRole: true, primaryRole: true }
      });

      if (user?.activeRole === role && user?.primaryRole) {
        await this.switchUserRole(userId, user.primaryRole);
      }

      return true;
    } catch (error) {
      console.error('Error revoking role from user:', error);
      throw error;
    }
  }

  /**
   * Check if user has specific role
   */
  static async userHasRole(userId: string, role: string): Promise<boolean> {
    try {
      const userRole = await prisma.userRole.findUnique({
        where: {
          userId_role: {
            userId: userId,
            role: role
          }
        }
      });

      return userRole ? userRole.isActive : false;
    } catch (error) {
      console.error('Error checking user role:', error);
      return false;
    }
  }

  /**
   * Get user's current active role
   */
  static async getUserActiveRole(userId: string): Promise<string | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { activeRole: true }
      });

      return user?.activeRole || null;
    } catch (error) {
      console.error('Error getting user active role:', error);
      return null;
    }
  }

  /**
   * Get all users with specific role
   */
  static async getUsersWithRole(role: string): Promise<UserWithRoles[]> {
    try {
      const users = await prisma.user.findMany({
        where: {
          userRoles: {
            some: {
              role: role,
              isActive: true
            }
          }
        },
        select: {
          id: true,
          email: true,
          name: true,
          primaryRole: true,
          activeRole: true,
          roleSwitchedAt: true,
          userRoles: {
            select: {
              id: true,
              userId: true,
              role: true,
              isActive: true,
              grantedAt: true,
              grantedBy: true
            },
            orderBy: { grantedAt: 'desc' }
          }
        }
      });

      return users;
    } catch (error) {
      console.error('Error getting users with role:', error);
      throw error;
    }
  }
}
