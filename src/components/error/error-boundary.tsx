'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ error, errorInfo })
    
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo)
    
    // Send error to analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          error_stack: error.stack,
          component_stack: errorInfo.componentStack
        }
      })
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-center">
                We encountered an unexpected error. Please try again or go back to the homepage.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-xs bg-muted p-3 rounded">
                  <summary className="cursor-pointer font-medium mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="whitespace-pre-wrap text-xs">
                    {this.state.error.message}
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
                <Button variant="outline" asChild className="flex-1">
                  <Link href="/">
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for error handling in functional components
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null)

  const handleError = React.useCallback((error: Error) => {
    setError(error)
    
    // Log error
    console.error('Error caught by useErrorHandler:', error)
    
    // Send to analytics
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.message,
        fatal: false
      })
    }
  }, [])

  const clearError = React.useCallback(() => {
    setError(null)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { handleError, clearError }
}

// Error fallback component for specific use cases
export function ErrorFallback({ 
  error, 
  resetError 
}: { 
  error: Error
  resetError: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-destructive" />
      </div>
      <h2 className="text-xl font-semibold mb-2">Oops! Something went wrong</h2>
      <p className="text-muted-foreground mb-4 max-w-md">
        {error.message || 'An unexpected error occurred. Please try again.'}
      </p>
      <Button onClick={resetError}>
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>
  )
}

// Loading error component
export function LoadingError({ 
  onRetry 
}: { 
  onRetry?: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">Failed to load</h3>
      <p className="text-muted-foreground mb-4">
        There was a problem loading this content.
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  )
}

// Network error component
export function NetworkError({ 
  onRetry 
}: { 
  onRetry?: () => void 
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">Connection Error</h3>
      <p className="text-muted-foreground mb-4">
        Please check your internet connection and try again.
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      )}
    </div>
  )
}
