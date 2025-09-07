import { NextResponse } from 'next/server'
import { ToolsService } from '@/lib/services/tools/tools.service'

export async function GET() {
  try {
    // Get all tools for sitemap
    const tools = await ToolsService.getTools({ limit: 1000, sortBy: 'createdAt', sortOrder: 'desc' })
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://breaktool.com'
    
    // Static pages
    const staticPages = [
      {
        url: `${baseUrl}/`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 1.0
      },
      {
        url: `${baseUrl}/tools`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 0.9
      },
      {
        url: `${baseUrl}/compare`,
        lastModified: new Date().toISOString(),
        changeFrequency: 'weekly',
        priority: 0.8
      }
    ]
    
    // Dynamic tool pages
    const toolPages = tools.tools.map((tool: { slug: string; updated_at?: string; created_at?: string }) => ({
      url: `${baseUrl}/tools/${tool.slug}`,
      lastModified: tool.updated_at || tool.created_at || new Date().toISOString(),
      changeFrequency: 'weekly',
      priority: 0.7
    }))
    
    const allPages = [...staticPages, ...toolPages]
    
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}
