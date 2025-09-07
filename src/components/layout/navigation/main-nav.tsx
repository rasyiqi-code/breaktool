"use client"

import Link from "next/link"
import { Shield } from "lucide-react"
import { canAccessAdmin, UserRole } from "@/lib/auth/permissions"

interface MainNavProps {
  userRole: string
}

export function MainNav({ userRole }: MainNavProps) {
  return (
    <nav className="flex items-center gap-1 sm:gap-2 lg:gap-4 overflow-x-auto scrollbar-hide py-0.5 lg:py-0">
      <Link href="/tools" className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap flex-shrink-0 px-1.5 py-0.5 rounded-md hover:bg-accent">
        Browse Tools
      </Link>
      
      <Link href="/compare" className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap flex-shrink-0 px-1.5 py-0.5 rounded-md hover:bg-accent">
        Compare Tools
      </Link>

      <Link href="/submit" className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap flex-shrink-0 px-1.5 py-0.5 rounded-md hover:bg-accent">
        Submit Tool
      </Link>
      
      
      {/* Show Admin link only for admin users */}
      {canAccessAdmin(userRole as UserRole) && (
        <Link href="/admin" className="text-sm font-medium hover:text-primary transition-colors whitespace-nowrap flex-shrink-0 px-1.5 py-0.5 rounded-md hover:bg-accent">
          <Shield className="w-4 h-4 inline mr-1" />
          Admin
        </Link>
      )}
    </nav>
  )
}
