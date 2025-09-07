import { useState, useEffect } from 'react';
import { useMultiRole } from './use-multi-role';

export interface DashboardMenu {
  id: string;
  label: string;
  href: string;
  icon: string;
  description: string;
  roles: string[];
  badge?: string;
}

export function useRoleNavigation() {
  const { activeRole, availableRoles, isLoading } = useMultiRole();
  const [userRole, setUserRole] = useState<string>('user');
  const [loading, setLoading] = useState(true);

  // Semua menu dashboard yang tersedia
  const allDashboardMenus: DashboardMenu[] = [
    {
      id: 'super-admin',
      label: 'Super Admin',
      href: '/super-admin',
      icon: '👑',
      description: 'Full system control',
      roles: ['super_admin']
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      href: '/admin',
      icon: '🛡️',
      description: 'Content moderation & testing',
      roles: ['admin', 'super_admin']
    },
    {
      id: 'verified-tester',
      label: 'Tester Dashboard',
      href: '/tester',
      icon: '🧪',
      description: 'Testing tasks & reviews',
      roles: ['verified_tester']
    },
    {
      id: 'write-test-report',
      label: 'Write Test Report',
      href: '/tester/write-a-test-report',
      icon: '📝',
      description: 'Create new test report',
      roles: ['verified_tester', 'admin', 'super_admin']
    },
    {
      id: 'testing-reports',
      label: 'Testing Reports',
      href: '/tester/testing-reports',
      icon: '📊',
      description: 'View and manage testing reports',
      roles: ['verified_tester', 'admin', 'super_admin']
    },
    {
      id: 'vendor',
      label: 'Vendor Dashboard',
      href: '/vendor-dashboard',
      icon: '🏪',
      description: 'Tool management & analytics',
      roles: ['vendor']
    },
    {
      id: 'submit-tool-review',
      label: 'Submit Tool Review',
      href: '/submit',
      icon: '📝',
      description: 'Submit a new tool review',
      roles: ['vendor']
    },
    {
      id: 'user',
      label: 'User Dashboard',
      href: '/dashboard',
      icon: '🏠',
      description: 'Personal dashboard',
      roles: ['user'] // Hanya untuk role 'user' saja
    }
  ];

  // Update userRole when activeRole changes
  useEffect(() => {
    if (activeRole) {
      setUserRole(activeRole);
    }
  }, [activeRole]);

  // Update loading state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  // Filter menu berdasarkan ACTIVE ROLE user
  // Hanya tampilkan menu yang sesuai dengan active role saat ini
  const getVisibleMenus = (): DashboardMenu[] => {
    // Tampilkan menu jika user memiliki role yang memiliki dashboard khusus
    const hasSpecialRole = availableRoles.some(role => 
      role === 'vendor' || role === 'verified_tester' || role === 'admin' || role === 'super_admin'
    );
    
    if (!hasSpecialRole) {
      return [];
    }
    
    // Filter menu berdasarkan ACTIVE ROLE, bukan semua available roles
    return allDashboardMenus
      .filter(menu => 
        menu.roles.includes(activeRole || '') && 
        (activeRole === 'vendor' || activeRole === 'verified_tester' || activeRole === 'admin' || activeRole === 'super_admin')
      )
      .map(menu => ({
        ...menu,
        badge: 'Active' // Semua menu yang ditampilkan adalah untuk active role
      }));
  };

  return {
    userRole: activeRole || userRole,
    loading,
    visibleMenus: getVisibleMenus(),
    availableRoles,
    activeRole,
    allMenus: allDashboardMenus
  };
}
