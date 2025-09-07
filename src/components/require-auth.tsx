"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@stackframe/stack"
import { Loader2 } from "lucide-react"

interface RequireAuthProps {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}

export function RequireAuth({ 
  children, 
  redirectTo = "/auth", 
  fallback 
}: RequireAuthProps) {
  const user = useUser()
  const router = useRouter()

  useEffect(() => {
    if (user === null) {
      router.push(redirectTo)
    }
  }, [user, router, redirectTo])

  // Show loading state while checking session
  if (user === undefined) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      )
    )
  }

  // Show nothing while redirecting
  if (user === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // User is authenticated, show the protected content
  return <>{children}</>
}
