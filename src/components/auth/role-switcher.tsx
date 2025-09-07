'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  User, 
  Shield, 
  TestTube, 
  Store, 
  Crown,
  ChevronDown,
  Check,
  Loader2
} from 'lucide-react';
import { useMultiRole } from '@/hooks/use-multi-role';
import { cn } from '@/lib/utils';

interface RoleSwitcherProps {
  variant?: 'dropdown' | 'select' | 'buttons';
  className?: string;
  showCurrentRole?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const roleIcons = {
  user: User,
  verified_tester: TestTube,
  vendor: Store,
  admin: Shield,
  super_admin: Crown,
};

const roleLabels = {
  user: 'User',
  verified_tester: 'Tester',
  vendor: 'Vendor',
  admin: 'Admin',
  super_admin: 'Super Admin',
};

const roleColors = {
  user: 'bg-gray-100 text-gray-800',
  verified_tester: 'bg-blue-100 text-blue-800',
  vendor: 'bg-green-100 text-green-800',
  admin: 'bg-purple-100 text-purple-800',
  super_admin: 'bg-yellow-100 text-yellow-800',
};

export function RoleSwitcher({ 
  variant = 'dropdown', 
  className,
  showCurrentRole = true,
  size = 'md'
}: RoleSwitcherProps) {
  const { user, activeRole, availableRoles, isLoading, switchRole, error } = useMultiRole();
  const [switching, setSwitching] = useState<string | null>(null);

  const handleRoleSwitch = async (role: string) => {
    if (role === activeRole) return;

    setSwitching(role);
    try {
      const success = await switchRole(role);
      if (success) {
        // Optionally show success message
        console.log(`Switched to ${role} role`);
      }
    } catch (err) {
      console.error('Error switching role:', err);
    } finally {
      setSwitching(null);
    }
  };

  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading roles...</span>
      </div>
    );
  }

  if (!user || availableRoles.length <= 1) {
    return null; // Don't show switcher if user has only one role
  }

  if (error) {
    return (
      <div className={cn("text-sm text-red-600", className)}>
        Error: {error}
      </div>
    );
  }

  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base',
  };

  if (variant === 'select') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {showCurrentRole && (
          <span className="text-sm font-medium">Role:</span>
        )}
        <Select value={activeRole || ''} onValueChange={handleRoleSwitch}>
          <SelectTrigger className={cn("w-40", sizeClasses[size])}>
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((role) => {
              const Icon = roleIcons[role as keyof typeof roleIcons];
              return (
                <SelectItem key={role} value={role}>
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{roleLabels[role as keyof typeof roleLabels]}</span>
                    {role === activeRole && <Check className="h-4 w-4 ml-auto" />}
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    );
  }

  if (variant === 'buttons') {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        {showCurrentRole && (
          <span className="text-sm font-medium">Switch Role:</span>
        )}
        <div className="flex gap-1">
          {availableRoles.map((role) => {
            const Icon = roleIcons[role as keyof typeof roleIcons];
            const isActive = role === activeRole;
            const isSwitching = switching === role;
            
            return (
              <Button
                key={role}
                variant={isActive ? "default" : "outline"}
                size={size === 'md' ? 'default' : size}
                onClick={() => handleRoleSwitch(role)}
                disabled={isSwitching}
                className={cn(
                  "flex items-center gap-2",
                  isActive && roleColors[role as keyof typeof roleColors]
                )}
              >
                {isSwitching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  Icon && <Icon className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">
                  {roleLabels[role as keyof typeof roleLabels]}
                </span>
                {isActive && <Check className="h-4 w-4" />}
              </Button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default dropdown variant
  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showCurrentRole && activeRole && (
        <Badge 
          variant="outline" 
          className={cn(
            "flex items-center gap-1",
            roleColors[activeRole as keyof typeof roleColors]
          )}
        >
          {(() => {
            const Icon = roleIcons[activeRole as keyof typeof roleIcons];
            return Icon ? <Icon className="h-3 w-3" /> : null;
          })()}
          {roleLabels[activeRole as keyof typeof roleLabels]}
        </Badge>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size={size === 'md' ? 'default' : size}
            className="flex items-center gap-2"
          >
            <span className="hidden sm:inline">Switch Role</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Available Roles</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {availableRoles.map((role) => {
            const Icon = roleIcons[role as keyof typeof roleIcons];
            const isActive = role === activeRole;
            const isSwitching = switching === role;
            
            return (
              <DropdownMenuItem
                key={role}
                onClick={() => handleRoleSwitch(role)}
                disabled={isSwitching}
                className={cn(
                  "flex items-center gap-2 cursor-pointer",
                  isActive && "bg-accent"
                )}
              >
                {isSwitching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  Icon && <Icon className="h-4 w-4" />
                )}
                <span className="flex-1">
                  {roleLabels[role as keyof typeof roleLabels]}
                </span>
                {isActive && <Check className="h-4 w-4" />}
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
