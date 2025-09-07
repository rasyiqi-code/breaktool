'use client'

import { useEffect } from 'react'

interface PerformanceMemory {
  usedJSHeapSize: number
  totalJSHeapSize: number
  jsHeapSizeLimit: number
}

interface PerformanceWithMemory extends Performance {
  memory?: PerformanceMemory
}

interface GtagFunction {
  (command: 'event', eventName: string, parameters: Record<string, unknown>): void
  (command: 'config', targetId: string, config?: Record<string, unknown>): void
}

interface WindowWithGtag {
  gtag?: GtagFunction
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in development or when explicitly enabled
    if (process.env.NODE_ENV !== 'development' && !process.env.NEXT_PUBLIC_ENABLE_PERFORMANCE_MONITOR) {
      return
    }

    const startTime = performance.now()
    
    // Monitor page load performance
    const handleLoad = () => {
      const loadTime = performance.now() - startTime
      
      // Log performance metrics
      console.log('🚀 Performance Metrics:', {
        loadTime: `${loadTime.toFixed(2)}ms`,
        renderTime: `${performance.now() - startTime}ms`,
        memoryUsage: (performance as PerformanceWithMemory).memory ? {
          used: `${Math.round((performance as PerformanceWithMemory).memory!.usedJSHeapSize / 1024 / 1024)}MB`,
          total: `${Math.round((performance as PerformanceWithMemory).memory!.totalJSHeapSize / 1024 / 1024)}MB`,
          limit: `${Math.round((performance as PerformanceWithMemory).memory!.jsHeapSizeLimit / 1024 / 1024)}MB`
        } : 'Not available'
      })
      
      // Send to analytics if available
      if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
        (window as WindowWithGtag).gtag!('event', 'page_performance', {
          load_time: Math.round(loadTime),
          page_path: window.location.pathname
        })
      }
    }
    
    // Monitor Core Web Vitals
    const monitorWebVitals = () => {
      // Largest Contentful Paint (LCP)
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        console.log('📊 LCP:', `${lastEntry.startTime.toFixed(2)}ms`)
        
        if ((window as WindowWithGtag).gtag) {
          (window as WindowWithGtag).gtag!('event', 'web_vitals', {
            metric_name: 'LCP',
            metric_value: Math.round(lastEntry.startTime),
            page_path: window.location.pathname
          })
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] })
      
      // First Input Delay (FID)
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          const fid = (entry as unknown as { processingStart: number }).processingStart - entry.startTime
          console.log('📊 FID:', `${fid}ms`)
          
        if ((window as WindowWithGtag).gtag) {
          (window as WindowWithGtag).gtag!('event', 'web_vitals', {
            metric_name: 'FID',
              metric_value: Math.round(fid),
              page_path: window.location.pathname
            })
          }
        })
      }).observe({ entryTypes: ['first-input'] })
      
      // Cumulative Layout Shift (CLS)
      let clsValue = 0
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (!(entry as unknown as { hadRecentInput?: boolean }).hadRecentInput) {
            clsValue += (entry as unknown as { value: number }).value
          }
        })
        console.log('📊 CLS:', clsValue.toFixed(4))
        
        if ((window as WindowWithGtag).gtag) {
          (window as WindowWithGtag).gtag!('event', 'web_vitals', {
            metric_name: 'CLS',
            metric_value: Math.round(clsValue * 1000),
            page_path: window.location.pathname
          })
        }
      }).observe({ entryTypes: ['layout-shift'] })
    }
    
    // Wait for page to load
    if (document.readyState === 'complete') {
      handleLoad()
      monitorWebVitals()
    } else {
      window.addEventListener('load', () => {
        handleLoad()
        monitorWebVitals()
      })
    }
    
    // Monitor memory usage periodically
    const memoryInterval = setInterval(() => {
      if ((performance as PerformanceWithMemory).memory) {
        const memory = (performance as PerformanceWithMemory).memory!
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024)
        const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024)
        
        // Log warning if memory usage is high
        if (usedMB > 100) {
          console.warn('⚠️ High memory usage:', `${usedMB}MB / ${totalMB}MB`)
        }
      }
    }, 30000) // Check every 30 seconds
    
    return () => {
      clearInterval(memoryInterval)
    }
  }, [])
  
  return null // This component doesn't render anything
}

// Hook for measuring component render time
export function usePerformanceMeasure(componentName: string) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return
    
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      if (renderTime > 16) { // More than one frame (16ms)
        console.warn(`🐌 Slow render for ${componentName}:`, `${renderTime.toFixed(2)}ms`)
      }
    }
  }, [componentName])
}
