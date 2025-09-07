'use client';

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';

export interface UserRole {
  id: string;
  userId: string;
  role: string;
  isActive: boolean;
  grantedAt: string;
  grantedBy?: string;
}

export interface UserWithRoles {
  id: string;
  email: string;
  name?: string;
  primaryRole?: string;
  activeRole?: string;
  roleSwitchedAt?: string;
  userRoles: UserRole[];
  hasVendorApplication?: boolean;
  hasVerificationRequest?: boolean;
}

interface UseMultiRoleReturn {
  user: UserWithRoles | null;
  activeRole: string | null;
  availableRoles: string[];
  isLoading: boolean;
  error: string | null;
  switchRole: (role: string) => Promise<boolean>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAppliedForRoles: boolean;
  refreshUser: () => Promise<void>;
}

export function useMultiRole(): UseMultiRoleReturn {
  const stackUser = useUser();
  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRoles = useCallback(async () => {
    if (!stackUser) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/users/switch-role');
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.success) {
          setUser(data.user);
        } else {
          setError(data.error || 'Failed to fetch user roles');
        }
      } else {
        setError('Failed to fetch user roles');
      }
    } catch (err) {
      console.error('Error fetching user roles:', err);
      setError('Error fetching user roles');
    } finally {
      setIsLoading(false);
    }
  }, [stackUser]);

  const switchRole = async (role: string): Promise<boolean> => {
    if (!stackUser) return false;

    try {
      setError(null);

      const response = await fetch('/api/users/switch-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          return true;
        } else {
          setError(data.error || 'Failed to switch role');
          return false;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to switch role');
        return false;
      }
    } catch (err) {
      console.error('Error switching role:', err);
      setError('Error switching role');
      return false;
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.userRoles.some(userRole => userRole.role === role && userRole.isActive);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    if (!user) return false;
    return roles.some(role => hasRole(role));
  };

  const refreshUser = async (): Promise<void> => {
    await fetchUserRoles();
  };

  useEffect(() => {
    fetchUserRoles();
  }, [stackUser, fetchUserRoles]);

  return {
    user,
    activeRole: user?.activeRole || null,
    availableRoles: user?.userRoles.filter(ur => ur.isActive).map(ur => ur.role) || [],
    isLoading,
    error,
    switchRole,
    hasRole,
    hasAnyRole,
    hasAppliedForRoles: user?.hasVendorApplication || user?.hasVerificationRequest || false,
    refreshUser,
  };
}

// Hook for role-based access control
export function useRoleAccess(requiredRoles: string[], redirectTo?: string) {
  const { user, activeRole, isLoading, hasAnyRole } = useMultiRole();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      if (!hasAnyRole(requiredRoles)) {
        if (redirectTo) {
          router.push(redirectTo);
        } else {
          // Default redirect based on user's available roles
          const availableRoles = user.userRoles.filter(ur => ur.isActive).map(ur => ur.role);
          if (availableRoles.includes('admin') || availableRoles.includes('super_admin')) {
            router.push('/admin');
          } else if (availableRoles.includes('verified_tester')) {
            router.push('/tester');
          } else if (availableRoles.includes('vendor')) {
            router.push('/vendor-dashboard');
          } else {
            router.push('/dashboard');
          }
        }
      }
    }
  }, [isLoading, user, requiredRoles, redirectTo, router, hasAnyRole]);

  return {
    hasAccess: !isLoading && user ? hasAnyRole(requiredRoles) : false,
    isLoading,
    user,
    activeRole,
  };
}
