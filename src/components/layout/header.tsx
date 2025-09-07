"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SearchInput } from "@/components/search-input"
import { MainNav } from "./navigation/main-nav"
import { UserDropdownMenu } from "@/components/ui/user-dropdown-menu"
import { MobileNav } from "./navigation/mobile-nav"
import { Menu, X, Github } from "lucide-react"

interface HeaderProps {
  userRole: string
  userData?: {
    id?: string;
    displayName?: string;
    primaryEmail?: string;
    profileImageUrl?: string;
    [key: string]: unknown;
  } | null
  unreadCount: number
  isClient: boolean
  user: any // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function Header({ userRole, isClient, user }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      {/* Main Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_1px_0_0_rgba(255,255,255,0.1)]">
        <div className="container flex h-12 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 lg:gap-8 min-w-0 flex-1">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-white text-black font-bold text-sm border border-gray-200">
                B
              </div>
              <span className="text-lg font-bold hidden sm:inline">Breaktool</span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:block flex-1 min-w-0 lg:flex-none">
              <MainNav userRole={userRole} />
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-3 lg:mx-6 hidden lg:block">
            <SearchInput />
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
            {/* GitHub Link */}
            <Link 
              href="https://github.com/rasyiqi-code/breaktool" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-4 w-4" />
              <span className="text-sm hidden lg:inline">GitHub</span>
            </Link>

            {/* Mobile Search Button */}
            <MobileNav />

            {/* Hamburger Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>

            {isClient && user ? (
              <UserDropdownMenu />
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/sign-in">
                  <Button size="sm">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Navigation Bar */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-[0_1px_0_0_rgba(255,255,255,0.1)]">
          <div className="container">
            <MainNav userRole={userRole} />
            {/* Mobile GitHub Link */}
            <div className="py-3 border-t">
              <Link 
                href="https://github.com/rasyiqi-code/breaktool" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors px-4 py-2"
              >
                <Github className="h-4 w-4" />
                <span className="text-sm">View on GitHub</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
