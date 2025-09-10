import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, TrendingUp } from 'lucide-react'

interface RelatedTool {
  id: string
  name: string
  slug: string
  description: string
  logo_url?: string
  overall_score?: number
  category?: string
  featured?: boolean
}

interface RelatedToolsProps {
  currentToolId: string
  currentCategory?: string
  limit?: number
}

export async function RelatedTools({ 
  currentToolId, 
  currentCategory, 
  limit = 4 
}: RelatedToolsProps) {
  try {
    // Fetch related tools based on category or get trending tools
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/tools/related?category=${currentCategory}&exclude=${currentToolId}&limit=${limit}`, {
      cache: 'force-cache',
      next: { revalidate: 3600 } // Cache for 1 hour
    })
    
    if (!response.ok) {
      throw new Error('Failed to fetch related tools')
    }
    
    const relatedTools: RelatedTool[] = await response.json()
    
    if (relatedTools.length === 0) {
      return null
    }

    return (
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Related Tools
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedTools.map((tool) => (
            <Link key={tool.id} href={`/tools/${tool.slug}`}>
              <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {tool.logo_url ? (
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                        <Image
                          src={tool.logo_url}
                          alt={`${tool.name} logo`}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-primary">
                          {tool.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm truncate">{tool.name}</h4>
                        {tool.featured && (
                          <Badge variant="secondary" className="text-xs">
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      {tool.overall_score && (
                        <div className="text-xs text-muted-foreground">
                          {tool.overall_score.toFixed(1)}/10
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {tool.description}
                  </p>
                  
                  {tool.category && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {tool.category}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading related tools:', error)
    return null
  }
}

// Client component version for use in client components
interface RelatedToolsClientProps {
  tools: RelatedTool[]
  title?: string
}

export function RelatedToolsClient({ tools, title = "Related Tools" }: RelatedToolsClientProps) {
  if (tools.length === 0) {
    return null
  }

  return (
    <div className="mt-12">
      <h3 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <TrendingUp className="w-5 h-5" />
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {tools.map((tool) => (
          <Link key={tool.id} href={`/tools/${tool.slug}`}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  {tool.logo_url ? (
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-muted shrink-0">
                      <Image
                        src={tool.logo_url}
                        alt={`${tool.name} logo`}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {tool.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm truncate">{tool.name}</h4>
                      {tool.featured && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                    </div>
                    {tool.overall_score && (
                      <div className="text-xs text-muted-foreground">
                        {tool.overall_score.toFixed(1)}/10
                      </div>
                    )}
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {tool.description}
                </p>
                
                {tool.category && (
                  <div className="mt-2">
                    <Badge variant="outline" className="text-xs">
                      {tool.category}
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
