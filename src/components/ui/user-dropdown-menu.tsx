"use client";

import { useUser } from "@stackframe/stack";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut, Crown, Shield, TestTube, Store, Home } from "lucide-react";
import Link from "next/link";
import { useRoleNavigation } from "@/hooks/use-role-navigation";
import { useMultiRole } from "@/hooks/use-multi-role";

export function UserDropdownMenu() {

  const user = useUser();
  const { userRole, loading } = useRoleNavigation();
  const { activeRole, availableRoles, switchRole } = useMultiRole();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'verified_tester':
        return <TestTube className="w-4 h-4 text-green-500" />;
      case 'vendor':
        return <Store className="w-4 h-4 text-purple-500" />;
      default:
        return <Home className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'verified_tester':
        return 'Verified Tester';
      case 'vendor':
        return 'Vendor';
      default:
        return 'User';
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.profileImageUrl || undefined} alt={user.displayName || "User"} />
            <AvatarFallback>
              {user.displayName?.charAt(0) || user.primaryEmail?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.profileImageUrl || undefined} alt={user.displayName || "User"} />
                <AvatarFallback>
                  {user.displayName?.charAt(0) || user.primaryEmail?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="text-sm font-medium leading-none">
                  {user.displayName || "User"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user.primaryEmail}
                </p>
              </div>
            </div>
            {!loading && (
              <div className="flex items-center gap-2 mt-2">
                {getRoleIcon(activeRole || userRole)}
                <span className="text-xs text-muted-foreground">
                  {getRoleLabel(activeRole || userRole)}
                </span>
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {/* Role Switcher - Only show if user has multiple switchable roles AND is not admin/super_admin */}
        {(() => {
          const switchableRoles = availableRoles.filter(role => role === 'vendor' || role === 'verified_tester');
          const hasAdminRole = availableRoles.some(role => role === 'admin' || role === 'super_admin');
          const hasMultipleSwitchableRoles = switchableRoles.length > 1;
          
          // Only show switch role if user has multiple approved roles (not just applications)
          return hasMultipleSwitchableRoles && !hasAdminRole;
        })() && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
                Switch Role
              </DropdownMenuLabel>
              {availableRoles
                .filter(role => role === 'vendor' || role === 'verified_tester')
                .map((role) => {
                  const isActive = role === (activeRole || userRole);
                  return (
                    <DropdownMenuItem
                      key={role}
                      onClick={() => switchRole(role)}
                      className={`flex items-center gap-2 cursor-pointer ${
                        isActive ? 'bg-accent' : ''
                      }`}
                    >
                      {getRoleIcon(role)}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {getRoleLabel(role)}
                        </span>
                        {isActive && (
                          <span className="text-xs text-muted-foreground">
                            Current
                          </span>
                        )}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}
        
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link 
              href="/dashboard"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/handler/account-settings" className="flex items-center gap-2 cursor-pointer">
              <Settings className="w-4 h-4" />
              <span>Account settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => user.signOut()} className="flex items-center gap-2">
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
