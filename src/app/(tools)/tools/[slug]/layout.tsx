import { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'

interface Props {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

// This will be called at build time for static generation
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  
  // For now, return fallback metadata
  // In production, you would fetch tool data here
  return pageMetadata.tool(
    slug.charAt(0).toUpperCase() + slug.slice(1),
    `Read our expert review of ${slug}. Get detailed analysis, pros, cons, and ratings from verified experts.`
  )
}

export default function ToolLayout({ children }: Props) {
  return children
}