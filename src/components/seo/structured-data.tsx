import Script from 'next/script'

interface StructuredDataProps {
  tool: Record<string, unknown>
  reviews?: Record<string, unknown>[]
}

export function StructuredData({ tool, reviews = [] }: StructuredDataProps) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://breaktool.com'
  
  // Calculate aggregate rating
  const validReviews = reviews.filter(r => r.overallScore && (r.overallScore as number) > 0)
  const averageRating = validReviews.length > 0 
    ? validReviews.reduce((sum, r) => sum + (r.overallScore as number), 0) / validReviews.length 
    : (tool.overall_score as number) || 0
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": tool.name as string,
    "description": tool.description as string,
    "url": tool.website as string,
    "applicationCategory": (tool.category as string) || "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": (tool.starting_price as number) || 0,
      "priceCurrency": "USD",
      "priceModel": (tool.pricing_model as string) || "Unknown"
    },
    "aggregateRating": validReviews.length > 0 ? {
      "@type": "AggregateRating",
      "ratingValue": Math.round(averageRating * 10) / 10,
      "ratingCount": validReviews.length,
      "bestRating": 10,
      "worstRating": 1
    } : undefined,
    "review": validReviews.slice(0, 5).map(review => ({
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.overallScore as number,
        "bestRating": 10,
        "worstRating": 1
      },
              "author": {
                "@type": "Person",
                "name": (review.user as { displayName?: string })?.displayName || "Anonymous Reviewer"
              },
      "reviewBody": review.content as string,
      "datePublished": review.createdAt as string
    })),
    "image": tool.logo_url as string,
    "publisher": {
      "@type": "Organization",
      "name": "Breaktool",
      "url": baseUrl,
      "logo": {
        "@type": "ImageObject",
        "url": `${baseUrl}/logo.png`
      }
    }
  }

  // Remove undefined values
  const cleanStructuredData = JSON.parse(JSON.stringify(structuredData, (key, value) => 
    value === undefined ? undefined : value
  ))

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(cleanStructuredData, null, 2)
      }}
    />
  )
}
