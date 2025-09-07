"use client";

import { useUser } from "@stackframe/stack";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { UserRole, hasPermission } from "@/lib/auth/permissions";
// Removed Supabase client import - using API endpoints instead

interface RequireRoleProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  requiredRoles?: UserRole[]; // New prop for multiple roles
  requiredPermission?: string;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RequireRole({ 
  children, 
  requiredRole, 
  requiredRoles, // New prop
  requiredPermission, 
  fallback,
  redirectTo = "/dashboard"
}: RequireRoleProps) {
  const user = useUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/users/me');
        
        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role as UserRole || 'user');
        } else {
          console.error('Error fetching user role:', response.status);
          setUserRole('user'); // Default to user role
        }
      } catch (error) {
        console.error('Error in fetchUserRole:', error);
        setUserRole('user'); // Default to user role
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  useEffect(() => {
    if (!loading && userRole) {
      let hasAccess = true;

      // Check role requirement - support both single role and multiple roles
      if (requiredRoles && requiredRoles.length > 0) {
        hasAccess = requiredRoles.includes(userRole);
      } else if (requiredRole) {
        hasAccess = userRole === requiredRole;
      }

      // Check permission requirement
      if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
        hasAccess = false;
      }

      if (!hasAccess) {
        if (redirectTo) {
          router.push(redirectTo);
        }
      }
    }
  }, [loading, userRole, requiredRole, requiredRoles, requiredPermission, redirectTo, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You need to be signed in to access this page.
          </p>
          <button 
            onClick={() => router.push('/auth')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground">
            Unable to determine your role. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  // Check access - support both single role and multiple roles
  let hasAccess = true;

  if (requiredRoles && requiredRoles.length > 0) {
    hasAccess = requiredRoles.includes(userRole);
  } else if (requiredRole) {
    hasAccess = userRole === requiredRole;
  }

  if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don&apos;t have permission to access this page.
          </p>
          {requiredRoles && requiredRoles.length > 0 && (
            <p className="text-sm text-muted-foreground mb-4">
              Required roles: <span className="font-semibold">{requiredRoles.join(', ')}</span>
            </p>
          )}
          {requiredRole && (
            <p className="text-sm text-muted-foreground mb-4">
              Required role: <span className="font-semibold">{requiredRole}</span>
            </p>
          )}
          {requiredPermission && (
            <p className="text-sm text-muted-foreground mb-4">
              Required permission: <span className="font-semibold">{requiredPermission}</span>
            </p>
          )}
          <p className="text-sm text-muted-foreground mb-4">
            Your role: <span className="font-semibold">{userRole}</span>
          </p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
