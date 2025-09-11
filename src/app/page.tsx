
import { ToolCard } from "@/components/tools/tool-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TrendingUp, Clock, Star, Search, BarChart3, Wrench, Users, MessageSquare } from "lucide-react"
import { OptimizedQueriesService } from "@/lib/services/optimized-queries.service"
import { Footer } from "@/components/layout/footer"
import Link from "next/link"
import Image from "next/image"

// Helper function to ensure data is serializable
function ensureSerializable(data: unknown): unknown {
  try {
    return JSON.parse(JSON.stringify(data))
  } catch (error) {
    console.error('Data serialization error:', error)
    // Return safe fallback
    if (Array.isArray(data)) return []
    if (typeof data === 'object') return {}
    return data
  }
}

// No mock data - we'll use pure Supabase data

export default async function Home() {
  // Fetch data from Supabase
  let trendingTools: unknown[] = []
  let recentTools: unknown[] = []
  let featuredTools: unknown[] = []
  let stats = {
    totalTools: 0,
    totalReviews: 0,
    verifiedTesters: 0,
    totalUsers: 0
  }

  try {
    const [trending, recent, featured, platformStats] = await Promise.all([
      OptimizedQueriesService.getTrendingToolsOptimized(6),
      OptimizedQueriesService.getToolsOptimized({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }),
      OptimizedQueriesService.getFeaturedToolsOptimized(6),
      OptimizedQueriesService.getPlatformStatsOptimized()
    ])

    // Ensure data is properly serialized
    trendingTools = ensureSerializable(trending) as unknown[]
    recentTools = ensureSerializable(recent.tools) as unknown[]
    featuredTools = ensureSerializable(featured) as unknown[]
    stats = ensureSerializable(platformStats) as typeof stats
  } catch (error) {
    console.error('Error fetching data:', error)
    // Empty arrays if database not ready
    trendingTools = []
    recentTools = []
    featuredTools = []
    stats = {
      totalTools: 0,
      totalReviews: 0,
      verifiedTesters: 0,
      totalUsers: 0
    }
  }
  return (
    <div className="min-h-screen bg-background">
      
      {/* Hero Section */}
      <div className="border-b">
        <div className="container py-16 lg:py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight mb-6">
              Discover. Test. Decide.
              <br />
              <span className="text-muted-foreground">The most trusted SaaS review platform.</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Get reviews from <strong className="text-foreground">verified experts</strong> and <strong className="text-foreground">professional testers </strong> 
               who have actually used these tools in real scenarios. Stop guessing, start deciding.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <Button size="lg" className="w-full sm:w-auto">
                Claim Yours
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Become a Verified Tester
              </Button>
            </div>
            
            {/* Product Hunt Integration Notice */}
            <div className="flex justify-center mb-4">
              <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2 text-sm text-orange-800">
                <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
                <span className="font-medium">Powered by Product Hunt API</span>
              </div>
            </div>
            
            {/* Product Hunt Badge */}
            <div className="flex justify-center">
              <a href="https://www.producthunt.com/products/breaktool?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-breaktool" target="_blank">
                <Image 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1014201&theme=dark&t=1757581290980" 
                  alt="Breaktool - Trusted saas reviews by verified experts | Product Hunt" 
                  width={250}
                  height={54}
                />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        {/* Trust Indicators */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-4 md:gap-8 mb-12">
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 md:mb-3">
              {stats.totalTools > 0 ? `${stats.totalTools}+` : '0'}
            </div>
            <div className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">SaaS Tools Reviewed</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 md:mb-3">
              {stats.verifiedTesters > 0 ? `${stats.verifiedTesters}+` : '0'}
            </div>
            <div className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">Verified Expert Testers</div>
          </div>
          <div className="text-center">
            <div className="flex justify-center mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-2 md:mb-3">
              {stats.totalReviews > 0 ? `${stats.totalReviews}+` : '0'}
            </div>
            <div className="text-xs sm:text-sm md:text-base font-medium text-muted-foreground">Trusted Reviews</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4 md:gap-6 mb-12">
          <Link href="/tools" className="group">
            <div className="p-4 md:p-6 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 md:mb-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors w-fit">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold">Advanced Search</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Find tools with advanced filtering, autocomplete, and smart recommendations
              </p>
            </div>
          </Link>
          
          <Link href="/compare" className="group">
            <div className="p-4 md:p-6 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2 md:mb-3">
                <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors w-fit">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                </div>
                <h3 className="text-sm sm:text-base md:text-lg font-semibold">Compare Tools</h3>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Side-by-side comparison of features, ratings, and verdicts
              </p>
            </div>
          </Link>
        </div>



        {/* Tools Tabs */}
        <Tabs defaultValue="trending" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full sm:w-auto grid-cols-3">
              <TabsTrigger value="trending" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Trending</span>
                <span className="sm:hidden">Trend</span>
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="featured" className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                <span className="hidden sm:inline">Featured</span>
                <span className="sm:hidden">Top</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="trending" className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {trendingTools.length > 0 ? (
              trendingTools.map((tool) => (
                <ToolCard
                  key={(tool as { id: string }).id}
                  tool={tool as import('@/types/database').Tool}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No tools available. Please setup the database first.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="recent" className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {recentTools.length > 0 ? (
              recentTools.map((tool) => (
                <ToolCard
                  key={(tool as { id: string }).id}
                  tool={tool as import('@/types/database').Tool}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No recent tools available.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {featuredTools.length > 0 ? (
              featuredTools.map((tool) => (
                <ToolCard
                  key={(tool as { id: string }).id}
                  tool={tool as import('@/types/database').Tool}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">No featured tools available.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Call to Action */}
        <div className="mt-20 text-center">
          <div className="max-w-3xl mx-auto bg-muted/30 rounded-2xl p-8 lg:p-12">
            <h2 className="text-2xl lg:text-3xl font-bold mb-4">Can&apos;t find what you&apos;re looking for?</h2>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Submit a SaaS tool for our expert review team to evaluate, or join our verified tester network.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/tools/submit">
                <Button size="lg" className="w-full sm:w-auto">
                  Submit a Tool
                </Button>
              </Link>
              <Link href="/apply-verification">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Join as Tester
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
