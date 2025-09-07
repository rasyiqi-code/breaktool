"use client";

import { StackProvider, StackClientApp } from "@stackframe/stack";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthErrorHandler } from "@/lib/auth-error-handler";
import { validateStackAuthConfig } from "@/lib/auth-config-validator";
import { useEffect } from "react";

const stackApp = new StackClientApp({
  projectId: process.env.NEXT_PUBLIC_STACK_PROJECT_ID!,
  publishableClientKey: process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY!,
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: '/handler/sign-in',
    signUp: '/handler/sign-up',
    afterSignIn: '/dashboard',
    afterSignUp: '/dashboard',
    home: '/'
  }
});

export default function StackAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Validate Stack Auth configuration
    validateStackAuthConfig();
    
    // Set up global error handling for auth errors
    const handleError = (event: { reason?: { message?: string } }) => {
      if (event.reason?.message?.includes('refresh token')) {
        AuthErrorHandler.handleRefreshTokenError(event.reason);
      }
    };
    
    window.addEventListener('unhandledrejection', handleError);
    
    return () => {
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);
  
  // Add error boundary for Stack Auth

  return (
    <StackProvider app={stackApp}>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </StackProvider>
  );
}
