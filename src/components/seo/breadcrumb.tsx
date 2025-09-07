import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className = '' }: BreadcrumbProps) {
  const allItems = [
    { label: 'Home', href: '/' },
    ...items
  ]

  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`}
    >
      {allItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index === 0 && <Home className="w-4 h-4 mr-1" />}
          
          {item.href && index < allItems.length - 1 ? (
            <Link 
              href={item.href}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className={index === allItems.length - 1 ? 'text-foreground font-medium' : ''}>
              {item.label}
            </span>
          )}
          
          {index < allItems.length - 1 && (
            <ChevronRight className="w-4 h-4 mx-1" />
          )}
        </div>
      ))}
    </nav>
  )
}

// Structured data untuk breadcrumb
export function BreadcrumbStructuredData({ items }: { items: BreadcrumbItem[] }) {
  const allItems = [
    { label: 'Home', href: '/' },
    ...items
  ]

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": item.href ? `${process.env.NEXT_PUBLIC_SITE_URL || 'https://breaktool.com'}${item.href}` : undefined
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  )
}
