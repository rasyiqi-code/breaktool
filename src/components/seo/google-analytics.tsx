import Script from 'next/script'

interface GoogleAnalyticsProps {
  measurementId: string
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${measurementId}', {
            page_title: document.title,
            page_location: window.location.href,
          });
        `}
      </Script>
    </>
  )
}

// Custom event tracking
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    })
  }
}

// Page view tracking
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    })
  }
}

// Tool view tracking
export const trackToolView = (toolName: string, toolId: string) => {
  trackEvent('view_item', 'tool', toolName)
  trackEvent('tool_view', 'engagement', toolId)
}

// Review submission tracking
export const trackReviewSubmission = (toolName: string, toolId: string) => {
  trackEvent('submit_review', 'engagement', toolName)
  trackEvent('review_submission', 'conversion', toolId)
}

// Search tracking
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  trackEvent('search', 'engagement', searchTerm, resultsCount)
}

// External link tracking
export const trackExternalLink = (url: string, toolName: string) => {
  trackEvent('click', 'external_link', url)
  trackEvent('tool_website_visit', 'engagement', toolName)
}

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}
