'use client';

import { useRoleNavigation } from '@/hooks/use-role-navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';

export function QuickAccess() {
  const { visibleMenus, loading } = useRoleNavigation();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>Loading your available tools...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (visibleMenus.length === 0) {
    return null; // Don't show Quick Access if no menus available
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Access</CardTitle>
        <CardDescription>Access your role-specific tools and features</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {visibleMenus.map((menu) => (
            <Link
              key={menu.id}
              href={menu.href}
              className="group relative overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md hover:scale-105"
            >
              <div className="flex flex-col space-y-1.5 p-6">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{menu.icon}</span>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-semibold leading-none tracking-tight">
                      {menu.label}
                    </h3>
                    {menu.badge && (
                      <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                        {menu.badge}
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  {menu.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
