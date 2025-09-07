"use client"

import { Suspense } from "react"
import { Header } from "./header"
import { useNavigation } from "@/hooks/use-navigation"

function NavigationContent() {
  const { isClient, user, userRole, userData, unreadCount } = useNavigation()

  return (
    <Header 
      userRole={userRole}
      userData={userData || undefined}
      unreadCount={unreadCount}
      isClient={isClient}
      user={user}
    />
  )
}

export function Navigation() {
  return (
    <Suspense fallback={
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 hidden md:flex">
            <div className="mr-6 flex items-center space-x-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
                B
              </div>
              <span className="hidden font-bold sm:inline-block">
                Breaktool
              </span>
            </div>
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="relative">
                <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search tools..."
                  className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px] flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="animate-pulse bg-muted rounded-full h-8 w-8"></div>
            </div>
          </div>
        </div>
      </header>
    }>
      <NavigationContent />
    </Suspense>
  )
}
