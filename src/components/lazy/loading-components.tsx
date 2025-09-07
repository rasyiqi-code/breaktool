import dynamic from 'next/dynamic'
import { Suspense } from 'react'

// Lazy load heavy components
export const LazyReviewForm = dynamic(() => import('@/components/reviews/review-form').then(mod => ({ default: mod.ReviewForm })), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-8 bg-muted rounded mb-4"></div>
      <div className="h-32 bg-muted rounded mb-4"></div>
      <div className="h-10 bg-muted rounded"></div>
    </div>
  ),
  ssr: false
})

export const LazyDiscussionForm = dynamic(() => import('@/components/community/discussion-form').then(mod => ({ default: mod.DiscussionForm })), {
  loading: () => (
    <div className="animate-pulse">
      <div className="h-8 bg-muted rounded mb-4"></div>
      <div className="h-24 bg-muted rounded mb-4"></div>
      <div className="h-10 bg-muted rounded"></div>
    </div>
  ),
  ssr: false
})

export const LazyTestingReportForm = dynamic(() => import('@/components/testing/testing-report-form').then(mod => ({ default: mod.TestingReportForm })), {
  loading: () => (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded"></div>
      <div className="h-24 bg-muted rounded"></div>
      <div className="h-32 bg-muted rounded"></div>
      <div className="h-10 bg-muted rounded"></div>
    </div>
  ),
  ssr: false
})

export const LazyEnhancedReviewList = dynamic(() => import('@/components/reviews/enhanced-review-list').then(mod => ({ default: mod.EnhancedReviewList })), {
  loading: () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded w-3/4"></div>
        </div>
      ))}
    </div>
  ),
  ssr: false
})

export const LazyDiscussionList = dynamic(() => import('@/components/community/discussion-list-react-query').then(mod => ({ default: mod.DiscussionListWithReactQuery })), {
  loading: () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      ))}
    </div>
  ),
  ssr: false
})

export const LazyTesterReportList = dynamic(() => import('@/components/testing/tester-report-list').then(mod => ({ default: mod.TesterReportList })), {
  loading: () => (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-8 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded mb-2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      ))}
    </div>
  ),
  ssr: false
})

// Wrapper component for Suspense
export function LazyWrapper({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  return (
    <Suspense fallback={fallback || <div className="animate-pulse h-32 bg-muted rounded"></div>}>
      {children}
    </Suspense>
  )
}
