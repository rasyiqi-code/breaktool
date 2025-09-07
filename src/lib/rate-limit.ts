import { NextRequest, NextResponse } from 'next/server'

interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  max: number // Maximum number of requests per window
  message?: string
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// In-memory store for rate limiting
const store: RateLimitStore = {}

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get IP from various headers
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  
  const ip = forwarded?.split(',')[0] || realIp || cfConnectingIp || 'unknown'
  
  // Include user agent for additional uniqueness
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return `${ip}:${userAgent.slice(0, 50)}`
}

/**
 * Rate limiting middleware
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    windowMs,
    max,
    message = 'Too many requests, please try again later.',
    // skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options

  return <T extends Record<string, string>>(handler: (req: NextRequest, context: { params: Promise<T> }) => Promise<NextResponse>) => {
    return async (request: NextRequest, context: { params: Promise<T> }) => {
      const clientId = getClientId(request)
      const now = Date.now()
      // const windowStart = now - windowMs

      // Get or create client record
      let clientRecord = store[clientId]
      
      if (!clientRecord || clientRecord.resetTime < now) {
        clientRecord = {
          count: 0,
          resetTime: now + windowMs
        }
        store[clientId] = clientRecord
      }

      // Check if client has exceeded rate limit
      if (clientRecord.count >= max) {
        return new NextResponse(
          JSON.stringify({ 
            error: message,
            retryAfter: Math.ceil((clientRecord.resetTime - now) / 1000)
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': Math.ceil((clientRecord.resetTime - now) / 1000).toString(),
              'X-RateLimit-Limit': max.toString(),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': new Date(clientRecord.resetTime).toISOString()
            }
          }
        )
      }

      // Increment counter
      clientRecord.count++

      try {
        // Execute the handler
        const response = await handler(request, context)
        
        // Add rate limit headers to successful responses
        if (response && response.status < 400) {
          const remaining = Math.max(0, max - clientRecord.count)
          response.headers.set('X-RateLimit-Limit', max.toString())
          response.headers.set('X-RateLimit-Remaining', remaining.toString())
          response.headers.set('X-RateLimit-Reset', new Date(clientRecord.resetTime).toISOString())
        }
        
        return response
      } catch (error) {
        // Decrement counter for failed requests if configured
        if (skipFailedRequests) {
          clientRecord.count = Math.max(0, clientRecord.count - 1)
        }
        throw error
      }
    }
  }
}

/**
 * Predefined rate limit configurations
 */
export const rateLimitConfigs = {
  // General API rate limit
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per 15 minutes
    message: 'Too many API requests, please try again later.'
  },
  
  // Strict rate limit for sensitive operations
  strict: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 requests per 15 minutes
    message: 'Too many requests for this operation, please try again later.'
  },
  
  // Auth rate limit
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per 15 minutes
    message: 'Too many authentication attempts, please try again later.'
  },
  
  // Search rate limit
  search: {
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 30, // 30 requests per minute
    message: 'Too many search requests, please try again later.'
  },
  
  // Upload rate limit
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 uploads per hour
    message: 'Too many uploads, please try again later.'
  }
}

/**
 * Rate limit decorator for API routes
 */
export function withRateLimit(config: keyof typeof rateLimitConfigs | RateLimitOptions) {
  const options = typeof config === 'string' ? rateLimitConfigs[config] : config
  return rateLimit(options)
}

/**
 * Get rate limit status for a client
 */
export function getRateLimitStatus(clientId: string): {
  count: number
  limit: number
  remaining: number
  resetTime: number
} | null {
  const record = store[clientId]
  if (!record) return null
  
  return {
    count: record.count,
    limit: 100, // Default limit
    remaining: Math.max(0, 100 - record.count),
    resetTime: record.resetTime
  }
}

/**
 * Clear rate limit for a specific client
 */
export function clearRateLimit(clientId: string): void {
  delete store[clientId]
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats() {
  const now = Date.now()
  const activeClients = Object.keys(store).filter(key => store[key].resetTime > now)
  
  return {
    totalClients: activeClients.length,
    totalRequests: activeClients.reduce((sum, key) => sum + store[key].count, 0),
    averageRequestsPerClient: activeClients.length > 0 
      ? activeClients.reduce((sum, key) => sum + store[key].count, 0) / activeClients.length 
      : 0
  }
}
