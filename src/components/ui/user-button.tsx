'use client';

import { UserButton } from "@stackframe/stack";
import { Badge } from "@/components/ui/badge";
import { Shield, Star, Crown, Building } from "lucide-react";

interface CustomUserButtonProps {
  userRole: string;
  userData: {
    id?: string;
    displayName?: string;
    primaryEmail?: string;
    profileImageUrl?: string;
    [key: string]: unknown;
  };
  unreadCount: number;
}

export function CustomUserButton({ userRole, userData, unreadCount }: CustomUserButtonProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Role Badge */}
      {userRole === 'super_admin' && (
        <Badge variant="destructive" className="text-xs">
          <Crown className="w-3 h-3 mr-1" />
          Super Admin
        </Badge>
      )}
      {userRole === 'admin' && (
        <Badge variant="destructive" className="text-xs">
          <Shield className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      )}
      {userRole === 'vendor' && (
        <Badge variant="default" className="text-xs">
          <Building className="w-3 h-3 mr-1" />
          Vendor
        </Badge>
      )}
      {userRole === 'verified_tester' && (
        <Badge variant="secondary" className="text-xs">
          <Shield className="w-3 h-3 mr-1" />
          Verified Tester
        </Badge>
      )}
      
      {/* Trust Score Badge */}
      <Badge variant="outline" className="text-xs">
        <Star className="w-3 h-3 mr-1" />
        {String(userData?.trust_score || 0)} Trust Score
      </Badge>

      {/* Notification Badge */}
      {unreadCount > 0 && (
        <Badge variant="destructive" className="text-xs">
          {unreadCount}
        </Badge>
      )}

      {/* Stack Auth UserButton */}
      <UserButton />
    </div>
  );
}
