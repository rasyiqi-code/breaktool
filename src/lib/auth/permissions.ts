// Role-based permissions system
export type UserRole = 'admin' | 'super_admin' | 'user' | 'verified_tester' | 'vendor';

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface RolePermissions {
  role: UserRole;
  permissions: string[];
  description: string;
}

// Define all available permissions
export const PERMISSIONS = {
  // Tool Management
  'tools:read': { id: 'tools:read', name: 'View Tools', description: 'Can view all tools' },
  'tools:create': { id: 'tools:create', name: 'Create Tools', description: 'Can submit new tools' },
  'tools:update': { id: 'tools:update', name: 'Update Tools', description: 'Can update tool information' },
  'tools:delete': { id: 'tools:delete', name: 'Delete Tools', description: 'Can delete tools' },
  
  // Review System (Available to all users)
  'reviews:read': { id: 'reviews:read', name: 'Read Reviews', description: 'Can read all reviews' },
  'reviews:create': { id: 'reviews:create', name: 'Create Reviews', description: 'Can create reviews based on experience' },
  'reviews:update': { id: 'reviews:update', name: 'Update Reviews', description: 'Can update own reviews' },
  'reviews:delete': { id: 'reviews:delete', name: 'Delete Reviews', description: 'Can delete own reviews' },
  'reviews:vote': { id: 'reviews:vote', name: 'Vote Reviews', description: 'Can vote on reviews' },
  
  // Testing System (Only for verified testers and admins)
  'testing:access': { id: 'testing:access', name: 'Access Testing', description: 'Can access premium tools for testing' },
  'testing:create': { id: 'testing:create', name: 'Create Testing Reports', description: 'Can create detailed testing reports' },
  'testing:update': { id: 'testing:update', name: 'Update Testing Reports', description: 'Can update testing reports' },
  'testing:delete': { id: 'testing:delete', name: 'Delete Testing Reports', description: 'Can delete testing reports' },
  'testing:approve': { id: 'testing:approve', name: 'Approve Testing', description: 'Can approve testing reports' },
  
  // User Management
  'users:read': { id: 'users:read', name: 'Read Users', description: 'Can view user profiles' },
  'users:update': { id: 'users:update', name: 'Update Users', description: 'Can update user information' },
  'users:delete': { id: 'users:delete', name: 'Delete Users', description: 'Can delete users' },
  'users:verify': { id: 'users:verify', name: 'Verify Users', description: 'Can verify tester status' },
  
  // Admin Functions
  'admin:access': { id: 'admin:access', name: 'Admin Access', description: 'Can access admin dashboard' },
  'admin:moderate': { id: 'admin:moderate', name: 'Moderate Content', description: 'Can moderate reviews and discussions' },
  'admin:manage_users': { id: 'admin:manage_users', name: 'Manage Users', description: 'Can manage user accounts and roles' },
  'admin:analytics': { id: 'admin:analytics', name: 'View Analytics', description: 'Can view platform analytics' },
  
  // Vendor Functions
  'vendor:access': { id: 'vendor:access', name: 'Vendor Access', description: 'Can access vendor dashboard' },
  'vendor:manage_tools': { id: 'vendor:manage_tools', name: 'Manage Own Tools', description: 'Can manage own submitted tools' },
  'vendor:analytics': { id: 'vendor:analytics', name: 'Vendor Analytics', description: 'Can view vendor-specific analytics' },
  
  // Verification System
  'verification:apply': { id: 'verification:apply', name: 'Apply for Verification', description: 'Can apply for verified tester status' },
  'verification:approve': { id: 'verification:approve', name: 'Approve Verification', description: 'Can approve user verifications' },
  'verification:reject': { id: 'verification:reject', name: 'Reject Verification', description: 'Can reject user verifications' },
  
  // Moderation
  'moderation:flag': { id: 'moderation:flag', name: 'Flag Content', description: 'Can flag inappropriate content' },
  'moderation:review': { id: 'moderation:review', name: 'Review Flags', description: 'Can review flagged content' },
  'moderation:action': { id: 'moderation:action', name: 'Take Action', description: 'Can take moderation actions' },
  
  // Community
  'community:discuss': { id: 'community:discuss', name: 'Participate in Discussions', description: 'Can participate in community discussions' },
  'community:create_threads': { id: 'community:create_threads', name: 'Create Discussion Threads', description: 'Can create new discussion threads' }
};

// Define role permissions
export const ROLE_PERMISSIONS: RolePermissions[] = [
  {
    role: 'super_admin',
    permissions: [
      'tools:read', 'tools:create', 'tools:update', 'tools:delete',
      'reviews:read', 'reviews:create', 'reviews:update', 'reviews:delete', 'reviews:vote',
      'testing:access', 'testing:create', 'testing:update', 'testing:delete', 'testing:approve',
      'users:read', 'users:update', 'users:delete', 'users:verify',
      'admin:access', 'admin:moderate', 'admin:manage_users', 'admin:analytics',
      'vendor:access', 'vendor:manage_tools', 'vendor:analytics',
      'verification:approve', 'verification:reject',
      'moderation:flag', 'moderation:review', 'moderation:action',
      'community:discuss', 'community:create_threads'
    ],
    description: 'Full access to all platform features including testing and administrative functions'
  },
  {
    role: 'admin',
    permissions: [
      'tools:read', 'tools:create', 'tools:update', 'tools:delete',
      'reviews:read', 'reviews:create', 'reviews:update', 'reviews:delete', 'reviews:vote',
      'testing:access', 'testing:create', 'testing:update', 'testing:delete', 'testing:approve',
      'users:read', 'users:update', 'users:verify',
      'admin:access', 'admin:moderate', 'admin:manage_users', 'admin:analytics',
      'verification:approve', 'verification:reject',
      'moderation:flag', 'moderation:review', 'moderation:action',
      'community:discuss', 'community:create_threads'
    ],
    description: 'Admin access with testing capabilities and content moderation'
  },
  {
    role: 'verified_tester',
    permissions: [
      'tools:read', 'tools:create', 'tools:update',
      'reviews:read', 'reviews:create', 'reviews:update', 'reviews:delete', 'reviews:vote',
      'testing:access', 'testing:create', 'testing:update',
      'users:read',
      'community:discuss', 'community:create_threads',
      'verification:apply'
    ],
    description: 'Verified tester with access to testing tools and review capabilities'
  },
  {
    role: 'vendor',
    permissions: [
      'tools:read', 'tools:create', 'tools:update',
      'reviews:read', 'reviews:create', 'reviews:update', 'reviews:delete', 'reviews:vote',
      'vendor:access', 'vendor:manage_tools', 'vendor:analytics',
      'users:read',
      'community:discuss', 'community:create_threads',
      'verification:apply'
    ],
    description: 'Vendor with access to manage own tools and vendor dashboard'
  },
  {
    role: 'user',
    permissions: [
      'tools:read',
      'reviews:read', 'reviews:create', 'reviews:update', 'reviews:delete', 'reviews:vote',
      'users:read',
      'community:discuss', 'community:create_threads',
      'verification:apply'
    ],
    description: 'Regular user with basic review and community participation capabilities'
  }
];

// Helper functions
export function hasPermission(userRole: UserRole, permission: string): boolean {
  const rolePermissions = ROLE_PERMISSIONS.find(rp => rp.role === userRole);
  return rolePermissions?.permissions.includes(permission) || false;
}

export function canTest(userRole: UserRole): boolean {
  return hasPermission(userRole, 'testing:access');
}

export function canReview(userRole: UserRole): boolean {
  return hasPermission(userRole, 'reviews:create');
}

export function canAccessAdmin(userRole: UserRole): boolean {
  return hasPermission(userRole, 'admin:access');
}

export function canAccessVendor(userRole: UserRole): boolean {
  return hasPermission(userRole, 'vendor:access');
}

export function getRolePermissions(userRole: UserRole): string[] {
  const rolePermissions = ROLE_PERMISSIONS.find(rp => rp.role === userRole);
  return rolePermissions?.permissions || [];
}

export function getRoleDescription(userRole: UserRole): string {
  const rolePermissions = ROLE_PERMISSIONS.find(rp => rp.role === userRole);
  return rolePermissions?.description || 'No description available';
}
