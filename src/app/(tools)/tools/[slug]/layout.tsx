import type { Metadata } from "next"
import { ToolsService } from "@/lib/services/tools/tools.service"

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { slug } = await params
    const tool = await ToolsService.getToolBySlug(slug)
    
    if (!tool) {
      return {
        title: "Tool Not Found - Breaktool",
        description: "The requested tool could not be found on Breaktool."
      }
    }

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://breaktool.com'
    const toolUrl = `${baseUrl}/tools/${slug}`
    
    // Generate dynamic title and description
    const title = `${tool.name} Review - Expert Analysis & Verdict | Breaktool`
    const description = tool.long_description || tool.description || 
      `Read expert reviews and analysis of ${tool.name}. Get verified insights from professionals who have actually used this SaaS tool.`
    
    // Calculate average score for Open Graph
    const avgScore = tool.overall_score ? Math.round(tool.overall_score * 10) / 10 : null
    const scoreText = avgScore ? ` (${avgScore}/10)` : ''
    
    return {
      title,
      description,
      keywords: [
        tool.name,
        'SaaS review',
        'software review',
        'tool analysis',
        'expert review',
        'verified review',
        typeof tool.category === 'string' ? tool.category : 'productivity tool'
      ].filter(Boolean),
      
      // Open Graph
      openGraph: {
        title: `${tool.name} Review${scoreText}`,
        description,
        url: toolUrl,
        siteName: 'Breaktool',
        images: [
          {
            url: `${baseUrl}/og?title=${encodeURIComponent(tool.name)}&description=${encodeURIComponent(description)}&score=${avgScore || ''}&logo=${encodeURIComponent(tool.logo_url || '')}`,
            width: 1200,
            height: 630,
            alt: `${tool.name} logo and review`
          }
        ],
        locale: 'en_US',
        type: 'website',
      },
      
      // Twitter
      twitter: {
        card: 'summary_large_image',
        title: `${tool.name} Review${scoreText}`,
        description,
        images: [`${baseUrl}/og?title=${encodeURIComponent(tool.name)}&description=${encodeURIComponent(description)}&score=${avgScore || ''}&logo=${encodeURIComponent(tool.logo_url || '')}`],
      },
      
      // Additional meta tags
      alternates: {
        canonical: toolUrl,
      },
      
      // Robots
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: "Tool Review - Breaktool",
      description: "Read expert reviews and analysis of SaaS tools on Breaktool."
    }
  }
}

export default function ToolLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
