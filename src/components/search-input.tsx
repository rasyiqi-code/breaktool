"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function SearchInput() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    // Return a basic input during server-side rendering
    return (
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Search SaaS tools..."
          className="w-full pl-10 pr-4 py-2 bg-muted/50 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          suppressHydrationWarning
        />
      </div>
    )
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search SaaS tools..."
        className="w-full pl-10 pr-4 py-2 bg-muted/50 border-0 focus-visible:ring-ring"
      />
    </div>
  )
}
