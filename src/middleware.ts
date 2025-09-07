import { NextRequest, NextResponse } from 'next/server';

// Role-based route protection
const roleRoutes: Record<string, string[]> = {
  '/super-admin': ['super_admin'],
  '/admin': ['admin', 'super_admin'],
  '/tester': ['verified_tester', 'admin', 'super_admin'],
  '/vendor-dashboard': ['vendor', 'admin', 'super_admin']
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/handler') ||
    pathname.includes('.') ||
    pathname === '/'
  ) {
    return NextResponse.next();
  }

  // Check if the path is a protected dashboard route
  const protectedRoute = Object.keys(roleRoutes).find(route => 
    pathname.startsWith(route)
  );

  if (!protectedRoute) {
    return NextResponse.next();
  }

  // For now, we'll let the client-side handle role checking
  // This is because Prisma client can't be used in Edge Runtime
  // The actual role checking will be done in the dashboard components
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/super-admin/:path*',
    '/admin/:path*',
    '/tester/:path*',
    '/vendor-dashboard/:path*'
  ]
};
