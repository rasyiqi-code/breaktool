import { Metadata } from 'next'
import { generateMetadata, pageMetadata } from '@/lib/metadata'

interface ToolData {
  name: string
  description: string
  score?: number
  logo?: string
  category?: string
  website?: string
}

export async function generateToolMetadata(toolData: ToolData): Promise<Metadata> {
  return pageMetadata.tool(
    toolData.name,
    toolData.description,
    toolData.score,
    toolData.logo
  )
}

// Fallback metadata for when tool data is not available
export const fallbackToolMetadata = (slug: string): Metadata => {
  return generateMetadata({
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Review - Breaktool`,
    description: `Read our expert review of ${slug}. Get detailed analysis, pros, cons, and ratings from verified experts.`,
    url: `/tools/${slug}`,
    type: 'website',
    tags: [slug, 'SaaS review', 'software review', 'tool analysis'],
  })
}
