import { Metadata } from 'next'

interface GenerateMetadataOptions {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  tags?: string[]
  score?: number
  logo?: string
}

export function generateMetadata({
  title = 'Breaktool - Trusted SaaS Reviews by Verified Experts',
  description = 'Discover, test, and decide on SaaS tools with reviews from verified experts and professionals. The most trusted SaaS review platform.',
  image,
  url,
  type = 'website',
  publishedTime,
  modifiedTime,
  authors = ['Breaktool Team'],
  tags = [],
  score,
  logo
}: GenerateMetadataOptions = {}): Metadata {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://breaktool.com'
  const fullUrl = url ? `${baseUrl}${url}` : baseUrl
  
  // Generate OG image URL with parameters
  const ogImageUrl = image || (() => {
    const params = new URLSearchParams()
    if (title !== 'Breaktool - Trusted SaaS Reviews by Verified Experts') {
      params.set('title', title)
    }
    if (description !== 'Discover, test, and decide on SaaS tools with reviews from verified experts and professionals. The most trusted SaaS review platform.') {
      params.set('description', description)
    }
    if (score) {
      params.set('score', score.toString())
    }
    if (logo) {
      params.set('logo', logo)
    }
    return `/og${params.toString() ? `?${params.toString()}` : ''}`
  })()

  const metadata: Metadata = {
    title,
    description,
    openGraph: {
      type,
      locale: 'en_US',
      url: fullUrl,
      siteName: 'Breaktool',
      title,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: title,
          type: 'image/png',
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors.length > 0 && { authors: authors.map(name => ({ name })) }),
    },
    twitter: {
      card: 'summary_large_image',
      site: '@breaktool',
      creator: '@breaktool',
      title,
      description,
      images: [ogImageUrl],
    },
    ...(tags.length > 0 && {
      keywords: tags,
    }),
  }

  return metadata
}

// Predefined metadata for common pages
export const pageMetadata = {
  home: () => generateMetadata({
    title: 'Breaktool - Trusted SaaS Reviews by Verified Experts',
    description: 'Discover, test, and decide on SaaS tools with reviews from verified experts and professionals. The most trusted SaaS review platform.',
    url: '/',
  }),

  tools: () => generateMetadata({
    title: 'SaaS Tools - Breaktool',
    description: 'Browse and compare the best SaaS tools with expert reviews and ratings. Find the perfect tool for your business needs.',
    url: '/tools',
  }),

  tool: (toolName: string, description: string, score?: number, logo?: string) => generateMetadata({
    title: `${toolName} Review - Breaktool`,
    description: `${description} Read our expert review and rating.`,
    url: `/tools/${toolName.toLowerCase().replace(/\s+/g, '-')}`,
    type: 'website',
    score,
    logo,
    tags: [toolName, 'SaaS review', 'software review', 'tool analysis'],
  }),

  submit: () => generateMetadata({
    title: 'Submit Your SaaS Tool - Breaktool',
    description: 'Submit your SaaS tool for expert review and analysis. Get featured on Breaktool and reach potential customers.',
    url: '/submit',
  }),

  compare: () => generateMetadata({
    title: 'Compare SaaS Tools - Breaktool',
    description: 'Compare multiple SaaS tools side by side. Make informed decisions with expert reviews and detailed comparisons.',
    url: '/compare',
  }),

  discussions: () => generateMetadata({
    title: 'SaaS Discussions - Breaktool',
    description: 'Join the conversation about SaaS tools. Share experiences, ask questions, and learn from the community.',
    url: '/discussions',
  }),

  bookmarks: () => generateMetadata({
    title: 'My Bookmarks - Breaktool',
    description: 'Your saved SaaS tools and reviews. Access your bookmarked content anytime.',
    url: '/bookmarks',
  }),
}
