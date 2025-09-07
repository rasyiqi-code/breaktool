"use client"

import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

export function MobileNav() {
  return (
    <Button variant="ghost" size="sm" className="sm:hidden">
      <Search className="w-4 h-4" />
    </Button>
  )
}
