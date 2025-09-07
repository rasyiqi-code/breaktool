import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle } from 'lucide-react';

interface AccessDeniedProps {
  requiredRole?: string;
  currentRole?: string;
  dashboardPath?: string;
}

export function AccessDenied({ requiredRole, currentRole }: AccessDeniedProps) {
  const getDashboardUrl = (role: string) => {
    switch (role) {
      case 'super_admin':
        return '/super-admin';
      case 'admin':
        return '/admin';
      case 'verified_tester':
        return '/tester';
      case 'vendor':
        return '/vendor-dashboard';
      default:
        return '/dashboard';
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl">Access Denied</CardTitle>
          <CardDescription>
            You don&apos;t have permission to access this dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requiredRole && currentRole && (
            <div className="text-sm text-muted-foreground">
              <p>Required role: <span className="font-medium">{requiredRole}</span></p>
              <p>Your role: <span className="font-medium">{currentRole}</span></p>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button 
              onClick={() => window.location.href = getDashboardUrl(currentRole || 'user')}
              className="w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              Go to Your Dashboard
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
