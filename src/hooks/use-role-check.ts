'use client';

import { useUser } from '@stackframe/stack';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface RoleCheckOptions {
  requiredRoles: string[];
  redirectTo?: string;
  fallbackPath?: string;
}

export function useRoleCheck({ requiredRoles, redirectTo, fallbackPath }: RoleCheckOptions) {
  const user = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState<string>('user');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        router.push('/auth/signin');
        return;
      }

      try {
        const response = await fetch(`/api/users/get-user-profile?userId=${user.id}`);
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setUserRole(result.user.role || 'user');
          }
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('user');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRole();
  }, [user, router]);

  useEffect(() => {
    if (!isLoading && user && userRole) {
      if (!requiredRoles.includes(userRole)) {
        if (redirectTo) {
          router.push(redirectTo);
        } else if (fallbackPath) {
          router.push(fallbackPath);
        } else {
          // Default fallback based on role
          switch (userRole) {
            case 'admin':
            case 'super_admin':
              router.push('/admin');
              break;
            case 'verified_tester':
              router.push('/tester');
              break;
            case 'vendor':
              router.push('/vendor-dashboard');
              break;
            default:
              router.push('/dashboard');
          }
        }
      }
    }
  }, [user, userRole, requiredRoles, redirectTo, fallbackPath, router, isLoading]);

  return {
    user,
    hasAccess: user && !isLoading ? requiredRoles.includes(userRole) : false,
    isLoading: !user || isLoading
  };
}
