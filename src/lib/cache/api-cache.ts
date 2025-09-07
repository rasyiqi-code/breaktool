/**
 * API Cache utility for better performance
 * Provides in-memory caching for API responses
 */

interface CacheItem {
  data: unknown
  timestamp: number
  ttl: number
}

class APICache {
  private cache = new Map<string, CacheItem>()
  private maxSize = 1000 // Maximum number of cached items
  private defaultTTL = 5 * 60 * 1000 // 5 minutes default TTL

  /**
   * Get cached data
   */
  get(key: string): unknown | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }
    
    // Check if item has expired
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return item.data
  }

  /**
   * Set cached data
   */
  set(key: string, data: unknown, ttl: number = this.defaultTTL): void {
    // Remove oldest items if cache is full
    if (this.cache.size >= this.maxSize) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) {
        this.cache.delete(oldestKey)
      }
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Delete cached data
   */
  delete(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clear all cached data
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Get cache statistics
   */
  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      keys: Array.from(this.cache.keys())
    }
  }

  /**
   * Clean expired items
   */
  cleanExpired(): void {
    const now = Date.now()
    for (const [key, item] of this.cache.entries()) {
      if (now - item.timestamp > item.ttl) {
        this.cache.delete(key)
      }
    }
  }
}

// Global cache instance
export const apiCache = new APICache()

// Clean expired items every 5 minutes
setInterval(() => {
  apiCache.cleanExpired()
}, 5 * 60 * 1000)

/**
 * Cache key generators
 */
export const cacheKeys = {
  tools: (params: Record<string, unknown>) => `tools:${JSON.stringify(params)}`,
  tool: (slug: string) => `tool:${slug}`,
  reviews: (toolId: string, params: Record<string, unknown>) => `reviews:${toolId}:${JSON.stringify(params)}`,
  discussions: (toolId: string, params: Record<string, unknown>) => `discussions:${toolId}:${JSON.stringify(params)}`,
  stats: (type: string) => `stats:${type}`,
  user: (userId: string) => `user:${userId}`,
  categories: () => 'categories:all'
}

/**
 * Cache TTL constants
 */
export const cacheTTL = {
  tools: 5 * 60 * 1000, // 5 minutes
  tool: 10 * 60 * 1000, // 10 minutes
  reviews: 2 * 60 * 1000, // 2 minutes
  discussions: 2 * 60 * 1000, // 2 minutes
  stats: 15 * 60 * 1000, // 15 minutes
  user: 30 * 60 * 1000, // 30 minutes
  categories: 60 * 60 * 1000 // 1 hour
}

/**
 * Cache wrapper for API functions
 */
export function withCache<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttl: number = cacheTTL.tools
) {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args)
    
    // Try to get from cache first
    const cached = apiCache.get(key)
    if (cached !== null) {
      return cached as R
    }
    
    // Execute function and cache result
    const result = await fn(...args)
    apiCache.set(key, result, ttl)
    
    return result
  }
}

/**
 * Invalidate cache by pattern
 */
export function invalidateCache(pattern: string): void {
  const stats = apiCache.getStats()
  const keysToDelete = stats.keys.filter(key => key.includes(pattern))
  
  keysToDelete.forEach(key => {
    apiCache.delete(key)
  })
}

interface RequestLike {
  method: string
  url: string
  query: unknown
}

interface ResponseLike {
  setHeader: (name: string, value: string) => void
  json: (data: unknown) => void
}

/**
 * Cache middleware for Next.js API routes
 */
export function cacheMiddleware(ttl: number = cacheTTL.tools) {
  return (handler: (req: RequestLike, res: ResponseLike) => Promise<unknown>) => {
    return async (req: RequestLike, res: ResponseLike) => {
      const cacheKey = `${req.method}:${req.url}:${JSON.stringify(req.query)}`
      
      // Try to get from cache
      const cached = apiCache.get(cacheKey)
      if (cached !== null) {
        res.setHeader('X-Cache', 'HIT')
        return res.json(cached)
      }
      
      // Execute handler and cache result
      const originalJson = res.json
      res.json = function(data: unknown) {
        apiCache.set(cacheKey, data, ttl)
        res.setHeader('X-Cache', 'MISS')
        return originalJson.call(this, data)
      }
      
      return handler(req, res)
    }
  }
}
